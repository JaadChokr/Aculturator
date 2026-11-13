/**
 * Parcours d'acculturation (ex. Santé & Sécurité au Travail).
 * La plateforme peut en proposer plusieurs : le catalogue, l'assistant et la progression
 * sont propres à chaque parcours (endpoints /api/parcours/:id/…).
 */
export type ParcoursStatus = 'available' | 'coming_soon'

/** Activités qu'un parcours peut proposer (les rubriques correspondantes sont masquées sinon). */
export type ActivityId = 'resources' | 'flashcards' | 'quiz' | 'hazard-hunt' | 'assistant'

/** Identité propre à un parcours : ce qui, dans l'interface, dépend de sa thématique. */
export interface ParcoursBranding {
  /** Icône du parcours : clé de la palette d'icônes du design system (ex. « shield-plus ») */
  icon?: string
  /** Nom de l'assistant (ex. « Prévi ») */
  assistantName: string
  /** Ce sur quoi l'assistant répond (ex. « la santé et la sécurité au travail ») */
  assistantScope: string
  /** Mise en garde sous le champ de l'assistant (limites de ses réponses, vers qui se tourner) */
  assistantDisclaimer?: string
  /** Noms des niveaux de joueur, du premier au dernier (6) ; noms génériques sinon */
  levelTitles?: string[]
}

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
  /** Activités proposées, dans l'ordre du menu */
  activities: ActivityId[]
  branding: ParcoursBranding
  /** Avancement de l'utilisateur connecté ; absent tant qu'il n'a pas commencé */
  progress?: ParcoursProgress
}
