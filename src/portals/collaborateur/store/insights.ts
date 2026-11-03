import { FLASHCARDS, RESOURCES, THEMES, HAZARD_SCENES, type ThemeId } from '@/shared/content'
import type { ProgressState } from './progress'

export type PillarId = 'attention' | 'engagement' | 'feedback' | 'consolidation'

export interface PillarScore {
  id: PillarId
  label: string
  score: number
  metric: string
  description: string
  advice: { text: string; to: string; cta: string }
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

/**
 * Les 4 piliers de l'apprentissage (S. Dehaene) traduits en indicateurs
 * observables dans la plateforme. Sert au tableau de bord et aux recommandations.
 */
export function computePillars(s: ProgressState): PillarScore[] {
  const answers = Object.values(s.answers)
  const total = answers.reduce((a, b) => a + (b?.total ?? 0), 0)
  const correct = answers.reduce((a, b) => a + (b?.correct ?? 0), 0)
  const hazards = Object.values(s.hazardsFound).reduce((a, b) => a + b.length, 0)
  const solid = FLASHCARDS.filter((c) => (s.cards[c.id]?.box ?? 0) >= 3).length

  return [
    {
      id: 'attention',
      label: 'Attention',
      score: clamp((s.viewedResources.length / RESOURCES.length) * 100),
      metric: `${s.viewedResources.length}/${RESOURCES.length} ressources suivies`,
      description: 'Des formats courts (≤ 5 min) et une information à la fois pour capter et garder l’attention.',
      advice: { text: 'Découvrez une nouvelle micro-ressource de moins de 5 minutes.', to: 'ressources', cta: 'Voir les ressources' },
    },
    {
      id: 'engagement',
      label: 'Engagement actif',
      score: clamp(((total + s.chatQuestions * 2 + hazards * 3) / 80) * 100),
      metric: `${total} réponses · ${s.chatQuestions} questions à Prévi`,
      description: 'On apprend en agissant : répondre, chercher, questionner plutôt que lire passivement.',
      advice: { text: 'Lancez une chasse aux risques ou un quiz d’entraînement.', to: 'quiz', cta: 'Jouer' },
    },
    {
      id: 'feedback',
      label: 'Retour d’information',
      score: total ? clamp((correct / total) * 100) : 0,
      metric: `${total ? Math.round((correct / total) * 100) : 0} % de bonnes réponses`,
      description: 'Chaque réponse est corrigée et expliquée immédiatement : l’erreur est une étape normale.',
      advice: { text: 'Refaites les questions manquées : la correction expliquée fixe la bonne réponse.', to: 'quiz', cta: 'S’entraîner' },
    },
    {
      id: 'consolidation',
      label: 'Consolidation',
      score: clamp((solid / FLASHCARDS.length) * 70 + Math.min(s.streak.count, 7) * (30 / 7)),
      metric: `${solid} cartes ancrées · série de ${s.streak.count} j`,
      description: 'La répétition espacée transforme les connaissances en réflexes durables.',
      advice: { text: 'Faites votre session de révision du jour (5 minutes suffisent).', to: 'flashcards', cta: 'Réviser' },
    },
  ]
}

export function themeMastery(s: ProgressState, themeId: ThemeId) {
  const a = s.answers[themeId]
  const accuracy = a && a.total ? (a.correct / a.total) * Math.min(1, a.total / 8) : 0
  const cards = FLASHCARDS.filter((c) => c.themeId === themeId)
  const cardsScore = cards.length ? cards.filter((c) => (s.cards[c.id]?.box ?? 0) >= 3).length / cards.length : 0
  const res = RESOURCES.filter((r) => r.themeId === themeId)
  const resScore = res.length ? res.filter((r) => s.viewedResources.includes(r.id)).length / res.length : 0
  return clamp(accuracy * 55 + cardsScore * 25 + resScore * 20)
}

export function allThemeMastery(s: ProgressState) {
  return THEMES.map((t) => ({ theme: t, mastery: themeMastery(s, t.id) }))
}

export const totalHazards = HAZARD_SCENES.reduce((a, s) => a + s.hazards.length, 0)
