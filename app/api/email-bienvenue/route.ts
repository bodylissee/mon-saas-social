import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  try {
    // Sécurité : seul un utilisateur connecté peut déclencher SON email
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { data, error } = await resend.emails.send({
      from: 'PostIA <onboarding@resend.dev>',
      to: user.email,
      subject: 'Bienvenue sur PostIA ✨',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">
            <span style="color: #2563EB;">Post</span><span style="color: #EC4899;">IA</span>
          </h1>
          <h2 style="font-size: 20px; color: #0F172A;">Bienvenue ! 👋</h2>
          <p style="color: #334155; line-height: 1.6;">
            Ton compte PostIA est créé. Tu es à deux pas de publier
            automatiquement sur tes réseaux sociaux, tous les jours,
            sans lever le petit doigt.
          </p>
          <p style="color: #334155; line-height: 1.6;">
            <strong>Comment ça marche ?</strong>
          </p>
          <ol style="color: #334155; line-height: 1.8;">
            <li>Choisis ton plan (à partir de 9€/mois)</li>
            <li>Connecte tes réseaux en 2 clics</li>
            <li>L'IA génère et publie tes posts automatiquement</li>
          </ol>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/#pricing"
             style="display: inline-block; margin: 16px 0; padding: 14px 28px; background: linear-gradient(135deg, #2563EB, #DB2777); color: white; text-decoration: none; border-radius: 12px; font-weight: bold;">
            Découvrir les plans →
          </a>
          <p style="color: #94A3B8; font-size: 13px; margin-top: 32px;">
            Une question ? Réponds simplement à cet email.<br/>
            L'équipe PostIA
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('❌ ERREUR RESEND:', error)
      return NextResponse.json({ sent: false, error })
    }

    console.log('✅ Email envoyé, id:', data?.id)
    return NextResponse.json({ sent: true })
  } catch (error: any) {
    console.error('❌ ERREUR EMAIL:', error)
    return NextResponse.json({ sent: false, error: error.message })
  }
}