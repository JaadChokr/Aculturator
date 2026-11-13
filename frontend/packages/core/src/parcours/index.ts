import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Parcours, ParcoursBranding } from '@acculturator/contracts'
import { api } from '../api'
import { useParcoursStore } from './store'

export {
  currentParcoursId,
  DEFAULT_BRANDING,
  getBranding,
  getCurrentParcours,
  getSelectedParcoursId,
  onParcoursChange,
} from './store'
import { DEFAULT_BRANDING } from './store'

export const PARCOURS_QUERY_KEY = ['parcours'] as const

/** Parcours proposés par la plateforme. */
export function useParcoursList() {
  return useQuery({
    queryKey: PARCOURS_QUERY_KEY,
    queryFn: async () => {
      const list = await api.parcours.list()
      useParcoursStore.setState({ list })
      return list
    },
    staleTime: Infinity,
  })
}

/** Parcours en cours (null tant qu'aucun parcours disponible n'est choisi). */
export function useCurrentParcours(): Parcours | null {
  const id = useParcoursStore((s) => s.selectedId)
  const { data } = useParcoursList()
  return data?.find((p) => p.id === id && p.status === 'available') ?? null
}

/** Identité du parcours en cours (nom de l'assistant, titres des niveaux…). */
export function useBranding(): ParcoursBranding {
  return useCurrentParcours()?.branding ?? DEFAULT_BRANDING
}

/** Données qui ne dépendent pas du parcours : conservées quand on en change. */
const GLOBAL_QUERIES = new Set(['me', 'parcours', 'notifications'])

/** Choisir un parcours. Les données propres à l'ancien parcours sont oubliées. */
export function useSelectParcours() {
  const queryClient = useQueryClient()
  return useCallback(
    (id: string) => {
      if (useParcoursStore.getState().selectedId === id) return
      useParcoursStore.setState({ selectedId: id })
      queryClient.removeQueries({ predicate: (q) => !GLOBAL_QUERIES.has(String(q.queryKey[0])) })
    },
    [queryClient],
  )
}
