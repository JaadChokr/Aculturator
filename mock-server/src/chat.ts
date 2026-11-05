import type { ChatReply } from '@acculturator/contracts'
import { CHAT_KB, type ChatKnowledge } from './data/chatbot-kb.ts'

/**
 * Assistant de démonstration : recherche par mots-clés dans une base de réponses validées.
 * Le vrai backend la remplacera par un LLM contraint aux contenus QHSE (RAG).
 */
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

export function answer(question: string): ChatReply {
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
}
