import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { limitesDuPlan } from '@/lib/limits'
import { redimensionnerEtUpload } from '@/lib/zernio'
import { construirePromptImage } from '@/lib/imagePrompt'

// Autorise la fonction à tourner plus longtemps que les 10s par défaut :
// un carrousel génère puis uploade plusieurs images vers Zernio.
export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const { theme, reseau, langue, categorie, nbSlides, etape } = await req.json()

    let slides = parseInt(nbSlides) || 1
    if (slides < 1) slides = 1
    if (slides > 5) slides = 5

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

      if (slides > 1 && !limites.carrousels) {
        return NextResponse.json(
          { error: "Les carrousels sont réservés aux plans Pro et supérieurs." },
          { status: 403 }
        )
      }

      if (slides > limites.maxSlides) {
        slides = limites.maxSlides
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

      if ((publies ?? 0) + (enAttente ?? 0) + slides > limites.postsParMois) {
        return NextResponse.json(
          {
            error: `Tu as atteint ta limite de ${limites.postsParMois} posts ce mois-ci (un carrousel compte pour ${slides} posts). Passe au plan supérieur.`,
          },
          { status: 403 }
        )
      }
    }

    const contexteCategorie = categorie
      ? `\n        CONTEXTE MÉTIER : Ce post est pour un compte dans l'univers "${categorie.replace(/^[^\s]+\s/, '')}". Adapte le vocabulaire, les exemples et les hashtags à ce secteur précis.`
      : ''

    // 1. Texte
    const textResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Tu es un expert en marketing sur les réseaux sociaux avec 10 ans d'expérience.
        Crée un post ${reseau} viral sur le thème : "${theme}".
        Langue : ${langue || 'français'}.${contexteCategorie}
        ${slides > 1 ? `Ce post est un CARROUSEL de ${slides} images. Rédige une légende engageante qui donne envie de faire défiler les images.` : ''}
        
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

    // 1bis. Pour un carrousel, découper le contenu en points visuels distincts (1 par slide)
    let pointsVisuels: string[] = []
    if (slides > 1) {
      try {
        const decoupageResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `Voici un post ${reseau} sur le thème "${theme}" :
"""
${texte}
"""

Ce post sera publié en carrousel de ${slides} images. Découpe le contenu en exactement ${slides} étapes ou points DISTINCTS et concrets (une par slide), dans l'ordre logique du post (étape 1, étape 2... ou point 1, point 2...).

Pour chaque point, décris en une phrase courte et concrète CE QUE L'IMAGE DOIT MONTRER visuellement. Règles impératives pour chaque description :
- Montre TOUJOURS une personne en train de FAIRE l'action de cette étape précise (ex : applique le produit sur son visage, masse sa peau, tient le tube ouvert près de sa bouche) — jamais un simple objet ou produit posé seul sans personne ni geste.
- Sois aussi concret que l'étape le permet (le geste exact, la zone du corps concernée), pas une reformulation abstraite du thème général.
- Garde une cohérence de sujet entre les slides (même type de personne/décor) pour que le carrousel ait un fil visuel cohérent, seule l'action/l'étape change.

Réponds UNIQUEMENT avec un JSON valide : un tableau de ${slides} chaînes de caractères, sans aucun texte autour. Exemple : ["description image 1", "description image 2"]`
          }]
        })

        const decoupageTexte = decoupageResponse.content[0].type === 'text'
          ? decoupageResponse.content[0].text
          : '[]'

        const jsonMatch = decoupageTexte.match(/\[[\s\S]*\]/)
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : decoupageTexte)
        if (Array.isArray(parsed) && parsed.length > 0) {
          pointsVisuels = parsed.slice(0, slides).map((p: any) => String(p))
        }
      } catch {
        pointsVisuels = [] // fallback silencieux : chaque image utilisera le thème général
      }
    }

    const seed = Math.floor(Math.random() * 1000)

    // Étape "préparation" (flux découpé, utilisé par l'interface) : on renvoie
    // le texte + les points visuels sans générer d'images. Le navigateur
    // appellera ensuite /api/generate-image une fois par slide — chaque requête
    // reste ainsi largement sous la limite de 60s de Vercel (fini les 504),
    // sans toucher à la qualité des images.
    if (etape === 'preparation') {
      return NextResponse.json({
        texte,
        pointsVisuels,
        slides,
        seed,
      })
    }

    // Flux complet (rétrocompatibilité, notamment pour le cron) : génération
    // + upload Zernio en parallèle pour chaque slide. On ne renvoie QUE des
    // URLs (pas de base64) pour rester sous la limite de 4.5 Mo de Vercel.
    const imageUrls: string[] = await Promise.all(
      Array.from({ length: slides }, async (_, i) => {
        const prompt = construirePromptImage({
          theme,
          categorie,
          slides,
          index: i,
          seed,
          pointPrecis: slides > 1 ? pointsVisuels[i] : undefined,
        })

        const imageResponse = await openai.images.generate({
          model: 'gpt-image-1',
          prompt,
          n: 1,
          size: '1024x1024',
        })

        const imageBase64 = `data:image/png;base64,${imageResponse.data?.[0]?.b64_json}`
        return redimensionnerEtUpload(imageBase64, reseau)
      })
    )

    return NextResponse.json({
      texte,
      imageUrl: imageUrls[0],
      imageUrls,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}