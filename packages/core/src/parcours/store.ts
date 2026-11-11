import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Parcours choisi par l'utilisateur, mémorisé dans le navigateur. */
export const useParcoursStore = create<{ selectedId: string | null }>()(
  persist(() => ({ selectedId: null as string | null }), { name: 'acculturator.parcours' }),
)

/** Identifiant du parcours en cours (pour les appels d'API limités à un parcours). */
export function currentParcoursId(): string {
  const id = useParcoursStore.getState().selectedId
  if (!id) throw new Error('Aucun parcours sélectionné')
  return id
}

/** Parcours en cours, ou null (accès hors composant, ex. depuis un store). */
export function getSelectedParcoursId(): string | null {
  return useParcoursStore.getState().selectedId
}

/**
 * Être prévenu quand l'utilisateur change de parcours (ex. pour charger la progression
 * propre au nouveau parcours). Renvoie la fonction de désabonnement.
 */
export function onParcoursChange(listener: (id: string | null) => void): () => void {
  return useParcoursStore.subscribe((s, prev) => {
    if (s.selectedId !== prev.selectedId) listener(s.selectedId)
  })
}
