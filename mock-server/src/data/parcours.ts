import type { Parcours } from '@acculturator/contracts'
import { FLASHCARDS } from './flashcards.ts'
import { QUIZ_QUESTIONS } from './quiz.ts'
import { RESOURCES } from './resources.ts'
import { SST_THEMES } from './themes.ts'

/** Parcours de démonstration : un seul pour l'instant, les suivants s'ajouteront ici. */
export const PARCOURS: Parcours[] = [
  {
    id: 'sst',
    title: 'Santé & Sécurité au Travail',
    shortTitle: 'Santé & Sécurité au travail',
    description:
      'Les bons réflexes pour prévenir les risques au quotidien : postures, travail sur écran, risques psychosociaux, incendie, premiers secours, risque routier.',
    status: 'available',
    activities: ['resources', 'flashcards', 'quiz', 'hazard-hunt', 'assistant'],
    branding: {
      icon: 'shield-plus',
      assistantName: 'Prévi',
      assistantScope: 'la santé et la sécurité au travail',
      assistantDisclaimer:
        'Prévi donne des repères généraux validés par l’équipe QHSE. Il ne remplace ni votre référent SST, ni le médecin du travail, ni les secours.',
      levelTitles: [
        'Éveil',
        'Vigie',
        'Sentinelle',
        'Pilier prévention',
        'Gardien·ne SST',
        'Ambassadeur·rice SST',
      ],
    },
    stats: {
      themes: SST_THEMES.length,
      resources: RESOURCES.length,
      flashcards: FLASHCARDS.length,
      quizQuestions: QUIZ_QUESTIONS.length,
    },
  },
]
