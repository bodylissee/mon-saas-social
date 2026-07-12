import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { limitesDuPlan } from '@/lib/limits'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { theme, reseau, langue, categorie } = await req.json()

    // VERIFICATION DU PLAN (avant tout appel IA payant)
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

      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const debutDuMois = new Date()
      debutDuMois.setDate(1)
      debutDuMois.setHours(0, 0, 0, 0)

      const { count: publies } = await admin
        .from('scheduled_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'published')
        .gte('published_at', debutDuMois.toISOString())

      const { count: enAttente } = await admin
        .from('scheduled_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending')

      if ((publies ?? 0) + (enAttente ?? 0) >= limites.postsParMois) {
        return NextResponse.json(
          {
            error: `Tu as atteint ta limite de ${limites.postsParMois} posts ce mois-ci. Passe au plan supérieur.`,
          },
          { status: 403 }
        )
      }
    }

    const contexteCategorie = categorie
      ? `\n        CONTEXTE MÉTIER : Ce post est pour un compte dans l'univers "${categorie.replace(/^[^\s]+\s/, '')}". Adapte le vocabulaire, les exemples et les hashtags à ce secteur précis.`
      : ''

    const textResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Tu es un expert en marketing sur les réseaux sociaux avec 10 ans d'expérience.
        Crée un post ${reseau} viral sur le thème : "${theme}".
        Langue : ${langue || 'français'}.${contexteCategorie}
        
        RÈGLES IMPORTANTES :
        - Commence par un hook accrocheur qui capte l'attention en 2 secondes
        - Donne des conseils CONCRETS, des chiffres précis, des exemples réels
        - Évite les généralités — sois spécifique et actionnable
        - Utilise un ton authentique et personnel, pas corporatif
        - Ajoute une question engageante à la fin pour provoquer des commentaires
        - Maximum 5 hashtags très ciblés (pas génériques)
        - Adapte le format au réseau : ${reseau === 'TikTok' ? 'court et punchy, max 150 mots' : reseau === 'LinkedIn' ? 'professionnel et storytelling, 200-300 mots' : 'engageant et visuel, 100-200 mots'}
        
        Réponds uniquement avec le texte du post, rien d'autre.`
      }]
    })

    const texte = textResponse.content[0].type === 'text'
      ? textResponse.content[0].text
      : ''

    const imageResponse = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: `Photographie réaliste et naturelle pour un post ${reseau} sur le thème : ${theme}${categorie ? ` (univers : ${categorie.replace(/^[^\s]+\s/, '')})` : ''}. Style photo authentique, lumière naturelle, couleurs douces et réalistes, comme une vraie photo prise par un photographe professionnel. Pas de texte dans l'image, pas de style illustration ou cartoon.`,
      n: 1,
      size: '1024x1024',
    })

    const imageBase64 = imageResponse.data?.[0]?.b64_json
    const imageUrl = `data:image/png;base64,${imageBase64}`

    return NextResponse.json({ texte, imageUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}