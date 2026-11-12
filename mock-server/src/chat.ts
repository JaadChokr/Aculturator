import type { ChatReply } from '@acculturator/contracts'
import type { ChatKnowledge, ParcoursContent } from './data/types.ts'

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

/** Réponse de l'assistant d'un parcours, cherchée dans sa propre base. */
export function answer(question: string, { parcours, assistant }: ParcoursContent): ChatReply {
  const q = normalize(question)
  if (/^(bonjour|salut|hello|coucou|bonsoir)\b/.test(q) && q.split(' ').length < 4) {
    const { assistantName, assistantScope } = parcours.branding
    return {
      text:
        assistant.greeting ??
        `Bonjour, je suis **${assistantName}**, votre assistant sur ${assistantScope}. Posez-moi une question !`,
    }
  }
  if (/\bmerci\b/.test(q)) return { text: 'Avec plaisir. Prenez soin de vous.' }
  const best = assistant.knowledge
    .map((k) => ({ k, s: score(q, k) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)[0]
  if (!best) return { text: assistant.fallback }
  return { text: best.k.answer, links: best.k.links, matched: best.k.id }
}
