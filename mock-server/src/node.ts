import { createServer } from 'node:http'
import { createMockServer } from './routes.ts'
import { memoryStore } from './store.ts'

/**
 * Serveur de démo en local (Node ≥ 22.18, sans compilation) : mêmes routes que dans le navigateur,
 * exposées sur http://localhost:3000/api. Utile pour tester le frontend en conditions réelles
 * (VITE_MOCK_SERVER=false) ou comme référence d'implémentation pour l'équipe backend.
 */
const PORT = Number(process.env.PORT ?? 3000)
const PREFIX = '/api'
const handle = createMockServer({ store: memoryStore() })

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  if (!url.pathname.startsWith(`${PREFIX}/`)) {
    res.writeHead(404).end()
    return
  }
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const method = req.method ?? 'GET'
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value)
  }
  const request = new Request(url, {
    method,
    headers,
    body:
      method === 'GET' || method === 'HEAD' || !chunks.length ? undefined : Buffer.concat(chunks),
  })
  const response = await handle(request, url.pathname.slice(PREFIX.length))
  res.writeHead(response.status, Object.fromEntries(response.headers))
  res.end(Buffer.from(await response.arrayBuffer()))
  console.log(`${method} ${url.pathname} → ${response.status}`)
}).listen(PORT, () => {
  console.log(`[mock-server] API de démonstration sur http://localhost:${PORT}${PREFIX}`)
})
