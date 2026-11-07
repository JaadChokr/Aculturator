import type { Parcours } from '@acculturator/contracts'
import { FLASHCARDS } from './flashcards.ts'
import { QUIZ_QUESTIONS } from './quiz.ts'
import { RESOURCES } from './resources.ts'

/** Parcours de démonstration : un seul pour l'instant, les suivants s'ajouteront ici. */
export const PARCOURS: Parcours[] = [
  {
    id: 'sst',
    title: 'Santé & Sécurité au Travail',
    shortTitle: 'Santé & Sécurité au travail',
    description:
      'Les bons réflexes pour prévenir les risques au quotidien : postures, travail sur écran, risques psychosociaux, incendie, premiers secours, risque routier.',
    status: 'available',
    stats: {
      themes: new Set(RESOURCES.map((r) => r.themeId)).size,
      resources: RESOURCES.length,
      flashcards: FLASHCARDS.length,
      quizQuestions: QUIZ_QUESTIONS.length,
    },
  },
]
