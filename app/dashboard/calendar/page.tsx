'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const reseaux = ['TikTok', 'Instagram', 'Facebook', 'YouTube', 'LinkedIn', 'X (Twitter)']

const plateformeMap: { [key: string]: string } = {
  'TikTok': 'tiktok',
  'Instagram': 'instagram',
  'Facebook': 'facebook',
  'YouTube': 'youtube',
  'LinkedIn': 'linkedin',
  'X (Twitter)': 'twitter',
}

const categories = [
  { label: '🛍️ E-commerce', themes: ['Nouveau produit', 'Promotion / Soldes', 'Avis client', 'Livraison rapide', 'Produit tendance', 'Offre limitée', 'Best-seller'] },
  { label: '💪 Fitness & Sport', themes: ['Motivation du matin', 'Conseil nutrition', 'Exercice du jour', 'Transformation physique', 'Routine sportive', 'Objectif fitness'] },
  { label: '🍔 Food & Restauration', themes: ['Recette rapide', 'Plat du jour', 'Conseil nutrition', 'Snack healthy', 'Menu spécial', 'Produit local'] },
  { label: '👗 Mode & Beauté', themes: ['Nouvelle collection', 'Tenue du jour', 'Conseil style', 'Skincare routine', 'Tendance saison', 'Makeup du jour'] },
  { label: '🏠 Maison & Déco', themes: ['Idée déco', 'DIY maison', 'Rangement astucieux', 'Ambiance cozy', 'Chambre tendance'] },
  { label: '💼 Business', themes: ['Conseil business', 'Productivité', 'Mindset entrepreneur', 'Success story', 'Marketing tip'] },
  { label: '✈️ Voyage & Lifestyle', themes: ['Destination coup de cœur', 'Conseil voyage', 'Budget voyage', 'Solo travel', 'Street food'] },
  { label: '🎓 Education', themes: ['Astuce du jour', 'Fait insolite', 'Citation inspirante', 'Tutoriel rapide', 'Conseil pro'] },
]

const joursNoms = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

type ScheduledPost = {
  id: string
  theme: string
  reseau: string
  scheduled_at: string
  status: string
}

export default function CalendarPage() {
  const [mode, setMode] = useState<'semaine' | 'unique'>('semaine')
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [reseau, setReseau] = useState('Instagram')
  const [heurePublication, setHeurePublication] = useState('09:00')
  const [dateDebut, setDateDebut] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [themesParJour, setThemesParJour] = useState<(string | null)[]>(Array(7).fill(null))
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const router = useRouter()

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const res = await fetch('/api/schedule')
    const data = await res.json()
    if (data.posts) setPosts(data.posts)
  }

  const setThemeJour = (index: number, theme: string) => {
    const updated = [...themesParJour]
    updated[index] = updated[index] === theme ? null : theme
    setThemesParJour(updated)
  }

  const handleScheduleSemaine = async () => {
    if (!dateDebut) return
    setLoading(true)
    setSuccess(false)
    let count = 0

    for (let i = 0; i < 7; i++) {
      const theme = themesParJour[i]
      if (!theme) continue

      const [year, month, day] = dateDebut.split('-').map(Number)
      const [heure, minute] = heurePublication.split(':').map(Number)
      const date = new Date(year, month - 1, day + i, heure, minute, 0, 0)

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          reseau,
          platform: plateformeMap[reseau],
          accountId: process.env.NEXT_PUBLIC_ZERNIO_ACCOUNT_ID,
          scheduledAt: date.toISOString(),
        }),
      })
      const data = await res.json()
      if (data.success) count++
    }

    setSuccessCount(count)
    setSuccess(true)
    setThemesParJour(Array(7).fill(null))
    setDateDebut('')
    fetchPosts()
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    if (status === 'published') return '#059669'
    if (status === 'failed') return '#DC2626'
    return '#F59E0B'
  }

  const getStatusLabel = (status: string) => {
    if (status === 'published') return '✅ Publié'
    if (status === 'failed') return '❌ Échoué'
    return '⏳ En attente'
  }

  return (
    <main className="min-h-screen" style={{ background: '#0F172A' }}>
      <header className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #1E293B' }}>
        <div className="text-xl font-bold">
          <span style={{ color: '#2563EB' }}>Post</span><span style={{ color: '#EC4899' }}>IA</span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-sm" style={{ color: '#94A3B8' }}>
          ← Retour au dashboard
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Calendrier de publication</h1>
        <p className="mb-6" style={{ color: '#64748B' }}>Programme tes posts à l'avance</p>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setMode('semaine')}
            className="px-6 py-3 rounded-xl text-sm font-medium"
            style={mode === 'semaine'
              ? { background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }
              : { background: '#1E293B', color: '#64748B', border: '1px solid #334155' }
            }
          >
            📅 Programmer une semaine
          </button>
          <button
            onClick={() => setMode('unique')}
            className="px-6 py-3 rounded-xl text-sm font-medium"
            style={mode === 'unique'
              ? { background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }
              : { background: '#1E293B', color: '#64748B', border: '1px solid #334155' }
            }
          >
            ➕ Post unique
          </button>
        </div>

        {mode === 'semaine' && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-lg font-bold text-white mb-6">📅 Programmer une semaine complète</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>Date de début</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none"
                  style={{ background: '#0F172A', border: '1px solid #334155' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>Heure de publication</label>
                <input
                  type="time"
                  value={heurePublication}
                  onChange={(e) => setHeurePublication(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none"
                  style={{ background: '#0F172A', border: '1px solid #334155' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>Réseau social</label>
                <div className="flex flex-wrap gap-1">
                  {reseaux.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReseau(r)}
                      className="px-2 py-1 rounded-lg text-xs"
                      style={reseau === r
                        ? { background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }
                        : { background: '#0F172A', color: '#64748B', border: '1px solid #334155' }
                      }
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>Catégorie de thèmes</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className="px-3 py-1 rounded-lg text-xs"
                    style={selectedCategory === cat.label
                      ? { background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }
                      : { background: '#0F172A', color: '#64748B', border: '1px solid #334155' }
                    }
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {joursNoms.map((jour, i) => (
                <div key={jour} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-20 shrink-0" style={{ color: '#94A3B8' }}>{jour}</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {selectedCategory && categories.find(c => c.label === selectedCategory)?.themes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setThemeJour(i, t)}
                        className="px-2 py-1 rounded-lg text-xs"
                        style={themesParJour[i] === t
                          ? { background: '#EC4899', color: 'white' }
                          : { background: '#0F172A', color: '#64748B', border: '1px solid #334155' }
                        }
                      >
                        {t}
                      </button>
                    ))}
                    {!selectedCategory && (
                      <span className="text-xs" style={{ color: '#334155' }}>← Choisis d'abord une catégorie</span>
                    )}
                  </div>
                  {themesParJour[i] && (
                    <span className="text-xs px-2 py-1 rounded-lg shrink-0" style={{ background: '#EC489920', color: '#EC4899' }}>
                      ✓ {themesParJour[i]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {success && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: '#ECFDF5', color: '#059669' }}>
                ✅ {successCount} post(s) programmé(s) avec succès !
              </div>
            )}

            <button
              onClick={handleScheduleSemaine}
              disabled={loading || !dateDebut || themesParJour.every(t => t === null)}
              className="w-full py-3 rounded-xl font-medium text-white"
              style={{ background: loading || !dateDebut || themesParJour.every(t => t === null) ? '#334155' : 'linear-gradient(135deg, #2563EB, #DB2777)' }}
            >
              {loading ? '⏳ Programmation en cours...' : '📅 Programmer toute la semaine'}
            </button>
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-white mb-4">📋 Posts programmés ({posts.length})</h2>
          {posts.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: '#1E293B', border: '1px solid #334155' }}>
              <p style={{ color: '#64748B' }}>Aucun post programmé pour l'instant</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {posts.map((post) => (
                <div key={post.id} className="rounded-2xl p-4" style={{ background: '#1E293B', border: '1px solid #334155' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white text-sm font-medium">{post.theme}</p>
                      <p className="text-xs mt-1" style={{ color: '#64748B' }}>{post.reseau}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#0F172A', color: getStatusColor(post.status) }}>
                      {getStatusLabel(post.status)}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#64748B' }}>
                    📅 {new Date(post.scheduled_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}