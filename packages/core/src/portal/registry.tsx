import { createContext, useContext, type ReactNode } from 'react'
import type { Role } from '@acculturator/contracts'
import type { PortalDefinition } from './types'

/**
 * Registre des portails fourni par l'application hôte : le socle partagé
 * (layout, menu utilisateur) connaît ainsi les portails sans en dépendre.
 */
const PortalRegistryContext = createContext<PortalDefinition[]>([])

export function PortalRegistryProvider({
  portals,
  children,
}: {
  portals: PortalDefinition[]
  children: ReactNode
}) {
  return <PortalRegistryContext.Provider value={portals}>{children}</PortalRegistryContext.Provider>
}

export const usePortalRegistry = () => useContext(PortalRegistryContext)

export const portalsForRole = (portals: PortalDefinition[], role: Role) =>
  portals.filter((p) => p.allowedRoles.includes(role))

/** Portail d'atterrissage par défaut pour un rôle. */
export const homePortalFor = (portals: PortalDefinition[], role: Role) =>
  portals.find((p) => p.id === role) ?? portalsForRole(portals, role)[0]
