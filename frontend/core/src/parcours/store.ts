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
