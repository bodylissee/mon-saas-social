import { NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Durée maximale accordée au traitement en arrière-plan.
export const maxDuration = 60

// Lit une réponse d'API en restant lisible même quand ce n'est pas du JSON :
// en cas de plantage ou de dépassement de délai, Vercel renvoie une page
// d'erreur en texte brut, et JSON.parse échoue avec un message incompréhensible.
async function lireReponse(res: Response, source: string) {
  const brut = await res.text()
  try {
    return JSON.parse(brut)
  } catch {
    throw new Error(
      `${source} a répondu ${res.status} en ${res.headers.get('content-type') ?? 'type inconnu'} : ${brut.slice(0, 200)}`
    )
  }
}

// Génère puis publie un post. Les erreurs sont enregistrées en base : c'est le
// seul endroit où l'on pourra les lire, puisque la réponse HTTP est déjà partie.
async function traiterPost(post: any) {
  try {
    const generateRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({
        theme: post.theme,
        reseau: post.reseau,
        langue: 'français',
      }),
    })

    const generated = await lireReponse(generateRes, '/api/generate')
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

    const publishData = await lireReponse(publishRes, '/api/publish')
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
  } catch (err: any) {
    const message = String(err?.message ?? err).slice(0, 500)

    // Si la colonne error_message n'existe pas encore, on retombe sur un
    // simple changement de statut pour ne pas perdre l'information.
    const { error: erreurMaj } = await supabase
      .from('scheduled_posts')
      .update({ status: 'failed', error_message: message })
      .eq('id', post.id)

    if (erreurMaj) {
      await supabase
        .from('scheduled_posts')
        .update({ status: 'failed' })
        .eq('id', post.id)
    }
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const now = new Date()

    const { data: posts, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now.toISOString())

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'Aucun post à publier', count: 0 })
    }

    // On marque immédiatement les posts comme "en cours" : le prochain passage
    // du cron (15 min plus tard) ne doit pas les reprendre alors qu'ils sont
    // encore en train d'être générés, sinon ils seraient publiés en double.
    const ids = posts.map((p) => p.id)
    await supabase
      .from('scheduled_posts')
      .update({ status: 'processing' })
      .in('id', ids)

    // Le vrai travail se fait APRÈS l'envoi de la réponse : générer un texte,
    // une image puis publier prend bien plus que les 30 s au bout desquelles
    // cron-job.org coupe la connexion et considère l'appel en échec.
    after(async () => {
      for (const post of posts) {
        await traiterPost(post)
      }
    })

    return NextResponse.json({
      message: `${posts.length} post(s) pris en charge, traitement en cours`,
      count: posts.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
