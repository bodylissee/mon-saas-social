import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    const { data: posts, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now.toISOString())
      .gte('scheduled_at', fiveMinutesAgo.toISOString())

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'Aucun post à publier', count: 0 })
    }

    let published = 0

    for (const post of posts) {
      try {
        const generateRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: post.theme,
            reseau: post.reseau,
            langue: 'français',
          }),
        })

        const generated = await generateRes.json()
        if (generated.error) throw new Error(generated.error)

        const publishRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({
            content: generated.texte,
            platform: post.platform,
            accountId: post.account_id,
            imageBase64: generated.imageUrl,
          }),
        })

        const publishData = await publishRes.json()
        if (publishData.error) throw new Error(publishData.error)

        await supabase
          .from('scheduled_posts')
          .update({
            status: 'published',
            texte: generated.texte,
            image_url: generated.imageUrl,
            published_at: new Date().toISOString(),
          })
          .eq('id', post.id)

        published++
      } catch (err: any) {
        await supabase
          .from('scheduled_posts')
          .update({ status: 'failed' })
          .eq('id', post.id)
      }
    }

    return NextResponse.json({ message: `${published} post(s) publiés`, count: published })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}