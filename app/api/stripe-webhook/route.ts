import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Correspondance priceId -> nom du plan
const PLAN_PAR_PRICE: { [key: string]: string } = {
  [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!]: 'starter',
  [process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID!]: 'solo',
  [process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!]: 'pro',
  [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID!]: 'business',
  [process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID!]: 'agency',
}

const NOMS_PLANS: { [key: string]: string } = {
  starter: 'Starter',
  solo: 'Solo',
  pro: 'Pro',
  business: 'Business',
  agency: 'Agency',
}

async function envoyerEmailBienvenuePayant(email: string, plan: string) {
  try {
    await resend.emails.send({
      from: 'PostIA <onboarding@resend.dev>',
      to: email,
      subject: `Bienvenue sur PostIA — ton plan ${NOMS_PLANS[plan] ?? plan} est actif 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">
            <span style="color: #2563EB;">Post</span><span style="color: #EC4899;">IA</span>
          </h1>
          <h2 style="font-size: 20px; color: #0F172A;">Bienvenue à bord ! 🎉</h2>
          <p style="color: #334155; line-height: 1.6;">
            Merci pour ta confiance ! Ton plan <strong>${NOMS_PLANS[plan] ?? plan}</strong> est maintenant actif.
          </p>
          <p style="color: #334155; line-height: 1.6;">
            Voici comment démarrer en 3 étapes :
          </p>
          <ol style="color: #334155; line-height: 1.8;">
            <li><strong>Connecte tes réseaux sociaux</strong> (Instagram, TikTok, Facebook...)</li>
            <li><strong>Génère ton premier post</strong> avec l'IA — choisis un thème, elle s'occupe du reste</li>
            <li><strong>Programme tes publications</strong> et laisse PostIA publier pour toi</li>
          </ol>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reseaux"
             style="display: inline-block; margin: 16px 0; padding: 14px 28px; background: linear-gradient(135deg, #2563EB, #DB2777); color: white; text-decoration: none; border-radius: 12px; font-weight: bold;">
            Connecter mes réseaux →
          </a>
          <p style="color: #94A3B8; font-size: 13px; margin-top: 32px;">
            Une question ? Réponds simplement à cet email.<br/>
            L'équipe PostIA
          </p>
        </div>
      `,
    })
  } catch (e) {
    // L'email ne doit jamais bloquer le webhook
    console.error('Erreur envoi email bienvenue:', e)
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event: Stripe.Event

  // Vérifier que l'appel vient bien de Stripe
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: `Signature invalide: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    // Paiement réussi -> activer le plan
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const email = session.customer_email ?? session.customer_details?.email

      if (email && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const priceId = subscription.items.data[0]?.price.id
        const plan = PLAN_PAR_PRICE[priceId] ?? 'free'

        await supabase
          .from('profiles')
          .update({
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('email', email)

        // Email de bienvenue (ne bloque pas si erreur)
        await envoyerEmailBienvenuePayant(email, plan)
      }
    }

    // Changement de plan (upgrade/downgrade via le portail client)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const priceId = subscription.items.data[0]?.price.id
      const plan = PLAN_PAR_PRICE[priceId] ?? 'free'

      await supabase
        .from('profiles')
        .update({ plan })
        .eq('stripe_subscription_id', subscription.id)
    }

    // Abonnement annulé -> retour au plan free
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription

      await supabase
        .from('profiles')
        .update({
          plan: 'free',
          stripe_subscription_id: null,
        })
        .eq('stripe_subscription_id', subscription.id)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}