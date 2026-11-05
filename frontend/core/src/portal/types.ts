import type { LucideIcon } from 'lucide-react'
import type { NavSection } from '@acculturator/design-system/layout'
import type { RouteObject } from 'react-router'
import type { Role } from '@acculturator/contracts'

export type PortalId = 'collaborateur' | 'referent' | 'admin'

/**
 * Contrat qu'un portail doit respecter pour être branché dans l'application.
 * Ajouter un portail = créer `frontend/<id>/` (paquet @acculturator/portal-<id>) exportant un
 * `PortalDefinition`, puis l'enregistrer dans `frontend/shell/src/portals.ts`.
 */
export interface PortalDefinition {
  id: PortalId
  label: string
  basePath: `/${string}`
  description: string
  icon: LucideIcon
  allowedRoles: Role[]
  nav: NavSection[]
  routes: RouteObject[]
  /** Contenu optionnel en haut à droite du header (ex : compteur XP) */
  HeaderSlot?: React.ComponentType
}
