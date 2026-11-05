import { Brain, Car, Flame, HeartPulse, Monitor, PersonStanding, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ThemeId } from '@acculturator/contracts'

/**
 * Référentiel des thématiques SST et leur habillage (icône, repère couleur).
 * Les identifiants sont partagés avec le backend ; l'habillage reste propre au frontend.
 */
export interface Theme {
  id: ThemeId
  title: string
  short: string
  description: string
  icon: LucideIcon
  /** Repère couleur discret de la thématique (classe Tailwind statique) */
  dot: string
}

export const THEMES: Theme[] = [
  {
    id: 'fondamentaux',
    title: 'Fondamentaux SST',
    short: 'Fondamentaux',
    description:
      'Acteurs, droits et obligations : DUERP, droit d’alerte et de retrait, accident du travail.',
    icon: ShieldCheck,
    dot: 'bg-primary',
  },
  {
    id: 'postures',
    title: 'Gestes & postures',
    short: 'Postures',
    description: 'Prévenir les troubles musculosquelettiques (TMS) et bien porter une charge.',
    icon: PersonStanding,
    dot: 'bg-amber-600',
  },
  {
    id: 'ecran',
    title: 'Travail sur écran',
    short: 'Écran',
    description: 'Régler son poste, protéger ses yeux et bouger régulièrement.',
    icon: Monitor,
    dot: 'bg-sky-700',
  },
  {
    id: 'rps',
    title: 'Risques psychosociaux',
    short: 'RPS',
    description: 'Stress, charge mentale, harcèlement : repérer, en parler, être aidé.',
    icon: Brain,
    dot: 'bg-violet-700',
  },
  {
    id: 'incendie',
    title: 'Incendie & évacuation',
    short: 'Incendie',
    description: 'Réagir à un départ de feu, utiliser le bon extincteur, évacuer en sécurité.',
    icon: Flame,
    dot: 'bg-orange-600',
  },
  {
    id: 'secours',
    title: 'Premiers secours',
    short: 'Secours',
    description: 'Protéger, alerter, secourir : les bons réflexes face à un accident.',
    icon: HeartPulse,
    dot: 'bg-emerald-700',
  },
  {
    id: 'routier',
    title: 'Risque routier',
    short: 'Routier',
    description: 'Trajets et déplacements professionnels : anticiper, ne pas se laisser distraire.',
    icon: Car,
    dot: 'bg-slate-500',
  },
]

export const THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<
  ThemeId,
  Theme
>
export const getTheme = (id: ThemeId) => THEME_BY_ID[id]
