import type { ThemeId } from './content'

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
      mode: 'entrainement' | 'chrono' | 'defi-du-jour' | 'chasse'
      themeId?: ThemeId
      score: number
      total: number
    }
  | { type: 'hazard_found'; sceneId: string; hazardId: string }
  | { type: 'chat_question_asked' }

export interface TrackedEvent {
  userId: string
  occurredAt: string
  event: LearningEvent
}
