import type { AppNotification, Catalog, ChatReply, Role, User } from '@acculturator/contracts'
import type { Api } from '../types'
import { get, post } from './client'

const DEMO_ROLE_SWITCHER = import.meta.env.VITE_DEMO_ROLE_SWITCHER === 'true'

/** Endpoints décrits dans docs/api-contract.md. */
export const httpApi: Api = {
  auth: {
    getCurrentUser: () => get<User>('/me'),
    // Démo uniquement (servi par mock-server, hors contrat de production)
    ...(DEMO_ROLE_SWITCHER && {
      switchDemoRole: (role: Role) => post<void>('/demo/role', { role }),
    }),
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
