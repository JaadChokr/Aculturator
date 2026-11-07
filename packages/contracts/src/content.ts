/**
 * Modèle de contenu pédagogique : ce que le backend fournira (catalogue).
 * Le portail admin éditera ces objets, le portail référent en suivra l'usage,
 * le portail collaborateur les consomme.
 */

export type ThemeId =
  'fondamentaux' | 'postures' | 'ecran' | 'rps' | 'incendie' | 'secours' | 'routier'

export type ResourceType = 'video' | 'fiche' | 'infographie' | 'podcast'

export interface CheckQuestion {
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface Resource {
  id: string
  themeId: ThemeId
  type: ResourceType
  title: string
  summary: string
  durationMin: number
  keyPoints: string[]
  /** URL du média (vidéo/podcast/pdf) — vide en démo */
  mediaUrl?: string
  mandatory?: boolean
  isNew?: boolean
  /** Question de vérification après consultation (pilier « engagement actif ») */
  check?: CheckQuestion
}

export interface Flashcard {
  id: string
  themeId: ThemeId
  front: string
  back: string
  hint?: string
}

export interface QuizQuestion {
  id: string
  themeId: ThemeId
  difficulty: 1 | 2 | 3
  question: string
  options: string[]
  answer: number
  explanation: string
  resourceId?: string
}

export interface Hazard {
  id: string
  /** Coordonnées dans le viewBox 0 0 1000 600 de la scène */
  x: number
  y: number
  r: number
  label: string
  explanation: string
  themeId: ThemeId
}

export interface DecoySpot {
  x: number
  y: number
  r: number
  label: string
  explanation: string
}

export interface HazardScene {
  id: string
  title: string
  description: string
  hazards: Hazard[]
  /** Zones sans danger (leurres) : un retour explique pourquoi tout va bien */
  decoys: DecoySpot[]
}

/** Étape d'un module : renvoie vers un contenu existant du catalogue. */
export type ModuleStep =
  | { kind: 'resource'; resourceId: string }
  /** Revoir au moins une fois toutes les flashcards d'une thématique */
  | { kind: 'flashcards'; themeId: ThemeId }
  /** Quiz de validation : réussi à partir de `passRatio` bonnes réponses (0-1) */
  | { kind: 'quiz'; questionIds: string[]; passRatio: number }
  /** Repérer tous les dangers d'une scène */
  | { kind: 'hazard'; sceneId: string }

/** Bloc d'apprentissage : une suite d'étapes, terminée quand toutes le sont. */
export interface LearningModule {
  id: string
  title: string
  description: string
  themeIds: ThemeId[]
  durationMin: number
  steps: ModuleStep[]
}

/** Organisation d'un parcours en modules. */
export interface ModulesPlan {
  /**
   * sequential : chaque module se débloque quand le précédent est terminé ;
   * free : ordre conseillé, sans blocage.
   */
  ordering: 'sequential' | 'free'
  /** Dans l'ordre du parcours */
  modules: LearningModule[]
}

/** Catalogue de contenus d'un parcours (endpoint GET /api/parcours/:id/catalog). */
export interface Catalog {
  resources: Resource[]
  flashcards: Flashcard[]
  quizQuestions: QuizQuestion[]
  hazardScenes: HazardScene[]
  /** Absent si le parcours n'est pas organisé en modules */
  modules?: ModulesPlan
}
