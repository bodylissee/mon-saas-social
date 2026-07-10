'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setEmail(user.email || '')
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <main className="min-h-screen" style={{ background: '#0F172A' }}>
      <header className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #1E293B' }}>
        <div className="text-xl font-bold">
          <span style={{ color: '#2563EB' }}>Post</span><span style={{ color: '#EC4899' }}>IA</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: '#64748B' }}>{email}</span>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-lg"
            style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid #334155' }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Bonjour 👋</h1>
        <p className="mb-10" style={{ color: '#64748B' }}>Bienvenue sur ton dashboard PostIA</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Posts publiés', value: '0', color: '#2563EB' },
            { label: 'Réseaux connectés', value: '0', color: '#EC4899' },
            { label: 'Plan actuel', value: 'Starter', color: '#2563EB' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6" style={{ background: '#1E293B', border: '1px solid #334155' }}>
              <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-sm" style={{ color: '#64748B' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="rounded-2xl p-8 text-center cursor-pointer hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1E3A8A, #1E293B)', border: '2px solid #2563EB' }}
            onClick={() => router.push('/dashboard/generate')}
          >
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-xl font-bold text-white mb-2">Générer un post</h2>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>L'IA crée le texte et l'image pour toi en quelques secondes</p>
            <button
              className="px-6 py-3 rounded-xl font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)' }}
            >
              ✨ Créer un post
            </button>
          </div>

          <div
            className="rounded-2xl p-8 text-center cursor-pointer hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', border: '2px solid #EC4899' }}
            onClick={() => router.push('/dashboard/calendar')}
          >
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-xl font-bold text-white mb-2">Calendrier</h2>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>Programme tes posts à l'avance sur tous tes réseaux</p>
            <button
              className="px-6 py-3 rounded-xl font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #DB2777, #2563EB)' }}
            >
              📅 Programmer
            </button>
          </div>

          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: '#1E293B', border: '1px solid #334155' }}
          >
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="text-xl font-bold text-white mb-2">Connecter un réseau</h2>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>Relie TikTok, Instagram ou Facebook pour publier automatiquement</p>
            <button
              className="px-6 py-3 rounded-xl font-medium"
              style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}
            >
              + Connecter un réseau
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}