import type {
  AppNotification,
  Catalog,
  ChatReply,
  LearningEvent,
  Parcours,
  Role,
  User,
} from '@acculturator/contracts'

/**
 * Services consommés par les portails. Les pages ne connaissent que ces interfaces,
 * implémentées en HTTP selon docs/api-contract.md.
 */
export interface AuthApi {
  /** Utilisateur connecté (SSO en production). */
  getCurrentUser(): Promise<User>
  /** Démo uniquement (VITE_DEMO_ROLE_SWITCHER) : changer de profil pour visiter les autres portails. */
  switchDemoRole?(role: Role): Promise<void>
}

export interface ParcoursApi {
  /** Parcours proposés par la plateforme. */
  list(): Promise<Parcours[]>
}

/** Les services suivants portent sur le parcours en cours (voir `@acculturator/core/parcours`). */
export interface ContentApi {
  /** Catalogue pédagogique du parcours (ressources, flashcards, questions, scènes). */
  getCatalog(): Promise<Catalog>
}

export interface ChatApi {
  ask(question: string): Promise<ChatReply>
  getSuggestions(): Promise<string[]>
}

export interface NotificationsApi {
  list(): Promise<AppNotification[]>
  markRead(ids: string[]): Promise<void>
}

export interface ProgressApi {
  /** Enregistre un événement d'apprentissage (envoi « fire and forget »). */
  track(event: LearningEvent): Promise<void>
}

export interface Api {
  auth: AuthApi
  parcours: ParcoursApi
  content: ContentApi
  chat: ChatApi
  notifications: NotificationsApi
  progress: ProgressApi
}
