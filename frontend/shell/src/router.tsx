import {
  createBrowserRouter,
  createHashRouter,
  createMemoryRouter,
  Link,
  type RouteObject,
} from 'react-router'
import { Button } from '@acculturator/design-system/ui'
import { Mascot } from '@acculturator/design-system/components'
import { ParcoursPage } from './ParcoursPage'
import { PortalLayout } from './PortalLayout'
import { RequireParcours } from './RequireParcours'
import { RequireRole } from './RequireRole'
import { PORTALS } from './portals'

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
  // Point d'entrée : choix du parcours, puis portail d'accueil du profil
  { path: '/', element: <ParcoursPage /> },
  ...PORTALS.map<RouteObject>((portal) => ({
    path: portal.basePath,
    element: (
      <RequireRole roles={portal.allowedRoles}>
        <RequireParcours>
          <PortalLayout portal={portal} />
        </RequireParcours>
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
