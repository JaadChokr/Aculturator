export type NotificationKind = 'content' | 'review' | 'badge' | 'team' | 'safety' | 'report'

/** Notification destinée à un utilisateur (endpoint GET /api/notifications). */
export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  /** Lien interne (chemin absolu) ouvert au clic */
  to?: string
  /** Date ISO 8601 */
  createdAt: string
  read: boolean
}
