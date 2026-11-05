import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router'
import {
  Award,
  Bell,
  BellOff,
  FileText,
  Layers,
  MessageSquareWarning,
  Siren,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AppNotification, NotificationKind } from '@acculturator/contracts'
import { api } from '../../api'
import { useDismiss } from '../../hooks'
import { cn } from '../../lib'
import { spring } from '../../motion'

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const

const KIND_ICON: Record<NotificationKind, LucideIcon> = {
  content: FileText,
  review: Layers,
  badge: Award,
  team: Users,
  safety: Siren,
  report: MessageSquareWarning,
}

const rtf = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })
function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 60) return rtf.format(-Math.max(1, minutes), 'minute')
  const hours = Math.round(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  return rtf.format(-Math.round(hours / 24), 'day')
}

/** Style commun des boutons-icônes de l'en-tête (contrasté en clair comme en sombre). */
export const headerIconButton =
  'relative inline-grid size-9 place-items-center rounded-md border bg-card text-foreground transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none [&_svg]:size-[18px]'

export function NotificationsMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)

  const queryClient = useQueryClient()
  const { data: items = [] } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: api.notifications.list,
    refetchInterval: 60_000,
  })
  const { mutate: markRead } = useMutation({
    mutationFn: (ids: string[]) => api.notifications.markRead(ids),
    // Mise à jour optimiste : l'interface réagit immédiatement
    onMutate: (ids) =>
      queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_QUERY_KEY, (prev) =>
        prev?.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)),
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  })
  const isRead = (id: string) => items.find((n) => n.id === id)?.read ?? false
  const unread = items.filter((n) => !n.read).length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={headerIconButton}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread ? `Notifications (${unread} non lues)` : 'Notifications'}
        title="Notifications"
      >
        <Bell />
        {unread > 0 && (
          <motion.span
            key={unread}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={spring}
            className="absolute -top-1.5 -right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums ring-2 ring-background"
          >
            {unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            transition={spring}
            className="fixed inset-x-3 top-16 z-40 origin-top-right rounded-md border bg-popover text-popover-foreground shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-semibold">
                Notifications
                {unread > 0 && (
                  <span className="ml-2 rounded-sm bg-primary/10 px-1.5 py-0.5 text-xs text-primary tabular-nums">
                    {unread} non lue{unread > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={() => markRead(items.map((n) => n.id))}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
                <BellOff className="size-6" />
                Aucune notification pour le moment.
              </div>
            ) : (
              <ul className="max-h-[min(28rem,calc(100dvh-8rem))] overflow-y-auto py-1">
                {items.map((n) => {
                  const Icon = KIND_ICON[n.kind]
                  const unreadItem = !isRead(n.id)
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => {
                          markRead([n.id])
                          setOpen(false)
                          if (n.to) navigate(n.to)
                        }}
                        className={cn(
                          'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted',
                          unreadItem && 'bg-primary/[0.04]',
                        )}
                      >
                        <span
                          className={cn(
                            'grid size-9 shrink-0 place-items-center rounded-md',
                            n.kind === 'safety'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground',
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              'block text-sm',
                              unreadItem ? 'font-semibold' : 'font-medium text-muted-foreground',
                            )}
                          >
                            {n.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">{n.body}</span>
                          <span className="mt-1 block text-[11px] text-muted-foreground">
                            {timeAgo(n.createdAt)}
                          </span>
                        </span>
                        {unreadItem && (
                          <span
                            aria-label="Non lue"
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                          />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
