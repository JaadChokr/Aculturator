import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Didacticiels déjà affichés (gestes des flashcards, règles du quiz…).
 * Communs à tous les parcours : on n'explique les gestes qu'une fois.
 */
export const useTips = create<{ seen: string[]; markSeen: (id: string) => void }>()(
  persist(
    (set) => ({
      seen: [],
      markSeen: (id) => set((s) => (s.seen.includes(id) ? s : { seen: [...s.seen, id] })),
    }),
    { name: 'acculturator.collaborateur.tips', partialize: (s) => ({ seen: s.seen }) },
  ),
)
