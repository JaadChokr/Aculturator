import { createMockServer } from './routes.ts'
import { browserStore } from './store.ts'

/**
 * Serveur de démo dans le navigateur : intercepte les appels `fetch` vers l'API et y répond
 * localement. Aucun service worker ni serveur requis (fonctionne aussi dans la démo statique).
 * Le frontend ne voit que des requêtes HTTP : il ignore qu'il parle à un faux backend.
 */
export function installMockServer({ baseUrl = '/api' }: { baseUrl?: string } = {}) {
  const handle = createMockServer({ store: browserStore() })
  const realFetch = window.fetch.bind(window)
  const base = new URL(baseUrl, window.location.href)
  const prefix = base.pathname.replace(/\/$/, '')

  window.fetch = async (input, init) => {
    const request = new Request(input, init)
    const url = new URL(request.url)
    const path = url.pathname.slice(prefix.length)
    const isApi =
      url.origin === base.origin &&
      url.pathname.startsWith(prefix) &&
      (path === '' || path.startsWith('/'))
    return isApi ? handle(request, path || '/') : realFetch(input, init)
  }

  console.info(`[mock-server] API de démonstration active sur ${prefix}`)
}
