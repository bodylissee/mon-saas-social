import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { limitesDuPlan } from '@/lib/limits'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { theme, reseau, platform, scheduledAt } = await req.json()

    // VERIFICATION DE LA LIMITE DE POSTS (publiés + déjà programmés ce mois)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const limites = limitesDuPlan(profile?.plan)

    const debutDuMois = new Date()
    debutDuMois.setDate(1)
    debutDuMois.setHours(0, 0, 0, 0)

    const { count: publies } = await supabase
      .from('scheduled_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'published')
      .gte('published_at', debutDuMois.toISOString())

    const { count: enAttente } = await supabase
      .from('scheduled_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending')

    const total = (publies ?? 0) + (enAttente ?? 0)

    if (total >= limites.postsParMois) {
      const message =
        limites.postsParMois === 0
          ? "Abonne-toi pour programmer tes premiers posts."
          : `Tu as atteint ta limite de ${limites.postsParMois} posts ce mois-ci (publiés + programmés). Passe au plan supérieur.`
      return NextResponse.json({ error: message }, { status: 403 })
    }

    // Récupérer le compte connecté du client pour cette plateforme
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

    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: user.id,
        theme,
        reseau,
        platform,
        account_id: account.zernio_account_id,
        scheduled_at: scheduledAt,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ posts: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}