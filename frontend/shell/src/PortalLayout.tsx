import { Outlet } from 'react-router'
import { AppShell, UserMenu } from '@acculturator/design-system/layout'
import { NotificationsMenu } from '@acculturator/design-system/components'
import { useNotifications } from '@acculturator/core/notifications'
import { useCurrentParcours } from '@acculturator/core/parcours'
import type { PortalDefinition } from '@acculturator/core/portal'
import { useUserMenu } from './useUserMenu'

/**
 * Relie la mise en page du design system aux données : utilisateur connecté, parcours,
 * portails accessibles, notifications. Le design system reste purement visuel.
 */
export function PortalLayout({ portal }: { portal: PortalDefinition }) {
  const userMenu = useUserMenu(portal.id)
  const notifications = useNotifications()
  const parcours = useCurrentParcours()
  const HeaderSlot = portal.HeaderSlot

  return (
    <AppShell
      brandSubtitle={parcours?.shortTitle}
      sectionLabel={portal.label}
      nav={portal.nav}
      headerSlot={HeaderSlot && <HeaderSlot />}
      notifications={
        <NotificationsMenu items={notifications.items} onMarkRead={notifications.markRead} />
      }
      userMenu={<UserMenu {...userMenu} />}
    >
      <Outlet />
    </AppShell>
  )
}
