import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import type { ActivityId } from '@acculturator/contracts'
import { useOffers } from '../store/activities'
import { COLLAB_BASE } from '../paths'

/** Rubrique d'activité(s) : renvoie au tableau de bord si le parcours n'en propose aucune. */
export function RequireActivity({
  activity,
  children,
}: {
  activity: ActivityId | ActivityId[]
  children: ReactNode
}) {
  const offer = useOffers()
  const offered = [activity].flat().some(offer)
  return offered ? <>{children}</> : <Navigate to={COLLAB_BASE} replace />
}
