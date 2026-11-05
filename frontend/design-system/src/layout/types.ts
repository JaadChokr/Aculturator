import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  /** Libellé court pour la barre mobile */
  short?: string
  to: string
  icon: LucideIcon
  /** Pastille affichée à droite (ex : nombre de cartes à réviser) */
  badge?: () => number | string | null
  end?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}
