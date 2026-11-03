import { lazy } from 'react'
import {
  BookOpenCheck,
  Building2,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserCog,
} from 'lucide-react'
import type { PortalDefinition } from '@/shared/types/portal'

const Page = lazy(() => import('./pages/AdminPlaceholder'))
const base = '/admin'

/** Portail Administrateur — squelette à développer. */
export const adminPortal: PortalDefinition = {
  id: 'admin',
  label: 'Portail administrateur',
  basePath: base,
  description: 'Gestion des contenus, des utilisateurs et de la configuration.',
  icon: ShieldCheck,
  allowedRoles: ['admin'],
  nav: [
    {
      items: [
        { label: 'Pilotage', short: 'Accueil', to: base, icon: LayoutDashboard, end: true },
        {
          label: 'Contenus pédagogiques',
          short: 'Contenus',
          to: `${base}/contenus`,
          icon: BookOpenCheck,
        },
        {
          label: 'Utilisateurs & rôles',
          short: 'Utilisateurs',
          to: `${base}/utilisateurs`,
          icon: UserCog,
        },
        { label: 'Sites & équipes', short: 'Sites', to: `${base}/organisation`, icon: Building2 },
        { label: 'Paramètres', short: 'Réglages', to: `${base}/parametres`, icon: Settings },
      ],
    },
  ],
  routes: [
    { index: true, element: <Page section="overview" /> },
    { path: 'contenus', element: <Page section="content" /> },
    { path: 'utilisateurs', element: <Page section="users" /> },
    { path: 'organisation', element: <Page section="org" /> },
    { path: 'parametres', element: <Page section="settings" /> },
  ],
}
