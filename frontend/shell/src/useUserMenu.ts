import { useNavigate } from 'react-router'
import type { Role } from '@acculturator/contracts'
import type { UserMenuProps } from '@acculturator/design-system/layout'
import { ROLE_LABELS, useAuth } from '@acculturator/core/auth'
import { useCurrentParcours } from '@acculturator/core/parcours'
import { homePortalFor, portalsForRole, usePortalRegistry } from '@acculturator/core/portal'

const DEMO_SWITCHER = import.meta.env.VITE_DEMO_ROLE_SWITCHER === 'true'

/**
 * Données du menu utilisateur (identité, parcours, portails, profil de démo),
 * communes à la page de choix du parcours et aux portails.
 */
export function useUserMenu(currentPortalId?: string): UserMenuProps {
  const { user, switchRole } = useAuth()
  const portals = usePortalRegistry()
  const parcours = useCurrentParcours()
  const navigate = useNavigate()
  const available = portalsForRole(portals, user.role)

  return {
    user: {
      name: `${user.firstName} ${user.lastName}`,
      roleLabel: ROLE_LABELS[user.role],
      email: user.email,
      details: `${user.jobTitle} · ${user.site}`,
    },
    // Les portails ne sont proposés qu'une fois un parcours choisi
    portals: parcours
      ? available.map((p) => ({
          id: p.id,
          label: p.label,
          icon: p.icon,
          current: p.id === currentPortalId,
        }))
      : [],
    onSelectPortal: (id) => {
      const target = available.find((p) => p.id === id)
      if (target) navigate(target.basePath)
    },
    ...(parcours && { parcours: { label: parcours.shortTitle, onChange: () => navigate('/') } }),
    ...(DEMO_SWITCHER &&
      switchRole && {
        demoRoles: (Object.keys(ROLE_LABELS) as Role[]).map((r) => ({
          id: r,
          label: ROLE_LABELS[r],
          current: user.role === r,
        })),
        onSelectDemoRole: async (id: string) => {
          const role = id as Role
          await switchRole(role)
          // Sur la page de choix du parcours, on y reste ; sinon, portail d'accueil du profil
          if (currentPortalId) navigate(homePortalFor(portals, role)?.basePath ?? '/')
        },
      }),
  }
}
