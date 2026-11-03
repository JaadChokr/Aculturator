import type { Role } from '@/shared/types/auth'
import type { PortalDefinition } from '@/shared/types/portal'
import { collaborateurPortal } from '@/portals/collaborateur'
import { referentPortal } from '@/portals/referent'
import { adminPortal } from '@/portals/admin'

/** Registre des portails. L'ordre détermine l'ordre d'affichage dans le sélecteur. */
export const PORTALS: PortalDefinition[] = [collaborateurPortal, referentPortal, adminPortal]

export const portalsForRole = (role: Role) => PORTALS.filter((p) => p.allowedRoles.includes(role))

/** Portail d'atterrissage par défaut selon le rôle. */
export const homePortalFor = (role: Role) => PORTALS.find((p) => p.id === role) ?? portalsForRole(role)[0]
