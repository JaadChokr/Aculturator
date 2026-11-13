import {
  BookOpen,
  Brain,
  Car,
  Flame,
  Globe,
  HeartPulse,
  Leaf,
  Lightbulb,
  Lock,
  Monitor,
  PersonStanding,
  Scale,
  ShieldCheck,
  ShieldPlus,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Habillage des thématiques (et icône des parcours). Les thématiques elles-mêmes (titres, descriptions) viennent du
 * catalogue de chaque parcours (`Catalog.themes`) ; celui-ci choisit pour chacune une icône et une
 * couleur parmi les clés ci-dessous. Une clé inconnue retombe sur un habillage neutre : ajouter un
 * parcours ne demande pas de toucher au code, sauf pour enrichir ces palettes.
 */
export const THEME_ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  'shield-plus': ShieldPlus,
  posture: PersonStanding,
  screen: Monitor,
  mind: Brain,
  fire: Flame,
  health: HeartPulse,
  car: Car,
  book: BookOpen,
  idea: Lightbulb,
  lock: Lock,
  leaf: Leaf,
  scale: Scale,
  people: Users,
  globe: Globe,
}

/** Repère couleur discret d'une thématique (classes Tailwind écrites en entier pour le build). */
export const THEME_COLORS: Record<string, string> = {
  primary: 'bg-primary',
  amber: 'bg-amber-600',
  sky: 'bg-sky-700',
  violet: 'bg-violet-700',
  orange: 'bg-orange-600',
  emerald: 'bg-emerald-700',
  slate: 'bg-slate-500',
  teal: 'bg-teal-700',
  indigo: 'bg-indigo-700',
  rose: 'bg-rose-700',
  stone: 'bg-stone-500',
}

export const themeIcon = (key: string): LucideIcon => THEME_ICONS[key] ?? BookOpen
export const themeDot = (key: string): string => THEME_COLORS[key] ?? 'bg-muted-foreground'
