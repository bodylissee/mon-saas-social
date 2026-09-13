import { NextResponse } from 'next/server'
import { uploadImageToZernio } from '@/lib/zernio'

// Route dédiée à la veille hebdomadaire ProAds.
// Volontairement étroite : un carrousel par appel, comptes limités par VEILLE_ACCOUNT_IDS,
// jamais publié immédiatement (fenêtre de relecture de 24 h minimum dans Zernio).

export const maxDuration = 60

const DELAI_MIN_HEURES = 24
const SLIDES_MIN = 2
const SLIDES_MAX = 10

export async function POST(req: Request) {
  // 1. Secret dédié (différent du CRON_SECRET)
  const auth = req.headers.get('authorization')
  if (!process.env.VEILLE_SECRET || auth !== `Bearer ${process.env.VEILLE_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // 2. Seuls les comptes listés dans VEILLE_ACCOUNT_IDS sont acceptés
  const comptesAutorises = (process.env.VEILLE_ACCOUNT_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }
  const { content, platform, accountId, imagesBase64, scheduledFor } = body

  if (!accountId || !comptesAutorises.includes(accountId)) {
    return NextResponse.json({ error: 'Compte non autorisé pour la veille' }, { status: 403 })
  }
  if (!['instagram', 'tiktok'].includes(platform)) {
    return NextResponse.json({ error: 'Plateforme non autorisée' }, { status: 400 })
  }
  if (typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Légende manquante' }, { status: 400 })
  }
  if (!Array.isArray(imagesBase64) || imagesBase64.length < SLIDES_MIN || imagesBase64.length > SLIDES_MAX) {
    return NextResponse.json(
      { error: `Un carrousel = ${SLIDES_MIN} à ${SLIDES_MAX} images` },
      { status: 400 }
    )
  }

  // 3. Date de publication obligatoire, et au moins 24 h dans le futur
  const date = new Date(scheduledFor)
  if (isNaN(date.getTime()) || date.getTime() - Date.now() < DELAI_MIN_HEURES * 3600 * 1000) {
    return NextResponse.json(
      { error: `scheduledFor doit être au moins ${DELAI_MIN_HEURES} h dans le futur` },
      { status: 400 }
    )
  }

  try {
    // 4. Upload des slides (déjà au bon format : on ne redimensionne pas)
    const mediaItems = await Promise.all(
      imagesBase64.map(async (b64: string) => ({
        type: 'image',
        url: await uploadImageToZernio(b64),
      }))
    )

    // 5. Programmation sur Zernio (pas de publishNow)
    const res = await fetch('https://zernio.com/api/v1/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ZERNIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        platforms: [{ platform, accountId }],
        mediaItems,
        scheduledFor: date.toISOString(),
        timezone: 'UTC',
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: 502 })
    }
    return NextResponse.json({ success: true, post: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
