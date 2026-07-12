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

const formatParReseau: { [key: string]: { w: number; h: number; label: string } } = {
  'Instagram': { w: 1080, h: 1080, label: '1:1 Instagram' },
  'TikTok': { w: 1080, h: 1920, label: '9:16 TikTok' },
  'Facebook': { w: 1200, h: 630, label: '16:9 Facebook' },
  'YouTube': { w: 1280, h: 720, label: '16:9 YouTube' },
  'LinkedIn': { w: 1200, h: 627, label: '16:9 LinkedIn' },
  'X (Twitter)': { w: 1200, h: 675, label: '16:9 Twitter' },
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

function ImageCropper({ src, reseau, onConfirm, onCancel }: {
  src: string
  reseau: string
  onConfirm: (croppedBase64: string) => void
  onCancel: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const PREVIEW_SIZE = 400

  const format = formatParReseau[reseau] || { w: 1080, h: 1080, label: '1:1' }
  const ratio = format.w / format.h
  const previewW = ratio >= 1 ? PREVIEW_SIZE : PREVIEW_SIZE * ratio
  const previewH = ratio >= 1 ? PREVIEW_SIZE / ratio : PREVIEW_SIZE

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, previewW, previewH)
    const scale = zoom * Math.max(previewW / img.width, previewH / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, offset.x + (previewW - w) / 2, offset.y + (previewH - h) / 2, w, h)
  }, [zoom, offset, previewW, previewH])

  useEffect(() => {
    const img = new Image()
    img.onload = () => { imgRef.current = img; draw() }
    img.src = src
  }, [src])

  useEffect(() => { draw() }, [draw])

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setDragging(false)

  const handleConfirm = () => {
    const canvas = document.createElement('canvas')
    canvas.width = format.w
    canvas.height = format.h
    const ctx = canvas.getContext('2d')!
    const img = imgRef.current!
    const scalePreview = zoom * Math.max(previewW / img.width, previewH / img.height)
    const scaleOutput = format.w / previewW
    const w = img.width * scalePreview * scaleOutput
    const h = img.height * scalePreview * scaleOutput
    const x = (offset.x + (previewW - img.width * scalePreview) / 2) * scaleOutput
    const y = (offset.y + (previewH - img.height * scalePreview) / 2) * scaleOutput
    ctx.drawImage(img, x, y, w, h)
    onConfirm(canvas.toDataURL('image/png'))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="rounded-2xl p-6 max-w-lg w-full mx-4" style={{ background: '#1E293B', border: '1px solid #334155' }}>
        <h3 className="text-white font-bold text-lg mb-2">Recadrer l'image</h3>
        <p className="text-sm mb-4" style={{ color: '#64748B' }}>
          Format : <span style={{ color: '#EC4899' }}>{format.label}</span> — Glisse et zoome pour ajuster
        </p>

        <div
          className="mx-auto rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ width: previewW, height: previewH, border: '2px solid #2563EB' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas ref={canvasRef} width={previewW} height={previewH} />
        </div>

        <div className="mt-4 mb-6">
          <label className="block text-sm mb-2" style={{ color: '#94A3B8' }}>
            Zoom : {Math.round(zoom * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)' }}
          >
            ✅ Confirmer le recadrage
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GeneratePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [customTheme, setCustomTheme] = useState('')
  const [reseau, setReseau] = useState('Instagram')
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [result, setResult] = useState<{ texte: string; imageUrl: string } | null>(null)
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [rawImage, setRawImage] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const theme = selectedTheme || customTheme
  const activeImage = customImage || result?.imageUrl

  const handleGenerate = async () => {
    if (!theme) return
    setLoading(true)
    setError('')
    setResult(null)
    setCustomImage(null)
    setRawImage(null)
    setPublished(false)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          reseau,
          langue: 'français',
          categorie: selectedCategory,
        }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResult(data)
    } catch (e) {
      setError('Une erreur est survenue')
    }
    setLoading(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setRawImage(base64)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const handlePublish = async () => {
    if (!result || !activeImage) return
    setPublishing(true)
    setError('')

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: result.texte,
          platform: plateformeMap[reseau],
          imageBase64: activeImage,
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

  return (
    <main className="min-h-screen" style={{ background: '#0F172A' }}>

      {showCropper && rawImage && (
        <ImageCropper
          src={rawImage}
          reseau={reseau}
          onConfirm={(cropped) => { setCustomImage(cropped); setShowCropper(false) }}
          onCancel={() => setShowCropper(false)}
        />
      )}

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

          <div className="mb-8">
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

          <button
            onClick={handleGenerate}
            disabled={loading || !theme}
            className="w-full py-4 rounded-xl font-medium text-white text-lg"
            style={{ background: loading || !theme ? '#334155' : 'linear-gradient(135deg, #2563EB, #DB2777)' }}
          >
            {loading ? '✨ Génération en cours...' : '✨ Générer mon post'}
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
            <h2 className="text-xl font-bold text-white mb-6">✅ Ton post est prêt !</h2>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm" style={{ color: '#94A3B8' }}>
                  {customImage ? '🖼️ Ton image personnalisée' : '🤖 Image générée par IA'}
                </label>
                <div className="flex gap-2">
                  {customImage && (
                    <>
                      <button
                        onClick={() => setShowCropper(true)}
                        className="text-xs px-3 py-1 rounded-lg"
                        style={{ background: '#0F172A', color: '#EC4899', border: '1px solid #EC4899' }}
                      >
                        ✂️ Recadrer
                      </button>
                      <button
                        onClick={() => { setCustomImage(null); setRawImage(null) }}
                        className="text-xs px-3 py-1 rounded-lg"
                        style={{ background: '#0F172A', color: '#94A3B8', border: '1px solid #334155' }}
                      >
                        🤖 Image IA
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-3 py-1 rounded-lg font-medium"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #DB2777)', color: 'white' }}
                  >
                    📁 Ma photo
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <img
                src={activeImage}
                alt="Image du post"
                className="w-full rounded-xl"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
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