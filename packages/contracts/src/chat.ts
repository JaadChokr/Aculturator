/** Échanges avec l'assistant (endpoint POST /api/chat). */
export interface ChatRequest {
  question: string
}

export interface ChatLink {
  label: string
  /** Chemin relatif au portail collaborateur (ex. « ressources?r=r-pas ») */
  to: string
}

export interface ChatReply {
  text: string
  links?: ChatLink[]
  /** Identifiant de la réponse de référence utilisée (traçabilité QHSE) */
  matched?: string
}
