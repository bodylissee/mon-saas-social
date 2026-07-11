// Limites par plan PostIA
export const LIMITES_PAR_PLAN: {
  [plan: string]: { reseaux: number; postsParMois: number }
} = {
  free: { reseaux: 0, postsParMois: 0 },
  starter: { reseaux: 1, postsParMois: 15 },
  solo: { reseaux: 2, postsParMois: 60 },
  pro: { reseaux: 3, postsParMois: 150 },
  business: { reseaux: 5, postsParMois: 400 },
  agency: { reseaux: 10, postsParMois: 999999 },
}

export function limitesDuPlan(plan: string | null | undefined) {
  return LIMITES_PAR_PLAN[plan ?? 'free'] ?? LIMITES_PAR_PLAN.free
}