import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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