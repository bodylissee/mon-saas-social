'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0F172A' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-2">
            <span style={{ color: '#2563EB' }}>Post</span><span style={{ color: '#EC4899' }}>IA</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>Commence gratuitement, sans carte bancaire</p>
        </div>
        <div className="rounded-2xl p-8" style={{ background: '#1E293B', border: '1px solid #334155' }}>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="w-full px-4 py-3 rounded-xl text-white outline-none"
              style={{ background: '#0F172A', border: '1px solid #334155' }}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-white outline-none"
              style={{ background: '#0F172A', border: '1px solid #334155' }}
            />
          </div>
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)' }}
          >
            {loading ? 'Création en cours...' : 'Créer mon compte →'}
          </button>
          <p className="text-center text-sm mt-4" style={{ color: '#64748B' }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: '#2563EB' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  )
}