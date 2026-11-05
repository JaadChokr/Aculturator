import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'
import type { Catalog } from '@acculturator/contracts'
import { api } from '../api'
import { LoadError } from '../components/LoadState'

/**
 * Catalogue pédagogique chargé une fois au démarrage via l'API, puis lu de façon
 * synchrone par les pages (`useCatalog`) et par la logique métier (`getCatalog`).
 */
const useCatalogStore = create<{ catalog: Catalog | null }>(() => ({ catalog: null }))

export const CATALOG_QUERY_KEY = ['catalog'] as const

export function CatalogProvider({
  children,
  fallback,
}: {
  children: ReactNode
  fallback: ReactNode
}) {
  const query = useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: async () => {
      const catalog = await api.content.getCatalog()
      useCatalogStore.setState({ catalog })
      return catalog
    },
    staleTime: Infinity,
  })
  if (query.isError)
    return (
      <LoadError
        message="Le catalogue de contenus n’a pas pu être chargé."
        onRetry={() => query.refetch()}
      />
    )
  if (!query.data) return <>{fallback}</>
  return <>{children}</>
}

/** Catalogue courant (à utiliser sous <CatalogProvider>). */
export function useCatalog(): Catalog {
  const catalog = useCatalogStore((s) => s.catalog)
  if (!catalog) throw new Error('useCatalog doit être utilisé sous <CatalogProvider>')
  return catalog
}

/** Accès hors composant (logique métier, stores). */
export function getCatalog(): Catalog {
  const catalog = useCatalogStore.getState().catalog
  if (!catalog) throw new Error('Catalogue non chargé')
  return catalog
}
