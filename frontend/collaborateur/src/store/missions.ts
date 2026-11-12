import { Layers, PlayCircle, Target, type LucideIcon } from 'lucide-react'
import type { ActivityId } from '@acculturator/contracts'
import { offers } from './activities'

export type MissionId = 'cards' | 'quiz' | 'resource'

export interface Mission {
  id: MissionId
  label: string
  target: number
  to: string
  icon: LucideIcon
  /** Activité qu'elle fait pratiquer : la mission n'existe que si le parcours la propose */
  activity: ActivityId
}

/** Missions quotidiennes : courtes, variées, couvrant les 4 piliers. */
export const MISSIONS: Mission[] = [
  {
    id: 'cards',
    label: 'Réviser 10 flashcards',
    target: 10,
    to: 'flashcards',
    icon: Layers,
    activity: 'flashcards',
  },
  {
    id: 'quiz',
    label: 'Réussir un quiz (≥ 70 %)',
    target: 1,
    to: 'quiz',
    icon: Target,
    activity: 'quiz',
  },
  {
    id: 'resource',
    label: 'Découvrir une ressource',
    target: 1,
    to: 'ressources',
    icon: PlayCircle,
    activity: 'resources',
  },
]

/** Missions du jour du parcours en cours. */
export const activeMissions = () => MISSIONS.filter((m) => offers(m.activity))
