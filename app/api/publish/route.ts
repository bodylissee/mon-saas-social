import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { limitesDuPlan } from '@/lib/limits'
import { redimensionnerEtUpload } from '@/lib/zernio'

// Autorise la fonction à tourner plus longtemps que les 10s par défaut :
// un carrousel doit redimensionner + uploader plusieurs images vers Zernio.
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { content, platform, imageBase64, imagesBase64, accountId: bodyAccountId } = await req.json()

    let accountId: string | null = null

    // Mode 1 : appel du cron (avec le secret) -> on fait confiance à l'accountId fourni
    const authHeader = req.headers.get('authorization')
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`

    if (isCron) {
      accountId = bodyAccountId
      if (!accountId) {
        return NextResponse.json({ error: 'accountId manquant (cron)' }, { status: 400 })
      }
    } else {
      // Mode 2 : client connecté -> on cherche SON compte dans social_accounts
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

      // VERIFICATION DE LA LIMITE DE POSTS
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

      const limites = limitesDuPlan(profile?.plan)

      const debutDuMois = new Date()
      debutDuMois.setDate(1)
      debutDuMois.setHours(0, 0, 0, 0)

      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { count } = await admin
        .from('scheduled_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'published')
        .gte('published_at', debutDuMois.toISOString())

      if ((count ?? 0) >= limites.postsParMois) {
        return NextResponse.json(
          {
            error:
              limites.postsParMois === 0
                ? "Abonne-toi pour publier tes premiers posts."
                : `Tu as atteint ta limite de ${limites.postsParMois} posts ce mois-ci. Passe au plan supérieur pour publier plus.`,
          },
          { status: 403 }
        )
      }

      const { data: account } = await supabase
        .from('social_accounts')
        .select('zernio_account_id')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .single()

      if (!account) {
        return NextResponse.json(
          {
            error:
              'Aucun compte ' +
              platform +
              " connecté. Va dans Mes réseaux pour connecter ton compte.",
          },
          { status: 400 }
        )
      }

      accountId = account.zernio_account_id
    }

    // Rassembler les images : soit un tableau (carrousel), soit une seule
    const images: string[] =
      Array.isArray(imagesBase64) && imagesBase64.length > 0
        ? imagesBase64
        : imageBase64
        ? [imageBase64]
        : []

    let mediaItems: any[] | undefined = undefined

    if (images.length > 0) {
      // Cas normal : /api/generate a déjà redimensionné et uploadé les images,
      // `images` contient donc des URLs Zernio directement utilisables.
      // Cas legacy (ex: anciens appels avec du base64) : on redimensionne
      // et on uploade ici, en parallèle pour rester sous la limite de temps.
      mediaItems = await Promise.all(
        images.map(async (img) => {
          if (/^https?:\/\//.test(img)) {
            return { type: 'image', url: img }
          }
          const publicUrl = await redimensionnerEtUpload(img, platform)
          return { type: 'image', url: publicUrl }
        })
      )
    }

    const body: any = {
      content,
      platforms: [{ platform, accountId }],
      publishNow: true,
    }

    if (mediaItems) body.mediaItems = mediaItems

    const response = await fetch('https://zernio.com/api/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ZERNIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}