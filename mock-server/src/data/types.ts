import type { Catalog, ChatLink, Parcours, ThemeId } from '@acculturator/contracts'

/**
 * Tout ce que le serveur de démo sait d'un parcours. Un parcours = un dossier `data/<id>/` dont
 * l'`index.ts` exporte un `ParcoursContent`, enregistré dans `data/parcours.ts`.
 */
export interface ParcoursContent {
  /** Fiche du parcours ; ses chiffres (`stats`) sont calculés à partir du catalogue */
  parcours: Omit<Parcours, 'stats' | 'progress'>
  /** Catalogue servi par `GET /parcours/:id/catalog` */
  catalog: Catalog
  /** Assistant de démo du parcours (`POST /parcours/:id/chat`, `GET …/chat/suggestions`) */
  assistant: AssistantContent
}

/** Base de l'assistant de démo : réponses de référence retrouvées par mots-clés. */
export interface AssistantContent {
  knowledge: ChatKnowledge[]
  /** Idées de questions du carrousel */
  suggestions: string[]
  /** Réponse à un simple « bonjour » (sinon : présentation générée depuis `branding`) */
  greeting?: string
  /** Réponse quand aucune réponse de référence ne correspond à la question */
  fallback: string
}

export interface ChatKnowledge {
  id: string
  keywords: string[]
  answer: string
  links?: ChatLink[]
  themeId?: ThemeId
}
