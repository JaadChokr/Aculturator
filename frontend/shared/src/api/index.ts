import { httpApi } from './http'
import type { Api } from './types'

/**
 * Point d'accès unique aux données pour tous les portails.
 * Le frontend parle toujours HTTP : vrai backend ou serveur de démo (mock-server), il ne fait pas
 * la différence.
 */
export const api: Api = httpApi

export { API_URL } from './config'
export { ApiError } from './http/client'
export type * from './types'
