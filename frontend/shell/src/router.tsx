import {
  createBrowserRouter,
  createHashRouter,
  createMemoryRouter,
  Link,
  Navigate,
  type RouteObject,
} from 'react-router'
import { PortalLayout } from '@acculturator/shared/layout'
import { Button } from '@acculturator/shared/ui'
import { Mascot } from '@acculturator/shared/components'
import { useAuth } from '@acculturator/shared/auth'
import { homePortalFor } from '@acculturator/shared/portal'
import { RequireRole } from './RequireRole'
import { PORTALS } from './portals'

function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={homePortalFor(PORTALS, user.role)?.basePath ?? '/'} replace />
}

function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <Mascot mood="oops" className="mx-auto mb-4 size-28" />
        <h1 className="mb-2 text-2xl font-bold">Page introuvable</h1>
        <p className="mb-6 text-muted-foreground">
          Cette zone n’est pas balisée… revenons en lieu sûr.
        </p>
        <Button asChild>
          <Link to="/">Retour à l’accueil</Link>
        </Button>
      </div>
    </div>
  )
}

const routes: RouteObject[] = [
  { path: '/', element: <HomeRedirect /> },
  ...PORTALS.map<RouteObject>((portal) => ({
    path: portal.basePath,
    element: (
      <RequireRole roles={portal.allowedRoles}>
        <PortalLayout portal={portal} />
      </RequireRole>
    ),
    children: portal.routes,
  })),
  { path: '*', element: <NotFound /> },
]

// Browser router en production ; hash ou mémoire pour les builds de démo statiques (iframe, fichier local…)
const mode = import.meta.env.VITE_ROUTER_MODE
export const router =
  mode === 'memory'
    ? createMemoryRouter(routes)
    : mode === 'hash'
      ? createHashRouter(routes)
      : createBrowserRouter(routes)
