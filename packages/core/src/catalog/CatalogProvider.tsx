import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'
import type { Catalog, Theme, ThemeId } from '@acculturator/contracts'
import { api } from '../api'
import { useParcoursStore } from '../parcours/store'
import { LoadError } from '@acculturator/design-system/components'

/**
 * Catalogue pédagogique du parcours en cours, chargé une fois via l'API, puis lu de façon
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
  const parcoursId = useParcoursStore((s) => s.selectedId)
  const query = useQuery({
    queryKey: [...CATALOG_QUERY_KEY, parcoursId],
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

/** Thématique d'un identifiant : un identifiant inconnu du catalogue reçoit un libellé neutre. */
function findTheme(catalog: Catalog | null, id: ThemeId): Theme {
  return (
    catalog?.themes.find((t) => t.id === id) ?? {
      id,
      title: id,
      short: id,
      description: '',
      icon: '',
      color: '',
    }
  )
}

/** Une thématique du parcours en cours. */
export function useTheme(id: ThemeId): Theme {
  return findTheme(useCatalog(), id)
}

/** Accès hors composant à une thématique (logique métier, libellés). */
export function getTheme(id: ThemeId): Theme {
  return findTheme(useCatalogStore.getState().catalog, id)
}
