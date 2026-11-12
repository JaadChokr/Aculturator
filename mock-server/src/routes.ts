import type {
  AppNotification,
  Catalog,
  ChatReply,
  LearningEvent,
  Parcours,
  Role,
  User,
} from '@acculturator/contracts'
import { answer } from './chat.ts'
import { notificationsForRole } from './data/notifications.ts'
import { contentOf, PARCOURS } from './data/parcours.ts'
import type { ParcoursContent } from './data/types.ts'
import { DEMO_USERS } from './data/users.ts'
import type { KeyValueStore } from './store.ts'

/**
 * Routes du serveur de démo : une implémentation de référence de docs/api-contract.md.
 * Indépendante du transport : reçoit une Request, renvoie une Response
 * (branchée sur fetch dans le navigateur, sur node:http en local).
 */

const ROLES: Role[] = ['collaborateur', 'referent', 'admin']
const ROLE_KEY = 'acculturator.demo-role'
const READ_KEY = 'acculturator.notifications.read'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const noContent = () => new Response(null, { status: 204 })
const error = (status: number, message: string) => json({ error: message }, status)

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function body<T>(request: Request): Promise<Partial<T> | null> {
  try {
    return (await request.json()) as Partial<T>
  } catch {
    return null
  }
}

export interface MockServerOptions {
  store: KeyValueStore
  /** Simule la latence réseau (désactivable pour les tests). */
  latency?: boolean
}

export function createMockServer({ store, latency = true }: MockServerOptions) {
  const delay = (ms: number) => (latency ? wait(ms) : Promise.resolve())

  const currentUser = (): User => {
    const role = store.get(ROLE_KEY) as Role | null
    return DEMO_USERS[role && ROLES.includes(role) ? role : 'collaborateur']
  }

  const readIds = (userId: string): string[] => {
    try {
      return (JSON.parse(store.get(READ_KEY) ?? '{}') as Record<string, string[]>)[userId] ?? []
    } catch {
      return []
    }
  }

  const saveReadIds = (userId: string, ids: string[]) => {
    let all: Record<string, string[]> = {}
    try {
      all = JSON.parse(store.get(READ_KEY) ?? '{}') as Record<string, string[]>
    } catch {
      /* état corrompu : repartir de zéro */
    }
    all[userId] = ids
    store.set(READ_KEY, JSON.stringify(all))
  }

  type Handler = (request: Request) => Promise<Response>
  const routes: Record<string, Handler> = {
    'GET /parcours': async () => {
      await delay(80)
      return json(PARCOURS satisfies Parcours[])
    },

    'GET /me': async () => {
      await delay(60)
      return json(currentUser() satisfies User)
    },

    // Démo uniquement : changer de profil pour visiter les autres portails (hors contrat).
    'POST /demo/role': async (request) => {
      const role = (await body<{ role: Role }>(request))?.role
      if (!role || !ROLES.includes(role)) return error(400, 'Rôle inconnu')
      store.set(ROLE_KEY, role)
      return noContent()
    },

    'GET /notifications': async () => {
      await delay(80)
      const user = currentUser()
      const read = readIds(user.id)
      const list: AppNotification[] = notificationsForRole(user.role).map((n) => ({
        ...n,
        read: read.includes(n.id),
      }))
      return json(list)
    },

    'POST /notifications/read': async (request) => {
      const ids = (await body<{ ids: string[] }>(request))?.ids
      if (!Array.isArray(ids)) return error(400, 'Liste « ids » attendue')
      const user = currentUser()
      saveReadIds(user.id, [...new Set([...readIds(user.id), ...ids])])
      return noContent()
    },
  }

  // Routes propres à un parcours : /parcours/:id/…, servies avec le contenu de ce parcours
  type ScopedHandler = (request: Request, content: ParcoursContent) => Promise<Response>
  const scoped: Record<string, ScopedHandler> = {
    'GET /catalog': async (_request, content) => {
      await delay(120)
      return json(content.catalog satisfies Catalog)
    },

    'POST /chat': async (request, content) => {
      const question = (await body<{ question: string }>(request))?.question
      if (typeof question !== 'string' || !question.trim()) return error(400, 'Question manquante')
      await delay(700 + Math.random() * 600)
      return json(answer(question, content) satisfies ChatReply)
    },

    'GET /chat/suggestions': async (_request, content) => {
      await delay(40)
      return json(content.assistant.suggestions)
    },

    // Le serveur de démo accepte les événements sans les conserver :
    // la progression de démo reste locale au portail collaborateur.
    'POST /progress/events': async (request) => {
      const event = await body<LearningEvent>(request)
      if (!event?.type) return error(400, 'Événement invalide')
      return noContent()
    },
  }

  /** Traite une requête dont le chemin est relatif au préfixe de l'API (ex. « /me »). */
  return async function handle(request: Request, path: string): Promise<Response> {
    const inParcours = /^\/parcours\/([^/]+)(\/.*)$/.exec(path)
    if (inParcours) {
      const [, id, rest] = inParcours
      const content = contentOf(id)
      if (!content) return error(404, `Parcours inconnu : ${id}`)
      const route = scoped[`${request.method} ${rest}`]
      return route
        ? route(request, content)
        : error(404, `${request.method} ${path} : route inconnue`)
    }
    const route = routes[`${request.method} ${path}`]
    return route ? route(request) : error(404, `${request.method} ${path} : route inconnue`)
  }
}
