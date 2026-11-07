/**
 * Parcours d'acculturation (ex. Santé & Sécurité au Travail).
 * La plateforme peut en proposer plusieurs : le catalogue, l'assistant et la progression
 * sont propres à chaque parcours (endpoints /api/parcours/:id/…).
 */
export type ParcoursStatus = 'available' | 'coming_soon'

export interface Parcours {
  /** Identifiant stable, utilisé dans les URL de l'API (ex. « sst ») */
  id: string
  title: string
  /** Libellé court (en-tête, menus) */
  shortTitle: string
  description: string
  status: ParcoursStatus
  /** Chiffres affichés sur la carte du parcours */
  stats: {
    themes: number
    resources: number
    flashcards: number
    quizQuestions: number
  }
}
