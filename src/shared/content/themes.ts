import type { Theme, ThemeId } from './types'

export const THEMES: Theme[] = [
  {
    id: 'fondamentaux',
    title: 'Fondamentaux SST',
    short: 'Fondamentaux',
    description:
      'Acteurs, droits et obligations : DUERP, droit d’alerte et de retrait, accident du travail.',
    emoji: '🛡️',
    tone: {
      solid: 'bg-teal-600',
      soft: 'bg-teal-500/12 text-teal-700 dark:text-teal-300',
      gradient: 'from-teal-500 to-emerald-600',
      text: 'text-teal-700 dark:text-teal-300',
      ring: 'ring-teal-500/40',
    },
  },
  {
    id: 'postures',
    title: 'Gestes & postures',
    short: 'Postures',
    description: 'Prévenir les troubles musculosquelettiques (TMS) et bien porter une charge.',
    emoji: '🏋️',
    tone: {
      solid: 'bg-orange-500',
      soft: 'bg-orange-500/12 text-orange-700 dark:text-orange-300',
      gradient: 'from-orange-400 to-amber-600',
      text: 'text-orange-700 dark:text-orange-300',
      ring: 'ring-orange-500/40',
    },
  },
  {
    id: 'ecran',
    title: 'Travail sur écran',
    short: 'Écran',
    description: 'Régler son poste, protéger ses yeux et bouger régulièrement.',
    emoji: '💻',
    tone: {
      solid: 'bg-sky-600',
      soft: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
      gradient: 'from-sky-500 to-blue-600',
      text: 'text-sky-700 dark:text-sky-300',
      ring: 'ring-sky-500/40',
    },
  },
  {
    id: 'rps',
    title: 'Risques psychosociaux',
    short: 'RPS',
    description: 'Stress, charge mentale, harcèlement : repérer, en parler, être aidé.',
    emoji: '🧠',
    tone: {
      solid: 'bg-violet-600',
      soft: 'bg-violet-500/12 text-violet-700 dark:text-violet-300',
      gradient: 'from-violet-500 to-purple-600',
      text: 'text-violet-700 dark:text-violet-300',
      ring: 'ring-violet-500/40',
    },
  },
  {
    id: 'incendie',
    title: 'Incendie & évacuation',
    short: 'Incendie',
    description: 'Réagir à un départ de feu, utiliser le bon extincteur, évacuer en sécurité.',
    emoji: '🔥',
    tone: {
      solid: 'bg-red-600',
      soft: 'bg-red-500/12 text-red-700 dark:text-red-300',
      gradient: 'from-red-500 to-rose-600',
      text: 'text-red-700 dark:text-red-300',
      ring: 'ring-red-500/40',
    },
  },
  {
    id: 'secours',
    title: 'Premiers secours',
    short: 'Secours',
    description: 'Protéger, alerter, secourir : les bons réflexes face à un accident.',
    emoji: '🚑',
    tone: {
      solid: 'bg-pink-600',
      soft: 'bg-pink-500/12 text-pink-700 dark:text-pink-300',
      gradient: 'from-pink-500 to-rose-600',
      text: 'text-pink-700 dark:text-pink-300',
      ring: 'ring-pink-500/40',
    },
  },
  {
    id: 'routier',
    title: 'Risque routier',
    short: 'Routier',
    description: 'Trajets et déplacements professionnels : anticiper, ne pas se laisser distraire.',
    emoji: '🚗',
    tone: {
      solid: 'bg-amber-500',
      soft: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
      gradient: 'from-amber-400 to-yellow-600',
      text: 'text-amber-800 dark:text-amber-300',
      ring: 'ring-amber-500/40',
    },
  },
]

export const THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<
  ThemeId,
  Theme
>
export const getTheme = (id: ThemeId) => THEME_BY_ID[id]
