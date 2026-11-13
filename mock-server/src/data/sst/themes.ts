import type { Theme } from '@acculturator/contracts'

/**
 * Thématiques du parcours SST. `icon` et `color` sont des clés des palettes du design system
 * (`frontend/packages/design-system/src/themes/index.ts`).
 */
export const THEMES: Theme[] = [
  {
    id: 'fondamentaux',
    title: 'Fondamentaux SST',
    short: 'Fondamentaux',
    description:
      'Acteurs, droits et obligations : DUERP, droit d’alerte et de retrait, accident du travail.',
    icon: 'shield',
    color: 'primary',
  },
  {
    id: 'postures',
    title: 'Gestes & postures',
    short: 'Postures',
    description: 'Prévenir les troubles musculosquelettiques (TMS) et bien porter une charge.',
    icon: 'posture',
    color: 'amber',
  },
  {
    id: 'ecran',
    title: 'Travail sur écran',
    short: 'Écran',
    description: 'Régler son poste, protéger ses yeux et bouger régulièrement.',
    icon: 'screen',
    color: 'sky',
  },
  {
    id: 'rps',
    title: 'Risques psychosociaux',
    short: 'RPS',
    description: 'Stress, charge mentale, harcèlement : repérer, en parler, être aidé.',
    icon: 'mind',
    color: 'violet',
  },
  {
    id: 'incendie',
    title: 'Incendie & évacuation',
    short: 'Incendie',
    description: 'Réagir à un départ de feu, utiliser le bon extincteur, évacuer en sécurité.',
    icon: 'fire',
    color: 'orange',
  },
  {
    id: 'secours',
    title: 'Premiers secours',
    short: 'Secours',
    description: 'Protéger, alerter, secourir : les bons réflexes face à un accident.',
    icon: 'health',
    color: 'emerald',
  },
  {
    id: 'routier',
    title: 'Risque routier',
    short: 'Routier',
    description: 'Trajets et déplacements professionnels : anticiper, ne pas se laisser distraire.',
    icon: 'car',
    color: 'slate',
  },
]
