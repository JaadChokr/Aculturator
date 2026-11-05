import { Outlet, useNavigate } from 'react-router'
import type { Role } from '@acculturator/contracts'
import { AppShell, UserMenu } from '@acculturator/design-system/layout'
import { NotificationsMenu } from '@acculturator/design-system/components'
import { ROLE_LABELS, useAuth } from '@acculturator/core/auth'
import { useNotifications } from '@acculturator/core/notifications'
import {
  homePortalFor,
  portalsForRole,
  usePortalRegistry,
  type PortalDefinition,
} from '@acculturator/core/portal'

const DEMO_SWITCHER = import.meta.env.VITE_DEMO_ROLE_SWITCHER === 'true'

/**
 * Relie la mise en page du design system aux données : utilisateur connecté, portails
 * accessibles, notifications. Le design system reste purement visuel.
 */
export function PortalLayout({ portal }: { portal: PortalDefinition }) {
  const { user, switchRole } = useAuth()
  const portals = usePortalRegistry()
  const navigate = useNavigate()
  const notifications = useNotifications()
  const HeaderSlot = portal.HeaderSlot
  const available = portalsForRole(portals, user.role)

  const userMenu = (
    <UserMenu
      user={{
        name: `${user.firstName} ${user.lastName}`,
        roleLabel: ROLE_LABELS[user.role],
        email: user.email,
        details: `${user.jobTitle} · ${user.site}`,
      }}
      portals={available.map((p) => ({
        id: p.id,
        label: p.label,
        icon: p.icon,
        current: p.id === portal.id,
      }))}
      onSelectPortal={(id) => {
        const target = available.find((p) => p.id === id)
        if (target) navigate(target.basePath)
      }}
      {...(DEMO_SWITCHER &&
        switchRole && {
          demoRoles: (Object.keys(ROLE_LABELS) as Role[]).map((r) => ({
            id: r,
            label: ROLE_LABELS[r],
            current: user.role === r,
          })),
          onSelectDemoRole: async (id: string) => {
            const role = id as Role
            await switchRole(role)
            navigate(homePortalFor(portals, role)?.basePath ?? '/')
          },
        })}
    />
  )

  return (
    <AppShell
      sectionLabel={portal.label}
      nav={portal.nav}
      headerSlot={HeaderSlot && <HeaderSlot />}
      notifications={
        <NotificationsMenu items={notifications.items} onMarkRead={notifications.markRead} />
      }
      userMenu={userMenu}
    >
      <Outlet />
    </AppShell>
  )
}
