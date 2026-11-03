import { Award, Eye, HardHat, Landmark, Shield, Sprout, type LucideIcon } from 'lucide-react'

export interface Level {
  level: number
  title: string
  minXp: number
  icon: LucideIcon
}

export const LEVELS: Level[] = [
  { level: 1, title: 'Éveil', minXp: 0, icon: Sprout },
  { level: 2, title: 'Vigie', minXp: 200, icon: Eye },
  { level: 3, title: 'Sentinelle', minXp: 500, icon: Shield },
  { level: 4, title: 'Pilier prévention', minXp: 1000, icon: Landmark },
  { level: 5, title: 'Gardien·ne SST', minXp: 1800, icon: HardHat },
  { level: 6, title: 'Ambassadeur·rice SST', minXp: 3000, icon: Award },
]

export function levelFromXp(xp: number) {
  const current = [...LEVELS].reverse().find((l) => xp >= l.minXp) ?? LEVELS[0]
  const next = LEVELS.find((l) => l.minXp > xp) ?? null
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
} as const
