import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const dimensionsParPlateforme: { [key: string]: { width: number; height: number } } = {
  instagram: { width: 1080, height: 1080 },
  tiktok: { width: 1080, height: 1920 },
  facebook: { width: 1200, height: 630 },
  linkedin: { width: 1200, height: 627 },
  youtube: { width: 1280, height: 720 },
  twitter: { width: 1200, height: 675 },
}

async function resizeImageToBase64(
  base64: string,
  width: number,
  height: number
): Promise<string> {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  const sharp = (await import('sharp')).default
  const resized = await sharp(buffer)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .png()
    .toBuffer()

  return `data:image/png;base64,${resized.toString('base64')}`
}

export async function POST(req: Request) {
  try {
    const { content, platform, imageBase64, accountId: bodyAccountId } = await req.json()

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

    let mediaItems = undefined

    if (imageBase64) {
      const dims = dimensionsParPlateforme[platform] || { width: 1080, height: 1080 }
      const resizedImage = await resizeImageToBase64(imageBase64, dims.width, dims.height)

      const presignRes = await fetch('https://zernio.com/api/v1/media/presign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ZERNIO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'post-image.png',
          contentType: 'image/png',
        }),
      })

      const presignData = await presignRes.json()
      const { uploadUrl, publicUrl } = presignData

      const base64Data = resizedImage.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        body: buffer,
      })

      mediaItems = [{ type: 'image', url: publicUrl }]
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