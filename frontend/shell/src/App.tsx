import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { RouterProvider } from 'react-router'
import { AuthProvider } from '@acculturator/core/auth'
import { CatalogProvider } from '@acculturator/core/catalog'
import { FullPageLoader, Toaster } from '@acculturator/design-system/components'
import { PortalRegistryProvider } from '@acculturator/core/portal'
import { ThemeProvider } from '@acculturator/design-system/theme'
import { TooltipProvider } from '@acculturator/design-system/ui'
import { PORTALS } from './portals'
import { router } from './router'

/** Cache des données serveur (TanStack Query) partagé par tous les portails. */
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

/**
 * Assemblage de l'application :
 * thème → cache de données → utilisateur connecté → catalogue → registre des portails → routes.
 */
export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider fallback={<FullPageLoader label="Connexion…" />}>
          <CatalogProvider fallback={<FullPageLoader label="Chargement des contenus…" />}>
            <PortalRegistryProvider portals={PORTALS}>
              <MotionConfig reducedMotion="user">
                <TooltipProvider delayDuration={200}>
                  <RouterProvider router={router} />
                  <Toaster />
                </TooltipProvider>
              </MotionConfig>
            </PortalRegistryProvider>
          </CatalogProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
