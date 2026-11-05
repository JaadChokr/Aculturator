import { API_MODE } from './config'
import { httpApi } from './http'
import { mockApi } from './mock'
import type { Api } from './types'

/** Point d'accès unique aux données pour tous les portails. */
export const api: Api = API_MODE === 'http' ? httpApi : mockApi

export { API_MODE, API_URL } from './config'
export { ApiError } from './http/client'
export type * from './types'
