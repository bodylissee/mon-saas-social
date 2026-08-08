
// Limites par plan PostIA
export const LIMITES_PAR_PLAN: {
  [plan: string]: {
    reseaux: number
    postsParMois: number
    carrousels: boolean
    maxSlides: number
  }
} = {
  free: { reseaux: 0, postsParMois: 0, carrousels: false, maxSlides: 1 },
  starter: { reseaux: 1, postsParMois: 15, carrousels: false, maxSlides: 1 },
  solo: { reseaux: 2, postsParMois: 60, carrousels: false, maxSlides: 1 },
  pro: { reseaux: 3, postsParMois: 150, carrousels: true, maxSlides: 5 },
  // Business est désormais l'offre haut de gamme : elle donne accès à tous
  // les réseaux connectables.
  business: { reseaux: 6, postsParMois: 400, carrousels: true, maxSlides: 5 },
  // Agency n'est plus proposé à la vente (retiré de la page tarifs tant que le
  // tableau de bord multi-clients n'existe pas). Conservé ici pour ne pas
  // casser un éventuel abonnement déjà en cours.
  agency: { reseaux: 6, postsParMois: 999999, carrousels: true, maxSlides: 5 },
}

export function limitesDuPlan(plan: string | null | undefined) {
  return LIMITES_PAR_PLAN[plan ?? 'free'] ?? LIMITES_PAR_PLAN.free
}