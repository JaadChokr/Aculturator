import type { ReactNode } from 'react'
import { cn } from '../lib'

/**
 * Largeurs de page communes : une page ne fixe jamais sa largeur elle-même, elle choisit
 * l'une de celles-ci (vérifié par ESLint dans les portails).
 * - full   : rubriques (tableau de bord, listes, catalogues) — toute la zone de contenu
 * - focus  : une activité en cours (quiz, choix du niveau, résultats, assistant)
 * - narrow : un objet à la fois (carte de révision)
 */
export type PageWidth = 'full' | 'focus' | 'narrow'

export const PAGE_WIDTH: Record<PageWidth, string> = {
  full: 'w-full',
  focus: 'mx-auto w-full max-w-5xl',
  narrow: 'mx-auto w-full max-w-4xl',
}

export function Page({
  width = 'full',
  className,
  children,
}: {
  width?: PageWidth
  className?: string
  children: ReactNode
}) {
  return <div className={cn(PAGE_WIDTH[width], className)}>{children}</div>
}
