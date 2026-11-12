import type { ParcoursContent } from '../types.ts'
import { ASSISTANT } from './assistant.ts'
import { FLASHCARDS } from './flashcards.ts'
import { HAZARD_SCENES } from './hazards.ts'
import { MODULES } from './modules.ts'
import { QUIZ_QUESTIONS } from './quiz.ts'
import { RESOURCES } from './resources.ts'
import { THEMES } from './themes.ts'

/** Parcours Santé & Sécurité au Travail : fiche, catalogue et assistant. */
export const SST: ParcoursContent = {
  parcours: {
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
  },
  catalog: {
    themes: THEMES,
    resources: RESOURCES,
    flashcards: FLASHCARDS,
    quizQuestions: QUIZ_QUESTIONS,
    hazardScenes: HAZARD_SCENES,
    modules: MODULES,
  },
  assistant: ASSISTANT,
}
