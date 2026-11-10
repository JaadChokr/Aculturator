import type { ReactNode } from 'react'
import { cn } from '../lib'
import { Brand } from './AppShell'
import { CONTENT_AREA, HEADER_BAR } from './frame'

/**
 * Mise en page des pages hors portail (ex. choix du parcours) : même barre d'en-tête et même
 * zone de contenu que les portails, sans navigation latérale.
 */
export function StandaloneShell({
  actions,
  children,
}: {
  /** Contenu à droite de l'en-tête (notifications, thème, menu utilisateur) */
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      <header className={HEADER_BAR}>
        <Brand />
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      </header>
      <main className={cn(CONTENT_AREA, 'pb-10')}>{children}</main>
    </div>
  )
}
