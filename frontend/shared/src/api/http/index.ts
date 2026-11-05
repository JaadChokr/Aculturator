import type { AppNotification, Catalog, ChatReply, User } from '@acculturator/contracts'
import type { Api } from '../types'
import { get, post } from './client'

/**
 * Implémentation HTTP : à utiliser dès que le backend expose les endpoints
 * décrits dans docs/api-contract.md (activer avec VITE_API_MODE=http).
 */
export const httpApi: Api = {
  auth: {
    getCurrentUser: () => get<User>('/me'),
  },
  content: {
    getCatalog: () => get<Catalog>('/catalog'),
  },
  chat: {
    ask: (question) => post<ChatReply>('/chat', { question }),
    getSuggestions: () => get<string[]>('/chat/suggestions'),
  },
  notifications: {
    list: () => get<AppNotification[]>('/notifications'),
    markRead: (ids) => post<void>('/notifications/read', { ids }),
  },
  progress: {
    track: (event) => post<void>('/progress/events', event),
  },
}
