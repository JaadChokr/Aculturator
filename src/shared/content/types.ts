/**
 * Modèle de contenu pédagogique — partagé par tous les portails.
 * Le portail admin éditera ces objets, le portail référent en suivra l'usage,
 * le portail collaborateur les consomme.
 */
export type ThemeId = 'fondamentaux' | 'postures' | 'ecran' | 'rps' | 'incendie' | 'secours' | 'routier'

export interface Theme {
  id: ThemeId
  title: string
  short: string
  description: string
  emoji: string
  /** Classes Tailwind statiques (pour la détection au build) */
  tone: { solid: string; soft: string; gradient: string; text: string; ring: string }
}

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

export interface HazardScene {
  id: string
  title: string
  description: string
  hazards: Hazard[]
}

export interface ChatKnowledge {
  id: string
  keywords: string[]
  answer: string
  links?: { label: string; to: string }[]
  themeId?: ThemeId
}
