'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const NOMS_PLANS: { [key: string]: string } = {
  starter: 'Starter',
  solo: 'Solo',
  pro: 'Pro',
  business: 'Business',
  agency: 'Agency',
}

export default function PaiementSuccesPage() {
  const [plan, setPlan] = useState<string | null>(null)
  const [tentatives, setTentatives] = useState(0)
  const router = useRouter()

  // Le webhook Stripe peut prendre quelques secondes :
  // on vérifie le plan toutes les 2 secondes (max 10 fois)
  useEffect(() => {
    if (plan && plan !== 'free') return
    if (tentatives >= 10) return

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/mon-plan')
        const data = await res.json()
        setPlan(data.plan)
      } catch {}
      setTentatives((t) => t + 1)
    }, tentatives === 0 ? 0 : 2000)

    return () => clearTimeout(timer)
  }, [plan, tentatives])

  const planActif = plan && plan !== 'free'

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#0F172A' }}
    >
      <div
        className="rounded-2xl p-10 max-w-lg w-full text-center"
        style={{ background: '#1E293B', border: '1px solid #334155' }}
      >
        {planActif ? (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Bienvenue à bord !
            </h1>
            <p className="text-lg mb-2" style={{ color: '#94A3B8' }}>
              Ton paiement a bien été reçu.
            </p>
            <p className="mb-8" style={{ color: '#94A3B8' }}>
              Ton plan{' '}
              <span className="font-bold" style={{ color: '#EC4899' }}>
                {NOMS_PLANS[plan] ?? plan}
              </span>{' '}
              est maintenant actif ✅
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard/reseaux')}
                className="w-full py-4 rounded-xl font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)' }}
              >
                🔗 Connecter mes réseaux sociaux
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-xl text-sm font-medium"
                style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}
              >
                Aller au dashboard
              </button>
            </div>
          </>
        ) : tentatives >= 10 ? (
          <>
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Paiement reçu, activation en cours...
            </h1>
            <p className="mb-8" style={{ color: '#94A3B8' }}>
              Ton plan sera actif d'ici quelques minutes. Si ce n'est pas le
              cas, contacte-nous.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 rounded-xl font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)' }}
            >
              Aller au dashboard
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6 animate-pulse">✨</div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Activation de ton plan...
            </h1>
            <p style={{ color: '#94A3B8' }}>
              Quelques secondes, on prépare tout pour toi.
            </p>
          </>
        )}
      </div>
    </main>
  )
}