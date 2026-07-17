// Logique partagée de construction des prompts d'images PostIA.
// Utilisée par /api/generate (flux complet, ex: cron) et /api/generate-image
// (flux découpé en plusieurs requêtes courtes pour éviter les timeouts Vercel).

// Style visuel adapté à chaque univers (extrait du début du label catégorie)
export function styleParCategorie(categorie: string | null): string {
  if (!categorie) return 'photographie lifestyle moderne et soignée'
  const c = categorie.toLowerCase()
  if (c.includes('commerce')) return 'photographie produit premium façon publicité, mise en scène soignée, fond travaillé'
  if (c.includes('fitness') || c.includes('sport')) return 'photographie sportive dynamique, énergie et mouvement, lumière contrastée'
  if (c.includes('food') || c.includes('restauration')) return 'photographie culinaire alléchante en gros plan, style magazine gastronomique, texture appétissante'
  if (c.includes('mode') || c.includes('beauté')) return 'photographie éditoriale mode façon magazine, esthétique premium et stylée'
  if (c.includes('maison') || c.includes('déco')) return 'photographie d\'intérieur chaleureuse et inspirante, style magazine déco'
  if (c.includes('business') || c.includes('entrepreneur')) return 'photographie corporate épurée et moderne, ambiance professionnelle inspirante'
  if (c.includes('voyage') || c.includes('lifestyle')) return 'photographie de voyage immersive et lumineuse, grand angle évocateur'
  if (c.includes('éducation') || c.includes('formation')) return 'photographie conceptuelle claire et moderne, ambiance studieuse et positive'
  if (c.includes('tech') || c.includes('digital')) return 'photographie tech minimaliste et élégante, éclairage néon subtil, ambiance moderne'
  if (c.includes('bien-être') || c.includes('santé')) return 'photographie sereine et apaisante, lumière douce et naturelle, ambiance zen'
  if (c.includes('immobilier')) return 'photographie architecturale soignée, espaces lumineux et accueillants'
  if (c.includes('artisanat') || c.includes('créateur')) return 'photographie artisanale authentique, gros plan sur les détails et la matière'
  if (c.includes('animaux')) return 'photographie animalière attendrissante et vivante, regard expressif'
  if (c.includes('famille') || c.includes('parentalité')) return 'photographie lifestyle familiale chaleureuse et authentique'
  if (c.includes('auto') || c.includes('moto')) return 'photographie automobile dynamique et léchée, reflets et lignes marquées'
  if (c.includes('événementiel')) return 'photographie d\'événement festive et vivante, ambiance lumineuse et émotion'
  return 'photographie lifestyle moderne et soignée'
}

// Variations de cadrage/composition pour éviter la répétition et varier les slides
export const compositions = [
  'gros plan serré sur le sujet principal, faible profondeur de champ, arrière-plan flou',
  'plan large qui met le sujet dans son environnement, composition aérée',
  'vue en plongée (au-dessus), composition graphique et équilibrée',
  'angle dynamique en contre-plongée, sujet mis en valeur avec impact',
  'composition décentrée façon règle des tiers, espace négatif élégant',
  'mise en scène avec accessoires complémentaires autour du sujet',
]

export const ambiancesLumiere = [
  'lumière dorée chaleureuse de fin de journée',
  'lumière naturelle vive et éclatante',
  'éclairage studio doux et professionnel',
  'contraste marqué entre ombres et lumières pour un rendu premium',
  'lumière douce et diffuse, ambiance apaisante',
]

export function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

// Construit le prompt complet d'une image (slide i sur `slides`).
// pointPrecis : description du point visuel de la slide (carrousel narratif) —
// si absent, on retombe sur le thème général (image seule ou fallback).
export function construirePromptImage(params: {
  theme: string
  categorie: string | null
  slides: number
  index: number
  seed: number
  pointPrecis?: string
}): string {
  const { theme, categorie, slides, index, seed, pointPrecis } = params

  const style = styleParCategorie(categorie)
  const composition = pick(compositions, seed + index)
  const lumiere = pick(ambiancesLumiere, seed + index + 3)
  const variation = slides > 1
    ? ` Image ${index + 1} d'une série de ${slides} : varie nettement l'angle et le cadrage par rapport aux autres images.`
    : ''

  const introSujet = pointPrecis
    ? `illustrant précisément : "${pointPrecis}"`
    : `sur le thème : "${theme}"`

  return `${style}, ${introSujet}.${variation}
Cadrage : ${composition}.
Lumière : ${lumiere}.
Rendu très haute qualité, image accrocheuse pensée pour arrêter le défilement sur les réseaux sociaux (scroll-stopper), couleurs riches et harmonieuses, netteté parfaite sur le sujet, rendu professionnel digne d'une grande marque.
Aucun texte, aucun logo, aucun watermark dans l'image. Pas de style cartoon ni illustration.`
}
