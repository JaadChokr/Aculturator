import type { PortalDefinition } from '@acculturator/core/portal'
import { collaborateurPortal } from '@acculturator/portal-collaborateur'
import { referentPortal } from '@acculturator/portal-referent'
import { adminPortal } from '@acculturator/portal-admin'

/**
 * Registre des portails : le seul endroit où l'application hôte les assemble.
 * Ajouter un portail = créer `frontend/<portail>/` (paquet @acculturator/portal-<portail>)
 * puis l'ajouter ici. L'ordre détermine l'ordre d'affichage dans le menu utilisateur.
 */
export const PORTALS: PortalDefinition[] = [collaborateurPortal, referentPortal, adminPortal]
