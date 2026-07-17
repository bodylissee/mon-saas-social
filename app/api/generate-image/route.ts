import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { limitesDuPlan } from '@/lib/limits'
import { redimensionnerEtUpload } from '@/lib/zernio'
import { construirePromptImage } from '@/lib/imagePrompt'

// Génère UNE seule image par requête (flux découpé) : chaque appel reste
// largement sous la limite de 60s de Vercel, quelle que soit la qualité.
export const maxDuration = 60

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { theme, reseau, categorie, slides, index, seed, pointPrecis } = await req.json()

    if (!theme) {
      return NextResponse.json({ error: 'Thème manquant' }, { status: 400 })
    }

    const nbSlides = parseInt(slides) || 1
    const i = parseInt(index) || 0

    // Auth : utilisateur connecté (le quota complet a déjà été vérifié à
    // l'étape "préparation" de /api/generate ; ici on revérifie le plan
    // pour empêcher un appel direct hors carrousel autorisé).
    const authHeader = req.headers.get('authorization')
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`

    if (!isCron) {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
      )

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

      const limites = limitesDuPlan(profile?.plan)

      if (limites.postsParMois === 0) {
        return NextResponse.json(
          { error: "Abonne-toi pour générer tes premiers posts." },
          { status: 403 }
        )
      }

      if (nbSlides > 1 && !limites.carrousels) {
        return NextResponse.json(
          { error: "Les carrousels sont réservés aux plans Pro et supérieurs." },
          { status: 403 }
        )
      }
    }

    const prompt = construirePromptImage({
      theme,
      categorie: categorie ?? null,
      slides: nbSlides,
      index: i,
      seed: parseInt(seed) || 0,
      pointPrecis: pointPrecis || undefined,
    })

    const imageResponse = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024',
    })

    const imageBase64 = `data:image/png;base64,${imageResponse.data?.[0]?.b64_json}`
    const imageUrl = await redimensionnerEtUpload(imageBase64, reseau)

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
