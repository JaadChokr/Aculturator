import { lazy, type ReactNode } from 'react'
import type { ActivityId } from '@acculturator/contracts'
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
import { RequireActivity } from './components/RequireActivity'
import { offers } from './store/activities'
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

const only = (activity: ActivityId | ActivityId[], page: ReactNode) => (
  <RequireActivity activity={activity}>{page}</RequireActivity>
)

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ModulesPage = lazy(() => import('./pages/ModulesPage'))
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
  description: 'Se former aux contenus de son parcours, à son rythme et en jouant.',
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
          hidden: () => !offers('resources'),
        },
        {
          label: 'Flashcards',
          short: 'Cartes',
          to: collabPath('flashcards'),
          icon: Layers,
          badge: () => countDue(useProgress.getState().cards) || null,
          hidden: () => !offers('flashcards'),
        },
        {
          label: 'Quiz & défis',
          short: 'Quiz',
          to: collabPath('quiz'),
          icon: Trophy,
          hidden: () => !offers('quiz') && !offers('hazard-hunt'),
        },
        {
          label: 'Assistant',
          to: collabPath('assistant'),
          icon: Bot,
          hidden: () => !offers('assistant'),
        },
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
    { path: 'ressources', element: only('resources', <ResourcesPage />) },
    { path: 'flashcards', element: only('flashcards', <FlashcardsPage />) },
    { path: 'flashcards/session', element: only('flashcards', <FlashcardSessionPage />) },
    { path: 'quiz', element: only(['quiz', 'hazard-hunt'], <QuizHubPage />) },
    { path: 'quiz/jouer', element: only('quiz', <QuizPlayPage />) },
    { path: 'quiz/chasse-aux-risques', element: only('hazard-hunt', <HazardHuntPage />) },
    { path: 'assistant', element: only('assistant', <ChatbotPage />) },
    { path: 'trophees', element: <TrophiesPage /> },
  ],
}
