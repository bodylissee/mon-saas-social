import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Essai gratuit : la carte bancaire est exigée dès l'inscription mais n'est
// débitée qu'à la fin de l'essai. C'est ce qui empêche la création de comptes
// d'essai en série (il faudrait une carte différente à chaque fois).
export const JOURS_ESSAI = 3

// Volontairement limité au plan d'entrée : pendant l'essai, un compte peut
// consommer tout son quota mensuel en 3 jours. Starter plafonne à 15 posts
// (~2,50 $ de risque), là où Solo en autoriserait 60 et Agency un nombre illimité.
const PRICE_IDS_AVEC_ESSAI = [
  process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
].filter(Boolean)

export async function POST(req: Request) {
  try {
    const { priceId, userEmail } = await req.json()

    const avecEssai = PRICE_IDS_AVEC_ESSAI.includes(priceId)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      // Toujours collecter la carte, y compris pendant l'essai gratuit
      payment_method_collection: 'always',
      ...(avecEssai
        ? {
            subscription_data: {
              trial_period_days: JOURS_ESSAI,
              trial_settings: {
                end_behavior: { missing_payment_method: 'cancel' as const },
              },
            },
          }
        : {}),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/paiement-succes`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}