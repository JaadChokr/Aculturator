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
import { CHAT_SUGGESTIONS } from './data/chatbot-kb.ts'
import { FLASHCARDS } from './data/flashcards.ts'
import { HAZARD_SCENES } from './data/hazards.ts'
import { notificationsForRole } from './data/notifications.ts'
import { QUIZ_QUESTIONS } from './data/quiz.ts'
import { RESOURCES } from './data/resources.ts'
import { SST_MODULES } from './data/modules.ts'
import { SST_THEMES } from './data/themes.ts'
import { PARCOURS } from './data/parcours.ts'
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

  // Routes propres à un parcours : /parcours/:id/…
  // (le serveur de démo n'a qu'un jeu de données, celui du parcours SST)
  const scoped: Record<string, Handler> = {
    'GET /catalog': async () => {
      await delay(120)
      const catalog: Catalog = {
        themes: SST_THEMES,
        resources: RESOURCES,
        flashcards: FLASHCARDS,
        quizQuestions: QUIZ_QUESTIONS,
        hazardScenes: HAZARD_SCENES,
        modules: SST_MODULES,
      }
      return json(catalog)
    },

    'POST /chat': async (request) => {
      const question = (await body<{ question: string }>(request))?.question
      if (typeof question !== 'string' || !question.trim()) return error(400, 'Question manquante')
      await delay(700 + Math.random() * 600)
      return json(answer(question) satisfies ChatReply)
    },

    'GET /chat/suggestions': async () => {
      await delay(40)
      return json(CHAT_SUGGESTIONS)
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
      if (!PARCOURS.some((p) => p.id === id && p.status === 'available'))
        return error(404, `Parcours inconnu : ${id}`)
      const route = scoped[`${request.method} ${rest}`]
      return route ? route(request) : error(404, `${request.method} ${path} : route inconnue`)
    }
    const route = routes[`${request.method} ${path}`]
    return route ? route(request) : error(404, `${request.method} ${path} : route inconnue`)
  }
}
