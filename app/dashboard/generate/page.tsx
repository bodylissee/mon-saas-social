'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
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
  { label: '🛍️ E-commerce', themes: ['Nouveau produit', 'Promotion / Soldes', 'Avis client', 'Livraison rapide', 'Produit tendance', 'Offre limitée', 'Best-seller', 'Coulisses de la boutique', 'Comparatif produit', 'Guide cadeaux'] },
  { label: '💪 Fitness & Sport', themes: ['Motivation du matin', 'Conseil nutrition', 'Exercice du jour', 'Transformation physique', 'Routine sportive', 'Objectif fitness', 'Erreur à éviter', 'Récupération et repos', 'Défi de la semaine', 'Mythe fitness à casser'] },
  { label: '🍔 Food & Restauration', themes: ['Recette rapide', 'Plat du jour', 'Conseil nutrition', 'Snack healthy', 'Menu spécial', 'Produit local', 'Coulisses cuisine', 'Accord mets et boissons', 'Astuce de chef', 'Événement au restaurant'] },
  { label: '👗 Mode & Beauté', themes: ['Nouvelle collection', 'Tenue du jour', 'Conseil style', 'Skincare routine', 'Tendance saison', 'Makeup du jour', 'Avant / Après', 'Tuto beauté express', 'Capsule wardrobe', 'Erreur mode à éviter'] },
  { label: '🏠 Maison & Déco', themes: ['Idée déco', 'DIY maison', 'Rangement astucieux', 'Ambiance cozy', 'Chambre tendance', 'Avant / Après déco', 'Petit budget grand effet', 'Plantes d\'intérieur', 'Organisation cuisine'] },
  { label: '💼 Business & Entrepreneuriat', themes: ['Conseil business', 'Productivité', 'Mindset entrepreneur', 'Success story', 'Marketing tip', 'Erreur de débutant', 'Outil indispensable', 'Networking', 'Levée de fonds', 'Équilibre vie pro / perso'] },
  { label: '✈️ Voyage & Lifestyle', themes: ['Destination coup de cœur', 'Conseil voyage', 'Budget voyage', 'Solo travel', 'Street food', 'Lieu secret', 'Check-list valise', 'Voyage en famille', 'Digital nomad'] },
  { label: '🎓 Éducation & Formation', themes: ['Astuce du jour', 'Fait insolite', 'Citation inspirante', 'Tutoriel rapide', 'Conseil pro', 'Livre à lire', 'Méthode d\'apprentissage', 'Question quiz', 'Résumé express'] },
  { label: '💻 Tech & Digital', themes: ['Astuce tech', 'Nouveauté IA', 'Application coup de cœur', 'Raccourci qui change la vie', 'Cybersécurité simple', 'Comparatif d\'outils', 'Tendance digitale', 'Vulgarisation tech'] },
  { label: '🧘 Bien-être & Santé', themes: ['Routine bien-être', 'Gestion du stress', 'Sommeil réparateur', 'Méditation minute', 'Habitude saine', 'Self-care du dimanche', 'Équilibre digital detox', 'Conseil énergie'] },
  { label: '🏢 Immobilier', themes: ['Nouveau bien à vendre', 'Conseil achat', 'Conseil vente', 'Quartier à la loupe', 'Home staging', 'Investissement locatif', 'Erreur d\'acheteur', 'Témoignage client', 'Estimation gratuite'] },
  { label: '🎨 Artisanat & Créateurs', themes: ['Création du jour', 'Coulisses de l\'atelier', 'Processus de fabrication', 'Matières premières', 'Pièce unique', 'Commande personnalisée', 'Marché / Salon à venir', 'Histoire de la marque'] },
  { label: '🐶 Animaux', themes: ['Conseil éducation', 'Santé animale', 'Astuce toilettage', 'Adoption du mois', 'Alimentation animale', 'Jeu et stimulation', 'Photo mignonne du jour', 'Erreur de maître à éviter'] },
  { label: '👶 Famille & Parentalité', themes: ['Astuce parent', 'Activité enfant', 'Organisation familiale', 'Repas des petits', 'Sortie en famille', 'Moment complicité', 'Retour d\'expérience', 'Conseil sommeil bébé'] },
  { label: '🚗 Auto & Moto', themes: ['Nouveau véhicule', 'Conseil entretien', 'Astuce économie carburant', 'Avant / Après detailing', 'Essai du jour', 'Erreur d\'entretien', 'Équipement indispensable', 'Promo atelier'] },
  { label: '🎉 Événementiel', themes: ['Save the date', 'Coulisses de l\'événement', 'Idée déco événement', 'Témoignage de mariés', 'Prestation à la une', 'Conseil organisation', 'Compte à rebours', 'Merci aux participants'] },
]

export default function GeneratePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [customTheme, setCustomTheme] = useState('')
  const [reseau, setReseau] = useState('Instagram')
  const [nbSlides, setNbSlides] = useState(1)
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [result, setResult] = useState<{ texte: string; imageUrls: string[] } | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const [carrouselsAutorises, setCarrouselsAutorises] = useState(false)
  const [maxSlides, setMaxSlides] = useState(1)
  const router = useRouter()

  const theme = selectedTheme || customTheme

  // Récupérer le plan pour savoir si les carrousels sont autorisés
  useEffect(() => {
    fetch('/api/mon-plan')
      .then((r) => r.json())
      .then((d) => {
        const limits: { [k: string]: { carrousels: boolean; maxSlides: number } } = {
          free: { carrousels: false, maxSlides: 1 },
          starter: { carrousels: false, maxSlides: 1 },
          solo: { carrousels: false, maxSlides: 1 },
          pro: { carrousels: true, maxSlides: 5 },
          business: { carrousels: true, maxSlides: 5 },
          agency: { carrousels: true, maxSlides: 5 },
        }
        const conf = limits[d.plan ?? 'free'] ?? limits.free
        setCarrouselsAutorises(conf.carrousels)
        setMaxSlides(conf.maxSlides)
      })
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!theme) return
    setLoading(true)
    setError('')
    setResult(null)
    setCurrentSlide(0)
    setPublished(false)
    setProgress('')

    try {
      // Étape 1 : texte + points visuels (rapide). Le quota est vérifié ici.
      setProgress('Rédaction du texte...')
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          reseau,
          langue: 'français',
          categorie: selectedCategory,
          nbSlides,
          etape: 'preparation',
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setLoading(false)
        setProgress('')
        return
      }

      const slides: number = data.slides || 1
      const pointsVisuels: string[] = data.pointsVisuels || []
      const seed: number = data.seed || 0

      // Étape 2 : une requête courte par image (évite le timeout de 60s
      // de Vercel sur les carrousels, sans baisser la qualité des images).
      let terminees = 0
      setProgress(`Création des images... 0/${slides}`)

      const imageUrls = await Promise.all(
        Array.from({ length: slides }, async (_, i) => {
          const imgRes = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              theme,
              reseau,
              categorie: selectedCategory,
              slides,
              index: i,
              seed,
              pointPrecis: slides > 1 ? pointsVisuels[i] : undefined,
            }),
          })
          const imgData = await imgRes.json()
          if (imgData.error) throw new Error(imgData.error)
          terminees++
          setProgress(`Création des images... ${terminees}/${slides}`)
          return imgData.imageUrl as string
        })
      )

      setResult({ texte: data.texte, imageUrls })
    } catch (e: any) {
      setError(e?.message || 'Une erreur est survenue')
    }
    setLoading(false)
    setProgress('')
  }

  const handlePublish = async () => {
    if (!result || result.imageUrls.length === 0) return
    setPublishing(true)
    setError('')

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: result.texte,
          platform: plateformeMap[reseau],
          imagesBase64: result.imageUrls,
        }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setPublished(true)
    } catch (e) {
      setError('Erreur lors de la publication')
    }
    setPublishing(false)
  }

  const estCarrousel = result && result.imageUrls.length > 1

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

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Générer un post</h1>
        <p className="mb-8" style={{ color: '#64748B' }}>Choisis un thème et l'IA crée ton contenu</p>

        <div className="rounded-2xl p-8 mb-6" style={{ background: '#1E293B', border: '1px solid #334155' }}>

          <div className="mb-6">
            <label className="block text-sm mb-3" style={{ color: '#94A3B8' }}>1. Choisis ta catégorie</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => { setSelectedCategory(cat.label); setSelectedTheme(null) }}
                  className="px-3 py-2 rounded-xl text-sm text-left"
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

          {selectedCategory && (
            <div className="mb-6">
              <label className="block text-sm mb-3" style={{ color: '#94A3B8' }}>2. Choisis ton thème</label>
              <div className="flex flex-wrap gap-2">
                {categories.find(c => c.label === selectedCategory)?.themes.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setSelectedTheme(t); setCustomTheme('') }}
                    className="px-3 py-2 rounded-xl text-sm"
                    style={selectedTheme === t
                      ? { background: '#EC4899', color: 'white' }
                      : { background: '#0F172A', color: '#64748B', border: '1px solid #334155' }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>
              {selectedCategory ? '3. Ou écris ton propre thème' : '2. Ou écris ton propre thème'}
            </label>
            <input
              type="text"
              value={customTheme}
              onChange={(e) => { setCustomTheme(e.target.value); setSelectedTheme(null) }}
              placeholder="Ex: lancement de mon nouveau produit..."
              className="w-full px-4 py-3 rounded-xl text-white outline-none"
              style={{ background: '#0F172A', border: '1px solid #334155' }}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-3" style={{ color: '#94A3B8' }}>
              {selectedCategory ? '4. Choisis le réseau social' : '3. Choisis le réseau social'}
            </label>
            <div className="flex gap-2 flex-wrap">
              {reseaux.map((r) => (
                <button
                  key={r}
                  onClick={() => setReseau(r)}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
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

          {/* Choix du nombre de slides (carrousel) */}
          <div className="mb-8">
            <label className="block text-sm mb-3" style={{ color: '#94A3B8' }}>
              {selectedCategory ? '5. Type de post' : '4. Type de post'}
            </label>
            {carrouselsAutorises ? (
              <div className="flex gap-2 flex-wrap items-center">
                {Array.from({ length: maxSlides }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNbSlides(n)}
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={nbSlides === n
                      ? { background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }
                      : { background: '#0F172A', color: '#64748B', border: '1px solid #334155' }
                    }
                  >
                    {n === 1 ? '1 image' : `${n} slides`}
                  </button>
                ))}
                <span className="text-xs ml-2" style={{ color: '#64748B' }}>
                  Un carrousel compte pour {nbSlides} post{nbSlides > 1 ? 's' : ''} dans ton quota
                </span>
              </div>
            ) : (
              <div className="text-sm p-3 rounded-xl" style={{ background: '#0F172A', color: '#64748B', border: '1px solid #334155' }}>
                📸 Post à 1 image. <span style={{ color: '#EC4899' }}>Les carrousels sont disponibles à partir du plan Pro.</span>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !theme}
            className="w-full py-4 rounded-xl font-medium text-white text-lg"
            style={{ background: loading || !theme ? '#334155' : 'linear-gradient(135deg, #2563EB, #DB2777)' }}
          >
            {loading ? `✨ ${progress || 'Génération en cours...'}` : '✨ Générer mon post'}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl mb-6 text-sm" style={{ background: '#FEF2F2', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {published && (
          <div className="p-4 rounded-xl mb-6 text-sm font-medium" style={{ background: '#ECFDF5', color: '#059669' }}>
            ✅ Post publié avec succès sur {reseau} !
          </div>
        )}

        {result && (
          <div className="rounded-2xl p-8" style={{ background: '#1E293B', border: '1px solid #334155' }}>
            <h2 className="text-xl font-bold text-white mb-6">
              ✅ Ton {estCarrousel ? 'carrousel' : 'post'} est prêt !
            </h2>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm" style={{ color: '#94A3B8' }}>
                  🤖 {estCarrousel ? `Carrousel de ${result.imageUrls.length} images` : 'Image générée par IA'}
                </label>
                {estCarrousel && (
                  <span className="text-xs" style={{ color: '#64748B' }}>
                    Image {currentSlide + 1} / {result.imageUrls.length}
                  </span>
                )}
              </div>

              {/* Aperçu image (avec navigation si carrousel) */}
              <div className="relative">
                <img
                  src={result.imageUrls[currentSlide]}
                  alt={`Slide ${currentSlide + 1}`}
                  className="w-full rounded-xl"
                  style={{ maxHeight: '400px', objectFit: 'cover' }}
                />
                {estCarrousel && (
                  <>
                    <button
                      onClick={() => setCurrentSlide((s) => (s > 0 ? s - 1 : result.imageUrls.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white"
                      style={{ background: 'rgba(15,23,42,0.7)' }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrentSlide((s) => (s < result.imageUrls.length - 1 ? s + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white"
                      style={{ background: 'rgba(15,23,42,0.7)' }}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Petites vignettes */}
              {estCarrousel && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {result.imageUrls.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Vignette ${i + 1}`}
                      onClick={() => setCurrentSlide(i)}
                      className="w-14 h-14 rounded-lg cursor-pointer"
                      style={{
                        objectFit: 'cover',
                        border: currentSlide === i ? '2px solid #EC4899' : '2px solid transparent',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-3" style={{ color: '#94A3B8' }}>Texte du post</label>
              <div
                className="p-4 rounded-xl text-white text-sm leading-relaxed whitespace-pre-wrap"
                style={{ background: '#0F172A', border: '1px solid #334155' }}
              >
                {result.texte}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(result.texte)}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}
              >
                📋 Copier
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}
              >
                🔄 Régénérer
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)' }}
              >
                {publishing ? '⏳...' : `🚀 Publier sur ${reseau}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}