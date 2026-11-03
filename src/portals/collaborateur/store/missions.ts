import { Layers, PlayCircle, Target, type LucideIcon } from 'lucide-react'

export type MissionId = 'cards' | 'quiz' | 'resource'

export interface Mission {
  id: MissionId
  label: string
  target: number
  to: string
  icon: LucideIcon
}

/** Missions quotidiennes : courtes, variées, couvrant les 4 piliers. */
export const MISSIONS: Mission[] = [
  { id: 'cards', label: 'Réviser 10 flashcards', target: 10, to: 'flashcards', icon: Layers },
  { id: 'quiz', label: 'Réussir un quiz (≥ 70 %)', target: 1, to: 'quiz', icon: Target },
  {
    id: 'resource',
    label: 'Découvrir une ressource',
    target: 1,
    to: 'ressources',
    icon: PlayCircle,
  },
]
