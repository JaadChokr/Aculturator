import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Difficulty } from '@acculturator/contracts'

/** Niveau de difficulté choisi pour les quiz (null : tous niveaux), commun à tous les parcours. */
export const useQuizPrefs = create<{
  level: Difficulty | null
  setLevel: (level: Difficulty | null) => void
}>()(
  persist(
    (set) => ({
      level: null,
      setLevel: (level) => set({ level }),
    }),
    { name: 'acculturator.collaborateur.quiz-prefs', partialize: (s) => ({ level: s.level }) },
  ),
)

/** Lit `niveau=1|2|3` dans l'adresse d'un quiz. */
export function parseLevel(value: string | null): Difficulty | null {
  return value === '1' || value === '2' || value === '3' ? (Number(value) as Difficulty) : null
}
