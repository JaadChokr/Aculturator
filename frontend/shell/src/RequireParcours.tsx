import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { FullPageLoader, LoadError } from '@acculturator/design-system/components'
import { CatalogProvider } from '@acculturator/core/catalog'
import { useCurrentParcours, useParcoursList } from '@acculturator/core/parcours'

/**
 * Les portails travaillent toujours dans un parcours : sans parcours choisi, retour à la page
 * de choix ; sinon, le catalogue du parcours est chargé avant d'afficher le portail.
 */
export function RequireParcours({ children }: { children: ReactNode }) {
  const list = useParcoursList()
  const current = useCurrentParcours()
  if (list.isError)
    return (
      <LoadError message="Les parcours n’ont pas pu être chargés." onRetry={() => list.refetch()} />
    )
  if (!list.data) return <FullPageLoader label="Chargement…" />
  if (!current) return <Navigate to="/" replace />
  return (
    <CatalogProvider fallback={<FullPageLoader label="Chargement des contenus…" />}>
      {children}
    </CatalogProvider>
  )
}
