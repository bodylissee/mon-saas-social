import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { limitesDuPlan } from '@/lib/limits'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Style visuel adapté à chaque univers (extrait du début du label catégorie)
function styleParCategorie(categorie: string | null): string {
  if (!categorie) return 'photographie lifestyle moderne et soignée'
  const c = categorie.toLowerCase()
  if (c.includes('commerce')) return 'photographie produit premium façon publicité, mise en scène soignée, fond travaillé'
  if (c.includes('fitness') || c.includes('sport')) return 'photographie sportive dynamique, énergie et mouvement, lumière contrastée'
  if (c.includes('food') || c.includes('restauration')) return 'photographie culinaire alléchante en gros plan, style magazine gastronomique, texture appétissante'
  if (c.includes('mode') || c.includes('beauté')) return 'photographie éditoriale mode façon magazine, esthétique premium et stylée'
  if (c.includes('maison') || c.includes('déco')) return 'photographie d\'intérieur chaleureuse et inspirante, style magazine déco'
  if (c.includes('business') || c.includes('entrepreneur')) return 'photographie corporate épurée et moderne, ambiance professionnelle inspirante'
  if (c.includes('voyage') || c.includes('lifestyle')) return 'photographie de voyage immersive et lumineuse, grand angle évocateur'
  if (c.includes('éducation') || c.includes('formation')) return 'photographie conceptuelle claire et moderne, ambiance studieuse et positive'
  if (c.includes('tech') || c.includes('digital')) return 'photographie tech minimaliste et élégante, éclairage néon subtil, ambiance moderne'
  if (c.includes('bien-être') || c.includes('santé')) return 'photographie sereine et apaisante, lumière douce et naturelle, ambiance zen'
  if (c.includes('immobilier')) return 'photographie architecturale soignée, espaces lumineux et accueillants'
  if (c.includes('artisanat') || c.includes('créateur')) return 'photographie artisanale authentique, gros plan sur les détails et la matière'
  if (c.includes('animaux')) return 'photographie animalière attendrissante et vivante, regard expressif'
  if (c.includes('famille') || c.includes('parentalité')) return 'photographie lifestyle familiale chaleureuse et authentique'
  if (c.includes('auto') || c.includes('moto')) return 'photographie automobile dynamique et léchée, reflets et lignes marquées'
  if (c.includes('événementiel')) return 'photographie d\'événement festive et vivante, ambiance lumineuse et émotion'
  return 'photographie lifestyle moderne et soignée'
}

// Variations de cadrage/composition pour éviter la répétition et varier les slides
const compositions = [
  'gros plan serré sur le sujet principal, faible profondeur de champ, arrière-plan flou',
  'plan large qui met le sujet dans son environnement, composition aérée',
  'vue en plongée (au-dessus), composition graphique et équilibrée',
  'angle dynamique en contre-plongée, sujet mis en valeur avec impact',
  'composition décentrée façon règle des tiers, espace négatif élégant',
  'mise en scène avec accessoires complémentaires autour du sujet',
]

const ambiancesLumiere = [
  'lumière dorée chaleureuse de fin de journée',
  'lumière naturelle vive et éclatante',
  'éclairage studio doux et professionnel',
  'contraste marqué entre ombres et lumières pour un rendu premium',
  'lumière douce et diffuse, ambiance apaisante',
]

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

export async function POST(req: Request) {
  try {
    const { theme, reseau, langue, categorie, nbSlides } = await req.json()

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

    // 2. Images — style adaptatif + variété + rendu scroll-stopper
    const style = styleParCategorie(categorie)
    const imageUrls: string[] = []
    const seed = Math.floor(Math.random() * 1000)

    for (let i = 0; i < slides; i++) {
      const composition = pick(compositions, seed + i)
      const lumiere = pick(ambiancesLumiere, seed + i + 3)
      const variation = slides > 1
        ? ` Image ${i + 1} d'une série de ${slides} : varie nettement l'angle et le cadrage par rapport aux autres images.`
        : ''

      const pointPrecis = slides > 1 ? pointsVisuels[i] : undefined
      const introSujet = pointPrecis
        ? `illustrant précisément : "${pointPrecis}"`
        : `sur le thème : "${theme}"`

      const prompt = `${style}, ${introSujet}.${variation}
Cadrage : ${composition}.
Lumière : ${lumiere}.
Rendu très haute qualité, image accrocheuse pensée pour arrêter le défilement sur les réseaux sociaux (scroll-stopper), couleurs riches et harmonieuses, netteté parfaite sur le sujet, rendu professionnel digne d'une grande marque.
Aucun texte, aucun logo, aucun watermark dans l'image. Pas de style cartoon ni illustration.`

      const imageResponse = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
      })

      const imageBase64 = imageResponse.data?.[0]?.b64_json
      imageUrls.push(`data:image/png;base64,${imageBase64}`)
    }

    return NextResponse.json({
      texte,
      imageUrl: imageUrls[0],
      imageUrls,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}