import type { DecoySpot, HazardScene } from '@acculturator/contracts'
import { svgDataUri } from '../svg.ts'
import { OPEN_SPACE_SVG } from './scenes/open-space.ts'

const OPEN_SPACE_DECOYS: DecoySpot[] = [
  {
    x: 815,
    y: 320,
    r: 35,
    label: 'Extincteur',
    explanation:
      'Bien vu de le remarquer, mais tout va bien ici : il est accroché, signalé et accessible.',
  },
  {
    x: 140,
    y: 160,
    r: 70,
    label: 'Fenêtre',
    explanation:
      'Rien à signaler : l’écran est placé perpendiculairement à la fenêtre, sans reflet.',
  },
]

/** Coordonnées dans le repère de l'illustration de la scène (1000 × 600). */
export const HAZARD_SCENES: HazardScene[] = [
  {
    id: 'open-space',
    image: { src: svgDataUri(OPEN_SPACE_SVG), width: 1000, height: 600 },
    title: 'L’open space du lundi matin',
    description:
      'Six situations dangereuses se cachent dans ce bureau. Saurez-vous toutes les repérer ?',
    hazards: [
      {
        id: 'exit',
        x: 905,
        y: 350,
        r: 80,
        themeId: 'incendie',
        label: 'Issue de secours encombrée',
        explanation:
          'Les cartons bloquent la sortie de secours : en cas d’évacuation, chaque seconde compte. Les dégagements doivent rester libres en permanence.',
      },
      {
        id: 'chair',
        x: 722,
        y: 290,
        r: 85,
        themeId: 'fondamentaux',
        label: 'Chaise à roulettes utilisée comme escabeau',
        explanation:
          'Monter sur une chaise à roulettes expose à une chute de hauteur. On utilise un escabeau ou un marchepied stable.',
      },
      {
        id: 'cable',
        x: 560,
        y: 545,
        r: 60,
        themeId: 'fondamentaux',
        label: 'Câble en travers du passage',
        explanation:
          'Les chutes de plain-pied sont l’une des premières causes d’accidents du travail. On fait passer les câbles dans des goulottes.',
      },
      {
        id: 'plug',
        x: 470,
        y: 455,
        r: 45,
        themeId: 'incendie',
        label: 'Multiprises en cascade surchargées',
        explanation:
          'Brancher des multiprises les unes sur les autres provoque des surchauffes : c’est une cause fréquente de départ de feu.',
      },
      {
        id: 'spill',
        x: 245,
        y: 540,
        r: 55,
        themeId: 'fondamentaux',
        label: 'Liquide renversé au sol',
        explanation:
          'Un sol mouillé est glissant : on nettoie ou on balise immédiatement, et on signale si on ne peut pas intervenir.',
      },
      {
        id: 'drawer',
        x: 110,
        y: 445,
        r: 50,
        themeId: 'postures',
        label: 'Tiroir bas laissé ouvert',
        explanation:
          'Un tiroir ouvert dans un passage provoque chocs et chutes. On referme systématiquement après usage.',
      },
    ],
    decoys: OPEN_SPACE_DECOYS,
  },
]
