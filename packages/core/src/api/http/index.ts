import type {
  AppNotification,
  Catalog,
  ChatReply,
  Parcours,
  Role,
  User,
} from '@acculturator/contracts'
import { currentParcoursId } from '../../parcours/store'
import type { Api } from '../types'
import { get, post } from './client'

const DEMO_ROLE_SWITCHER = import.meta.env.VITE_DEMO_ROLE_SWITCHER === 'true'

/** Chemin limité au parcours en cours : /parcours/:id/… */
const inParcours = (path: string) => `/parcours/${encodeURIComponent(currentParcoursId())}${path}`

/** Endpoints décrits dans docs/api-contract.md. */
export const httpApi: Api = {
  auth: {
    getCurrentUser: () => get<User>('/me'),
    // Démo uniquement (servi par mock-server, hors contrat de production)
    ...(DEMO_ROLE_SWITCHER && {
      switchDemoRole: (role: Role) => post<void>('/demo/role', { role }),
    }),
  },
  parcours: {
    list: () => get<Parcours[]>('/parcours'),
  },
  content: {
    getCatalog: async () => get<Catalog>(inParcours('/catalog')),
  },
  chat: {
    ask: async (question) => post<ChatReply>(inParcours('/chat'), { question }),
    getSuggestions: async () => get<string[]>(inParcours('/chat/suggestions')),
  },
  notifications: {
    list: () => get<AppNotification[]>('/notifications'),
    markRead: (ids) => post<void>('/notifications/read', { ids }),
  },
  progress: {
    track: async (event) => post<void>(inParcours('/progress/events'), event),
  },
}
