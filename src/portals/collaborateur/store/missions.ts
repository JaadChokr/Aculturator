export type MissionId = 'cards' | 'quiz' | 'resource'

export interface Mission {
  id: MissionId
  label: string
  target: number
  to: string
  emoji: string
}

/** Missions quotidiennes : courtes, variées, couvrant les 4 piliers. */
export const MISSIONS: Mission[] = [
  { id: 'cards', label: 'Réviser 10 flashcards', target: 10, to: 'flashcards', emoji: '🃏' },
  { id: 'quiz', label: 'Réussir un quiz (≥ 70 %)', target: 1, to: 'quiz', emoji: '🎯' },
  { id: 'resource', label: 'Découvrir une ressource', target: 1, to: 'ressources', emoji: '🎬' },
]
