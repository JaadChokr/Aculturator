import type { Parcours } from '@acculturator/contracts'
import { SST } from './sst/index.ts'
import type { ParcoursContent } from './types.ts'

/**
 * Parcours servis par le serveur de démo, dans l'ordre de la page de choix.
 * Ajouter un parcours : créer `data/<id>/` sur le modèle de `data/sst/`, puis l'ajouter ici.
 */
const CONTENTS: ParcoursContent[] = [SST]

/** Liste renvoyée par `GET /parcours` (chiffres calculés à partir de chaque catalogue). */
export const PARCOURS: Parcours[] = CONTENTS.map(({ parcours, catalog }) => ({
  ...parcours,
  stats: {
    themes: catalog.themes.length,
    resources: catalog.resources.length,
    flashcards: catalog.flashcards.length,
    quizQuestions: catalog.quizQuestions.length,
  },
}))

/** Contenu d'un parcours ouvert (statut « available »), ou undefined. */
export const contentOf = (id: string): ParcoursContent | undefined =>
  CONTENTS.find((c) => c.parcours.id === id && c.parcours.status === 'available')
