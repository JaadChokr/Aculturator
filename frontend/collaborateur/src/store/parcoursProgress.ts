import type { Parcours, ParcoursProgress } from '@acculturator/contracts'
import { anchoredCards, overallMastery } from './insights'
import { savedProgress } from './progress'

/**
 * Avancement dans un parcours, pour la page de choix du parcours. Calculé à partir de la
 * progression enregistrée dans le navigateur, en attendant que le backend le fournisse.
 */
export function parcoursProgress(parcours: Parcours): ParcoursProgress | null {
  const s = savedProgress(parcours.id)
  if (!s) return null
  const days = Object.keys(s.activity).sort()
  return {
    mastery: overallMastery(s, parcours.stats),
    resourcesViewed: s.viewedResources.length,
    cardsAnchored: anchoredCards(s),
    lastActivity: [s.streak.lastDay, days.at(-1)].filter(Boolean).sort().at(-1),
  }
}
