import { Suspense, useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Menu, Moon, Sun, Monitor, X, ChevronDown, Check, ShieldPlus } from 'lucide-react'
import { useAuth } from '@/app/auth/AuthProvider'
import { useTheme } from '@/app/theme/ThemeProvider'
import { PORTALS, portalsForRole } from '@/app/portals'
import { Avatar, Button } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { ROLE_LABELS, type Role } from '@/shared/types/auth'
import type { PortalDefinition } from '@/shared/types/portal'
import { EASE_OUT, spring } from '@/shared/motion'
import { useDismiss } from '@/shared/hooks/useDismiss'
import {
  NotificationsMenu,
  headerIconButton,
} from '@/shared/components/notifications/NotificationsMenu'

const DEMO_SWITCHER = import.meta.env.VITE_DEMO_ROLE_SWITCHER === 'true'

function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center" aria-busy>
      <span className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  )
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2">
      <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
        <ShieldPlus className="size-5" strokeWidth={2} />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-bold tracking-tight">Acculturator</span>
        <span className="block text-[11px] font-medium text-sidebar-muted">
          Santé & Sécurité au travail
        </span>
      </span>
    </Link>
  )
}

function SidebarNav({
  portal,
  onNavigate,
  idPrefix,
}: {
  portal: PortalDefinition
  onNavigate?: () => void
  idPrefix: string
}) {
  return (
    <nav className="flex flex-col gap-5">
      {portal.nav.map((section, i) => (
        <div key={i}>
          {section.title && (
            <div className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-sidebar-muted uppercase">
              {section.title}
            </div>
          )}
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const badge = item.badge?.()
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'font-semibold text-sidebar-primary'
                          : 'text-sidebar-foreground hover:bg-muted',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId={`${idPrefix}-nav-active`}
                            className="absolute inset-0 rounded-md bg-sidebar-accent"
                            transition={spring}
                          >
                            <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-sm bg-sidebar-primary" />
                          </motion.span>
                        )}
                        <item.icon
                          className={cn('relative size-[18px]', isActive && 'text-sidebar-primary')}
                        />
                        <span className="relative flex-1">{item.label}</span>
                        {badge ? (
                          <motion.span
                            key={String(badge)}
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                            className="relative rounded-sm bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground tabular-nums"
                          >
                            {badge}
                          </motion.span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** Menu utilisateur (en-tête) : identité, changement de portail, profil de démo. */
function UserMenu({ current }: { current: PortalDefinition }) {
  const { user, switchRole } = useAuth()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const available = portalsForRole(user.role)
  const fullName = `${user.firstName} ${user.lastName}`

  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-md py-1 pr-2 pl-1 text-left transition-colors hover:bg-muted"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu de ${fullName}`}
      >
        <Avatar name={fullName} className="size-8 bg-primary/10 text-xs text-primary" />
        <span className="hidden min-w-0 leading-tight md:block">
          <span className="block max-w-40 truncate text-sm font-semibold">{fullName}</span>
          <span className="block max-w-40 truncate text-xs text-muted-foreground">
            {ROLE_LABELS[user.role]}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'hidden size-4 text-muted-foreground transition-transform sm:block',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            transition={spring}
            className="absolute top-full right-0 z-40 mt-2 w-72 origin-top-right rounded-md border bg-popover p-2 text-popover-foreground shadow-xl"
          >
            <div className="flex items-center gap-3 border-b px-2 pt-1 pb-3">
              <Avatar name={fullName} className="bg-primary/10 text-primary" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{fullName}</div>
                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {user.jobTitle} · {user.site}
                </div>
              </div>
            </div>
            <div className="px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Apparence
            </div>
            <div
              className="mx-2 mb-1 grid grid-cols-3 gap-1 rounded-md bg-muted p-1"
              role="radiogroup"
              aria-label="Thème"
            >
              {(
                [
                  ['light', 'Clair', Sun],
                  ['dark', 'Sombre', Moon],
                  ['system', 'Système', Monitor],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={value}
                  role="radio"
                  aria-checked={theme === value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors',
                    theme === value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-1 border-t px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Mes portails
            </div>
            {available.map((p) => (
              <button
                key={p.id}
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  navigate(p.basePath)
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
              >
                <p.icon className="size-4 text-muted-foreground" />
                <span className="flex-1 text-left">{p.label}</span>
                {p.id === current.id && <Check className="size-4 text-primary" />}
              </button>
            ))}
            {DEMO_SWITCHER && (
              <>
                <div className="mt-2 border-t px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Démo · changer de profil
                </div>
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <button
                    key={r}
                    role="menuitem"
                    onClick={() => {
                      switchRole(r)
                      setOpen(false)
                      navigate(
                        PORTALS.find((p) => p.allowedRoles.includes(r) && p.id === r)?.basePath ??
                          '/',
                      )
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <span className="flex-1 text-left">{ROLE_LABELS[r]}</span>
                    {user.role === r && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  const label =
    theme === 'light' ? 'Thème clair' : theme === 'dark' ? 'Thème sombre' : 'Thème système'
  return (
    <button
      onClick={() => setTheme(next)}
      className={headerIconButton}
      aria-label={`${label} (changer)`}
      title={`${label} — cliquer pour changer`}
    >
      <Icon />
    </button>
  )
}

/**
 * Layout commun à tous les portails : identité visuelle unifiée,
 * navigation déclarée par chaque portail (`PortalDefinition.nav`).
 */
export function PortalLayout({ portal }: { portal: PortalDefinition }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const flatItems = portal.nav.flatMap((s) => s.items)
  const current =
    [...flatItems].reverse().find((i) => location.pathname.startsWith(i.to)) ?? flatItems[0]
  const HeaderSlot = portal.HeaderSlot

  const sidebar = (idPrefix: string) => (
    <div className="flex h-full flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
      <Brand />
      <div className="flex-1 overflow-y-auto">
        <SidebarNav portal={portal} idPrefix={idPrefix} onNavigate={() => setMobileOpen(false)} />
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        {sidebar('desktop')}
      </aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.button
              aria-label="Fermer le menu"
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={spring}
            >
              {sidebar('mobile')}
            </motion.aside>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 left-72 ml-2 bg-card hover:bg-muted"
              aria-label="Fermer le menu"
            >
              <X />
            </Button>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu />
          </Button>
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{portal.label}</span>
            <span className="hidden text-muted-foreground sm:inline">/</span>
            <span className="truncate font-bold">
              <span className="sm:hidden">{current?.short ?? current?.label}</span>
              <span className="hidden sm:inline">{current?.label}</span>
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {HeaderSlot && <HeaderSlot />}
            <NotificationsMenu />
            {/* Sur mobile, le thème se règle depuis le menu utilisateur (en-tête plus léger) */}
            <span className="hidden sm:contents">
              <ThemeToggle />
            </span>
            <span aria-hidden className="mx-1 hidden h-6 w-px bg-border sm:block" />
            <UserMenu current={portal} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1760px] px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">
          <Suspense fallback={<PageLoader />}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <Outlet />
            </motion.div>
          </Suspense>
        </main>
      </div>

      {/* Barre de navigation mobile (5 entrées max) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <ul className="mx-auto flex max-w-lg justify-around">
          {flatItems.slice(0, 5).map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="bottom-nav-active"
                        className="absolute top-0 h-1 w-8 rounded-b-full bg-primary"
                        transition={spring}
                      />
                    )}
                    <motion.span
                      animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.1 : 1 }}
                      transition={spring}
                    >
                      <item.icon className="size-5" />
                    </motion.span>
                    <span className="max-w-full truncate px-1">{item.short ?? item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
