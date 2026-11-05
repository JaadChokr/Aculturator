import {
  BadgeCheck,
  Brain,
  Clapperboard,
  Flame,
  Footprints,
  Lightbulb,
  ScanEye,
  ShieldCheck,
  Timer,
  type LucideIcon,
} from 'lucide-react'
import { getCatalog } from '@acculturator/shared/catalog'
import type { ProgressState } from './progress'

export type BadgeId =
  | 'premiers-pas'
  | 'sans-faute'
  | 'cinephile'
  | 'serie-7'
  | 'oeil-de-lynx'
  | 'memoire'
  | 'curieux'
  | 'chrono'
  | 'sentinelle'

export interface Badge {
  id: BadgeId
  name: string
  description: string
  icon: LucideIcon
  isUnlocked: (s: ProgressState) => boolean
}

export const BADGES: Badge[] = [
  {
    id: 'premiers-pas',
    name: 'Premiers pas',
    icon: Footprints,
    description: 'Terminer un premier quiz',
    isUnlocked: (s) => s.quizHistory.length >= 1,
  },
  {
    id: 'sans-faute',
    name: 'Sans faute',
    icon: BadgeCheck,
    description: 'Obtenir 100 % à un quiz',
    isUnlocked: (s) => s.quizHistory.some((q) => q.mode !== 'chasse' && q.score === q.total),
  },
  {
    id: 'cinephile',
    name: 'Cinéphile prévention',
    icon: Clapperboard,
    description: 'Consulter 5 ressources',
    isUnlocked: (s) => s.viewedResources.length >= 5,
  },
  {
    id: 'serie-7',
    name: 'Flamme tenace',
    icon: Flame,
    description: 'Tenir une série de 7 jours',
    isUnlocked: (s) => s.streak.count >= 7,
  },
  {
    id: 'oeil-de-lynx',
    name: 'Œil de lynx',
    icon: ScanEye,
    description: 'Trouver tous les dangers d’une scène',
    isUnlocked: (s) =>
      getCatalog().hazardScenes.some(
        (sc) => (s.hazardsFound[sc.id]?.length ?? 0) >= sc.hazards.length,
      ),
  },
  {
    id: 'memoire',
    name: 'Mémoire d’éléphant',
    icon: Brain,
    description: 'Amener 15 flashcards en boîte 4 ou plus',
    isUnlocked: (s) =>
      getCatalog().flashcards.filter((c) => (s.cards[c.id]?.box ?? 0) >= 4).length >= 15,
  },
  {
    id: 'curieux',
    name: 'Esprit curieux',
    icon: Lightbulb,
    description: 'Poser 5 questions à Prévi',
    isUnlocked: (s) => s.chatQuestions >= 5,
  },
  {
    id: 'chrono',
    name: 'Réflexes éclair',
    icon: Timer,
    description: 'Atteindre 9 bonnes réponses en défi chrono',
    isUnlocked: (s) => s.bestChrono >= 9,
  },
  {
    id: 'sentinelle',
    name: 'Sentinelle',
    icon: ShieldCheck,
    description: 'Répondre à des questions dans les 7 thématiques',
    isUnlocked: (s) => Object.keys(s.answers).length >= 7,
  },
]
