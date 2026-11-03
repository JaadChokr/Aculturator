import { FLASHCARDS, RESOURCES, THEMES, HAZARD_SCENES, type ThemeId } from '@/shared/content'
import type { ProgressState } from './progress'

/*
 * ─────────────────────────────────────────────────────────────
 *  Les 4 piliers de l'apprentissage (S. Dehaene) sont des PRINCIPES
 *  DE CONCEPTION : ils ne sont jamais nommés dans l'interface
 *  collaborateur. Ils se traduisent par l'expérience :
 *   - Attention       → formats courts, un message à la fois
 *   - Engagement      → quiz, chasse aux risques, chatbot, check express
 *   - Retour d'info   → correction immédiate et expliquée
 *   - Consolidation   → répétition espacée, missions et séries de jours
 *  Ici, ils servent uniquement à choisir les recommandations
 *  (et pourront alimenter les statistiques du portail référent).
 * ─────────────────────────────────────────────────────────────
 */
type PillarId = 'attention' | 'engagement' | 'feedback' | 'consolidation'

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

/** Scores internes (0-100) — non affichés au collaborateur. */
export function pillarScores(s: ProgressState): Record<PillarId, number> {
  const answers = Object.values(s.answers)
  const total = answers.reduce((a, b) => a + (b?.total ?? 0), 0)
  const correct = answers.reduce((a, b) => a + (b?.correct ?? 0), 0)
  const hazards = Object.values(s.hazardsFound).reduce((a, b) => a + b.length, 0)
  const solid = FLASHCARDS.filter((c) => (s.cards[c.id]?.box ?? 0) >= 3).length
  return {
    attention: clamp((s.viewedResources.length / RESOURCES.length) * 100),
    engagement: clamp(((total + s.chatQuestions * 2 + hazards * 3) / 80) * 100),
    feedback: total ? clamp((correct / total) * 100) : 0,
    consolidation: clamp((solid / FLASHCARDS.length) * 70 + Math.min(s.streak.count, 7) * (30 / 7)),
  }
}

export interface NextStep {
  id: string
  kind: 'review' | 'watch' | 'practice' | 'hunt'
  title: string
  detail: string
  to: string
  cta: string
}

/**
 * Prochaines étapes concrètes, ordonnées selon les besoins du collaborateur.
 * Le vocabulaire reste celui de l'action (réviser, regarder, s'entraîner).
 */
export function nextSteps(s: ProgressState, dueCount: number, limit = 3): NextStep[] {
  const scores = pillarScores(s)
  const candidates: { pillar: PillarId; step: NextStep }[] = []

  if (dueCount > 0) {
    candidates.push({
      pillar: 'consolidation',
      step: {
        id: 'review',
        kind: 'review',
        title: `Réviser ${dueCount} carte${dueCount > 1 ? 's' : ''}`,
        detail: 'Elles reviennent aujourd’hui pour rester bien en mémoire.',
        to: 'flashcards/session',
        cta: 'Réviser',
      },
    })
  }

  const unseen = RESOURCES.filter((r) => !s.viewedResources.includes(r.id)).sort(
    (a, b) => Number(!!b.mandatory) - Number(!!a.mandatory) || a.durationMin - b.durationMin,
  )[0]
  if (unseen) {
    candidates.push({
      pillar: 'attention',
      step: {
        id: 'watch',
        kind: 'watch',
        title: unseen.title,
        detail: `${unseen.mandatory ? 'Contenu obligatoire · ' : ''}${unseen.durationMin} min`,
        to: `ressources?r=${unseen.id}`,
        cta: 'Consulter',
      },
    })
  }

  const weakest = [...THEMES].sort((a, b) => themeMastery(s, a.id) - themeMastery(s, b.id))[0]
  candidates.push({
    pillar: 'feedback',
    step: {
      id: 'practice',
      kind: 'practice',
      title: `S’entraîner : ${weakest.title}`,
      detail: `Thématique la moins maîtrisée (${themeMastery(s, weakest.id)} %).`,
      to: `quiz/jouer?mode=entrainement&theme=${weakest.id}`,
      cta: 'S’entraîner',
    },
  })

  const scene = HAZARD_SCENES[0]
  const found = s.hazardsFound[scene.id]?.length ?? 0
  if (found < scene.hazards.length) {
    candidates.push({
      pillar: 'engagement',
      step: {
        id: 'hunt',
        kind: 'hunt',
        title: 'Chasse aux risques',
        detail: `${scene.hazards.length - found} situation${scene.hazards.length - found > 1 ? 's' : ''} dangereuse${scene.hazards.length - found > 1 ? 's' : ''} à repérer dans l’open space.`,
        to: 'quiz/chasse-aux-risques',
        cta: 'Commencer',
      },
    })
  }

  return candidates
    .sort((a, b) => scores[a.pillar] - scores[b.pillar])
    .slice(0, limit)
    .map((c) => c.step)
}

export function themeMastery(s: ProgressState, themeId: ThemeId) {
  const a = s.answers[themeId]
  const accuracy = a && a.total ? (a.correct / a.total) * Math.min(1, a.total / 8) : 0
  const cards = FLASHCARDS.filter((c) => c.themeId === themeId)
  const cardsScore = cards.length
    ? cards.filter((c) => (s.cards[c.id]?.box ?? 0) >= 3).length / cards.length
    : 0
  const res = RESOURCES.filter((r) => r.themeId === themeId)
  const resScore = res.length
    ? res.filter((r) => s.viewedResources.includes(r.id)).length / res.length
    : 0
  return clamp(accuracy * 55 + cardsScore * 25 + resScore * 20)
}

export function allThemeMastery(s: ProgressState) {
  return THEMES.map((t) => ({ theme: t, mastery: themeMastery(s, t.id) }))
}

export const totalHazards = HAZARD_SCENES.reduce((a, s) => a + s.hazards.length, 0)
