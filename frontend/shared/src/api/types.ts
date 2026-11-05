import type {
  AppNotification,
  Catalog,
  ChatReply,
  LearningEvent,
  Role,
  User,
} from '@acculturator/contracts'

/**
 * Contrats des services consommés par les portails.
 * Les pages ne connaissent que ces interfaces : passer des données de démonstration
 * au vrai backend ne change que l'implémentation sélectionnée dans `api/index.ts`.
 */
export interface AuthApi {
  /** Utilisateur connecté (SSO en production). */
  getCurrentUser(): Promise<User>
  /** Démo uniquement : changer de profil pour visiter les autres portails. */
  switchDemoRole?(role: Role): Promise<void>
}

export interface ContentApi {
  /** Catalogue pédagogique (ressources, flashcards, questions, scènes). */
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
  content: ContentApi
  chat: ChatApi
  notifications: NotificationsApi
  progress: ProgressApi
}
