import { CHAT_KB, type ChatKnowledge } from '@/shared/content'

export interface ChatReply {
  text: string
  links?: { label: string; to: string }[]
  matched?: string
}

/** Contrat du service de chat : l'UI ne dépend que de cette interface. */
export interface ChatService {
  ask(question: string): Promise<ChatReply>
}

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
    return words.includes(` ${n} `) || (n.length > 4 && q.includes(n)) ? acc + (n.includes(' ') ? 2 : 1) : acc
  }, 0)
}

/** Implémentation de démonstration : recherche par mots-clés + latence simulée. */
export class MockChatService implements ChatService {
  async ask(question: string): Promise<ChatReply> {
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 600))
    const q = normalize(question)
    if (/^(bonjour|salut|hello|coucou|bonsoir)\b/.test(q) && q.split(' ').length < 4) {
      return { text: 'Bonjour 👋 Je suis **Prévi**, votre assistant santé-sécurité. Posez-moi une question sur les risques, les bons gestes ou les démarches !' }
    }
    if (/\bmerci\b/.test(q)) return { text: 'Avec plaisir ! Prenez soin de vous 🦺' }
    const best = CHAT_KB.map((k) => ({ k, s: score(q, k) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)[0]
    if (!best) {
      return {
        text: 'Je n’ai pas encore de réponse fiable à cette question. 🤔\nPour une réponse adaptée à votre situation, contactez votre **référent SST** ou votre manager. Vous pouvez aussi reformuler avec d’autres mots (ex. « extincteur », « droit de retrait », « mal au dos »).',
      }
    }
    return { text: best.k.answer, links: best.k.links, matched: best.k.id }
  }
}

export const chatService: ChatService = new MockChatService()
