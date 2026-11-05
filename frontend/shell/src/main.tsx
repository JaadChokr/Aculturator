import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { API_URL } from '@acculturator/shared/api'
import '@acculturator/shared/styles.css'
import { App } from './App'

async function boot() {
  // Démo et développement : le faux backend répond aux appels /api directement dans le navigateur.
  // Absent du build de production (import dynamique éliminé quand la variable n'est pas définie).
  if (import.meta.env.VITE_MOCK_SERVER === 'true') {
    const { installMockServer } = await import('@acculturator/mock-server/browser')
    installMockServer({ baseUrl: API_URL })
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void boot()
