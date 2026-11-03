import { lazy } from 'react'
import { BarChart3, ClipboardCheck, LayoutDashboard, MessageCircleWarning, Users } from 'lucide-react'
import type { PortalDefinition } from '@/shared/types/portal'

const Page = lazy(() => import('./pages/ReferentPlaceholder'))
const base = '/referent'

/**
 * Portail Référent SST — squelette à développer.
 * Toutes les rubriques pointent vers un gabarit décrivant le périmètre attendu.
 */
export const referentPortal: PortalDefinition = {
  id: 'referent',
  label: 'Portail référent',
  basePath: base,
  description: 'Suivi de l’acculturation de son périmètre et animation de la prévention.',
  icon: Users,
  allowedRoles: ['referent', 'admin'],
  nav: [
    {
      items: [
        { label: 'Vue d’ensemble', short: 'Accueil', to: base, icon: LayoutDashboard, end: true },
        { label: 'Mon équipe', short: 'Équipe', to: `${base}/equipe`, icon: Users },
        { label: 'Statistiques', short: 'Stats', to: `${base}/statistiques`, icon: BarChart3 },
        { label: 'Campagnes & défis', short: 'Défis', to: `${base}/campagnes`, icon: ClipboardCheck },
        { label: 'Remontées terrain', short: 'Remontées', to: `${base}/remontees`, icon: MessageCircleWarning },
      ],
    },
  ],
  routes: [
    { index: true, element: <Page section="overview" /> },
    { path: 'equipe', element: <Page section="team" /> },
    { path: 'statistiques', element: <Page section="stats" /> },
    { path: 'campagnes', element: <Page section="campaigns" /> },
    { path: 'remontees', element: <Page section="reports" /> },
  ],
}
