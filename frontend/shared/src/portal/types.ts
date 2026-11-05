import type { LucideIcon } from 'lucide-react'
import type { RouteObject } from 'react-router'
import type { Role } from '@acculturator/contracts'

export type PortalId = 'collaborateur' | 'referent' | 'admin'

export interface NavItem {
  label: string
  /** Libellé court pour la barre mobile */
  short?: string
  to: string
  icon: LucideIcon
  /** Pastille affichée à droite (ex : nombre de cartes à réviser) */
  badge?: () => number | string | null
  end?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

/**
 * Contrat qu'un portail doit respecter pour être branché dans l'application.
 * Ajouter un portail = créer `src/portals/<id>/index.tsx` exportant un `PortalDefinition`
 * puis l'enregistrer dans `src/app/portals.ts`.
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
