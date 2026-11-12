import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Parcours, ParcoursBranding } from '@acculturator/contracts'

/**
 * Parcours choisi par l'utilisateur (mémorisé dans le navigateur) et liste des parcours
 * (copie de la réponse de l'API, pour un accès synchrone hors composant).
 */
export const useParcoursStore = create<{ selectedId: string | null; list: Parcours[] }>()(
  persist(() => ({ selectedId: null as string | null, list: [] as Parcours[] }), {
    name: 'acculturator.parcours',
    partialize: (s) => ({ selectedId: s.selectedId }),
  }),
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

/** Parcours en cours, ou null s'il n'est pas (encore) connu ou pas disponible. */
export function getCurrentParcours(): Parcours | null {
  const { selectedId, list } = useParcoursStore.getState()
  return list.find((p) => p.id === selectedId && p.status === 'available') ?? null
}

/** Identité par défaut, pour un parcours qui ne précise rien. */
export const DEFAULT_BRANDING: ParcoursBranding = {
  assistantName: 'Assistant',
  assistantScope: 'les contenus du parcours',
}

/** Identité du parcours en cours (accès hors composant). */
export function getBranding(): ParcoursBranding {
  return getCurrentParcours()?.branding ?? DEFAULT_BRANDING
}
