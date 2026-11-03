import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Menu, Moon, Sun, Monitor, X, ChevronsUpDown, Check } from 'lucide-react'
import { useAuth } from '@/app/auth/AuthProvider'
import { useTheme } from '@/app/theme/ThemeProvider'
import { PORTALS, portalsForRole } from '@/app/portals'
import { Avatar, Button } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { ROLE_LABELS, type Role } from '@/shared/types/auth'
import type { PortalDefinition } from '@/shared/types/portal'

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
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 text-lg shadow-md">🦺</span>
      <span className="leading-tight">
        <span className="block text-[15px] font-extrabold tracking-tight">Acculturator</span>
        <span className="block text-[11px] font-semibold text-sidebar-muted">Santé & Sécurité au travail</span>
      </span>
    </Link>
  )
}

function SidebarNav({ portal, onNavigate }: { portal: PortalDefinition; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5">
      {portal.nav.map((section, i) => (
        <div key={i}>
          {section.title && (
            <div className="mb-1.5 px-3 text-[11px] font-bold tracking-wider text-sidebar-muted uppercase">{section.title}</div>
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
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-white shadow-inner'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn('size-[18px]', isActive && 'text-sidebar-primary')} />
                        <span className="flex-1">{item.label}</span>
                        {badge ? (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">{badge}</span>
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

function PortalSwitcher({ current }: { current: PortalDefinition }) {
  const { user, switchRole } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const available = portalsForRole(user.role)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl bg-sidebar-accent/70 p-2.5 text-left transition-colors hover:bg-sidebar-accent"
        aria-expanded={open}
      >
        <Avatar name={`${user.firstName} ${user.lastName}`} className="bg-sidebar-primary/20 text-sidebar-primary" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-white">
            {user.firstName} {user.lastName}
          </span>
          <span className="block truncate text-xs text-sidebar-muted">{current.label}</span>
        </span>
        <ChevronsUpDown className="size-4 text-sidebar-muted" />
      </button>
      {open && (
        <div className="absolute right-0 bottom-full left-0 z-20 mb-2 animate-pop rounded-xl border border-white/10 bg-sidebar p-2 shadow-2xl">
          <div className="px-2 py-1 text-[11px] font-bold tracking-wider text-sidebar-muted uppercase">Mes portails</div>
          {available.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setOpen(false)
                navigate(p.basePath)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <p.icon className="size-4" />
              <span className="flex-1 text-left">{p.label}</span>
              {p.id === current.id && <Check className="size-4 text-sidebar-primary" />}
            </button>
          ))}
          {DEMO_SWITCHER && (
            <>
              <div className="mt-2 border-t border-white/10 px-2 pt-2 pb-1 text-[11px] font-bold tracking-wider text-sidebar-muted uppercase">
                Démo · changer de profil
              </div>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r)
                    setOpen(false)
                    navigate(PORTALS.find((p) => p.allowedRoles.includes(r) && p.id === r)?.basePath ?? '/')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <span className="flex-1 text-left">{ROLE_LABELS[r]}</span>
                  {user.role === r && <Check className="size-4 text-sidebar-primary" />}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  const label = theme === 'light' ? 'Thème clair' : theme === 'dark' ? 'Thème sombre' : 'Thème système'
  return (
    <Button variant="ghost" size="icon-sm" onClick={() => setTheme(next)} aria-label={`${label} (changer)`} title={label}>
      <Icon />
    </Button>
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
  const current = [...flatItems].reverse().find((i) => location.pathname.startsWith(i.to)) ?? flatItems[0]
  const HeaderSlot = portal.HeaderSlot

  const sidebar = (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground">
      <Brand />
      <div className="flex-1 overflow-y-auto">
        <SidebarNav portal={portal} onNavigate={() => setMobileOpen(false)} />
      </div>
      <PortalSwitcher current={portal} />
    </div>
  )

  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Fermer le menu" className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-in slide-in-from-left">{sidebar}</aside>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="absolute top-3 left-72 ml-2 text-white hover:bg-white/10"
            aria-label="Fermer le menu"
          >
            <X />
          </Button>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
            <Menu />
          </Button>
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{portal.label}</span>
            <span className="hidden text-muted-foreground sm:inline">/</span>
            <span className="truncate font-bold">{current?.label}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {HeaderSlot && <HeaderSlot />}
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
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
                    'flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )
                }
              >
                <item.icon className="size-5" />
                <span className="max-w-full truncate px-1">{item.short ?? item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
