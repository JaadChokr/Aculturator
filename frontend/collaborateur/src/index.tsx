import { lazy } from 'react'
import {
  Bot,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Milestone,
  PlayCircle,
  Trophy,
} from 'lucide-react'
import { getCatalog } from '@acculturator/core/catalog'
import type { PortalDefinition } from '@acculturator/core/portal'
import { HeaderStats } from './components/HeaderStats'
import { parcoursProgress } from './store/parcoursProgress'
import { countDue, useProgress } from './store/progress'
import { COLLAB_BASE, collabPath } from './paths'

const hasModules = () => {
  try {
    return !!getCatalog().modules?.modules.length
  } catch {
    return false
  }
}

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ModulesPage = lazy(() => import('./pages/ModulesPage'))
const ModulePage = lazy(() => import('./pages/ModulePage'))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'))
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'))
const FlashcardSessionPage = lazy(() => import('./pages/FlashcardSessionPage'))
const QuizHubPage = lazy(() => import('./pages/QuizHubPage'))
const QuizPlayPage = lazy(() => import('./pages/QuizPlayPage'))
const HazardHuntPage = lazy(() => import('./pages/HazardHuntPage'))
const ChatbotPage = lazy(() => import('./pages/ChatbotPage'))
const TrophiesPage = lazy(() => import('./pages/TrophiesPage'))

export const collaborateurPortal: PortalDefinition = {
  id: 'collaborateur',
  label: 'Espace collaborateur',
  basePath: COLLAB_BASE,
  description: 'Se former à la santé et la sécurité au travail, à son rythme et en jouant.',
  icon: GraduationCap,
  // Les référents et admins sont aussi des collaborateurs : ils accèdent à cet espace.
  allowedRoles: ['collaborateur', 'referent', 'admin'],
  HeaderSlot: HeaderStats,
  parcoursProgress,
  nav: [
    {
      title: 'Apprendre',
      items: [
        {
          label: 'Tableau de bord',
          short: 'Accueil',
          to: COLLAB_BASE,
          icon: LayoutDashboard,
          end: true,
        },
        {
          label: 'Modules',
          to: collabPath('modules'),
          icon: Milestone,
          // Seulement pour les parcours organisés en modules
          hidden: () => !hasModules(),
        },
        {
          label: 'Vidéos & ressources',
          short: 'Ressources',
          to: collabPath('ressources'),
          icon: PlayCircle,
        },
        {
          label: 'Flashcards',
          short: 'Cartes',
          to: collabPath('flashcards'),
          icon: Layers,
          badge: () => countDue(useProgress.getState().cards) || null,
        },
        { label: 'Quiz & défis', short: 'Quiz', to: collabPath('quiz'), icon: Trophy },
        { label: 'Prévi, l’assistant', short: 'Prévi', to: collabPath('assistant'), icon: Bot },
      ],
    },
    {
      title: 'Ma progression',
      items: [
        {
          label: 'Trophées & niveaux',
          short: 'Trophées',
          to: collabPath('trophees'),
          icon: GraduationCap,
        },
      ],
    },
  ],
  routes: [
    { index: true, element: <DashboardPage /> },
    { path: 'modules', element: <ModulesPage /> },
    { path: 'modules/:moduleId', element: <ModulePage /> },
    { path: 'ressources', element: <ResourcesPage /> },
    { path: 'flashcards', element: <FlashcardsPage /> },
    { path: 'flashcards/session', element: <FlashcardSessionPage /> },
    { path: 'quiz', element: <QuizHubPage /> },
    { path: 'quiz/jouer', element: <QuizPlayPage /> },
    { path: 'quiz/chasse-aux-risques', element: <HazardHuntPage /> },
    { path: 'assistant', element: <ChatbotPage /> },
    { path: 'trophees', element: <TrophiesPage /> },
  ],
}
