import type { Role, User } from '@acculturator/contracts'
import type { Api } from '../types'
import { CHAT_KB, CHAT_SUGGESTIONS, type ChatKnowledge } from './data/chatbot-kb'
import { FLASHCARDS } from './data/flashcards'
import { HAZARD_SCENES } from './data/hazards'
import { notificationsForRole } from './data/notifications'
import { QUIZ_QUESTIONS } from './data/quiz'
import { RESOURCES } from './data/resources'
import { MOCK_USERS } from './data/users'

/**
 * Implémentation de démonstration : données locales, latence simulée, état dans le navigateur.
 * Elle respecte les mêmes contrats que l'implémentation HTTP.
 */
const latency = (ms = 120) => new Promise((r) => setTimeout(r, ms))

const ROLE_KEY = 'acculturator.demo-role'
const READ_KEY = 'acculturator.notifications.read'

function storedRole(): Role {
  try {
    const r = localStorage.getItem(ROLE_KEY)
    if (r === 'collaborateur' || r === 'referent' || r === 'admin') return r
  } catch {
    /* stockage indisponible */
  }
  return 'collaborateur'
}

function readIds(userId: string): string[] {
  try {
    return (
      (JSON.parse(localStorage.getItem(READ_KEY) ?? '{}') as Record<string, string[]>)[userId] ?? []
    )
  } catch {
    return []
  }
}

function saveReadIds(userId: string, ids: string[]) {
  try {
    const all = JSON.parse(localStorage.getItem(READ_KEY) ?? '{}') as Record<string, string[]>
    all[userId] = ids
    localStorage.setItem(READ_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

const currentUser = (): User => MOCK_USERS[storedRole()]

/* ───────── Assistant : recherche par mots-clés ───────── */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function score(q: string, k: ChatKnowledge) {
  const words = ` ${q} `
  return k.keywords.reduce((acc, kw) => {
    const n = normalize(kw)
    return words.includes(` ${n} `) || (n.length > 4 && q.includes(n))
      ? acc + (n.includes(' ') ? 2 : 1)
      : acc
  }, 0)
}

export const mockApi: Api = {
  auth: {
    async getCurrentUser() {
      await latency(60)
      return currentUser()
    },
    async switchDemoRole(role) {
      try {
        localStorage.setItem(ROLE_KEY, role)
      } catch {
        /* ignore */
      }
    },
  },

  content: {
    async getCatalog() {
      await latency()
      return {
        resources: RESOURCES,
        flashcards: FLASHCARDS,
        quizQuestions: QUIZ_QUESTIONS,
        hazardScenes: HAZARD_SCENES,
      }
    },
  },

  chat: {
    async ask(question) {
      await latency(700 + Math.random() * 600)
      const q = normalize(question)
      if (/^(bonjour|salut|hello|coucou|bonsoir)\b/.test(q) && q.split(' ').length < 4) {
        return {
          text: 'Bonjour, je suis **Prévi**, votre assistant santé-sécurité. Posez-moi une question sur les risques, les bons gestes ou les démarches !',
        }
      }
      if (/\bmerci\b/.test(q)) return { text: 'Avec plaisir. Prenez soin de vous.' }
      const best = CHAT_KB.map((k) => ({ k, s: score(q, k) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)[0]
      if (!best) {
        return {
          text: 'Je n’ai pas encore de réponse fiable à cette question.\nPour une réponse adaptée à votre situation, contactez votre **référent SST** ou votre manager. Vous pouvez aussi reformuler avec d’autres mots (ex. « extincteur », « droit de retrait », « mal au dos »).',
        }
      }
      return { text: best.k.answer, links: best.k.links, matched: best.k.id }
    },
    async getSuggestions() {
      await latency(40)
      return CHAT_SUGGESTIONS
    },
  },

  notifications: {
    async list() {
      await latency(80)
      const user = currentUser()
      const read = readIds(user.id)
      return notificationsForRole(user.role).map((n) => ({ ...n, read: read.includes(n.id) }))
    },
    async markRead(ids) {
      const user = currentUser()
      saveReadIds(user.id, [...new Set([...readIds(user.id), ...ids])])
    },
  },

  progress: {
    // En démo, la progression est conservée localement par le portail : rien à envoyer.
    async track() {},
  },
}
