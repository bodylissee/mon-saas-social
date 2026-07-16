
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
  business: { reseaux: 5, postsParMois: 400, carrousels: true, maxSlides: 5 },
  agency: { reseaux: 10, postsParMois: 999999, carrousels: true, maxSlides: 5 },
}

export function limitesDuPlan(plan: string | null | undefined) {
  return LIMITES_PAR_PLAN[plan ?? 'free'] ?? LIMITES_PAR_PLAN.free
}