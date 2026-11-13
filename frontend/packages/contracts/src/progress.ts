import type { Difficulty, ThemeId } from './content'

/**
 * Événements d'apprentissage émis par le frontend (endpoint POST /api/progress/events).
 * Ils permettent au backend de calculer la progression, d'alimenter les statistiques
 * du portail référent et de piloter l'acculturation.
 */
export type LearningEvent =
  | { type: 'resource_viewed'; resourceId: string }
  | { type: 'card_reviewed'; cardId: string; grade: 'again' | 'hard' | 'good' }
  | { type: 'question_answered'; questionId?: string; themeId: ThemeId; correct: boolean }
  | {
      type: 'quiz_completed'
      mode: 'entrainement' | 'chrono' | 'defi-du-jour' | 'chasse' | 'module'
      themeId?: ThemeId
      /** Quiz de validation d'un module */
      moduleId?: string
      /** Niveau choisi (absent : tous niveaux) */
      difficulty?: Difficulty
      score: number
      total: number
    }
  | { type: 'hazard_found'; sceneId: string; hazardId: string }
  | { type: 'chat_question_asked' }
  | { type: 'module_completed'; moduleId: string }

export interface TrackedEvent {
  userId: string
  occurredAt: string
  event: LearningEvent
}
