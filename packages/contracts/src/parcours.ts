/**
 * Parcours d'acculturation (ex. Santé & Sécurité au Travail).
 * La plateforme peut en proposer plusieurs : le catalogue, l'assistant et la progression
 * sont propres à chaque parcours (endpoints /api/parcours/:id/…).
 */
export type ParcoursStatus = 'available' | 'coming_soon'

/** Avancement de l'utilisateur connecté dans un parcours. */
export interface ParcoursProgress {
  /** Maîtrise globale (0-100), la même que sur le tableau de bord */
  mastery: number
  resourcesViewed: number
  /** Flashcards bien ancrées (revues avec succès sur la durée) */
  cardsAnchored: number
  /** Date ISO (AAAA-MM-JJ) de la dernière activité */
  lastActivity?: string
}

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
  /** Avancement de l'utilisateur connecté ; absent tant qu'il n'a pas commencé */
  progress?: ParcoursProgress
}
