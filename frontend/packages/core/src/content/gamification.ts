import { Award, Eye, Landmark, Medal, Shield, Sprout, type LucideIcon } from 'lucide-react'

export interface Level {
  level: number
  title: string
  minXp: number
  icon: LucideIcon
}

/** Paliers d'XP et icônes des niveaux ; les titres par défaut valent pour tout parcours. */
const LEVEL_STEPS: { minXp: number; icon: LucideIcon; title: string }[] = [
  { minXp: 0, icon: Sprout, title: 'Éveil' },
  { minXp: 200, icon: Eye, title: 'Curieux·se' },
  { minXp: 500, icon: Shield, title: 'Initié·e' },
  { minXp: 1000, icon: Landmark, title: 'Confirmé·e' },
  { minXp: 1800, icon: Medal, title: 'Expert·e' },
  { minXp: 3000, icon: Award, title: 'Ambassadeur·rice' },
]

/**
 * Niveaux du joueur, avec les titres propres au parcours s'il en donne
 * (`ParcoursBranding.levelTitles`, un par niveau).
 */
export function levelsWith(titles?: string[]): Level[] {
  return LEVEL_STEPS.map((step, i) => ({
    level: i + 1,
    title: titles?.[i] ?? step.title,
    minXp: step.minXp,
    icon: step.icon,
  }))
}

export const LEVELS: Level[] = levelsWith()

export function levelFromXp(xp: number, levels: Level[] = LEVELS) {
  const current = [...levels].reverse().find((l) => xp >= l.minXp) ?? levels[0]
  const next = levels.find((l) => l.minXp > xp) ?? null
  const progress = next ? ((xp - current.minXp) / (next.minXp - current.minXp)) * 100 : 100
  return { current, next, progress, toNext: next ? next.minXp - xp : 0 }
}

/** Barème d'XP — un seul endroit pour l'équilibrage du jeu. */
export const XP = {
  resourceViewed: 15,
  resourceCheckOk: 10,
  cardReviewed: 2,
  cardMastered: 5,
  quizCorrect: 10,
  quizPerfectBonus: 30,
  challengeCombo: 5,
  hazardFound: 15,
  hazardAllBonus: 40,
  chatQuestion: 3,
  dailyMission: 25,
  moduleCompleted: 50,
  /** Bonus par bonne réponse, par niveau au-dessus de « découverte » (+5 confirmé, +10 expert) */
  quizDifficultyStep: 5,
} as const
