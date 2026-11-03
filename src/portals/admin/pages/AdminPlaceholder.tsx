import { ComingSoon } from '@/shared/components/ComingSoon'

const SECTIONS = {
  overview: {
    title: 'Pilotage global',
    description: 'Indicateurs consolidés de l’acculturation SST à l’échelle de l’entreprise.',
    features: [
      'KPI globaux et par site',
      'Taux de complétion des modules obligatoires',
      'Export pour le CSE / bilan annuel',
      'Journal d’activité',
    ],
  },
  content: {
    title: 'Contenus pédagogiques',
    description:
      'Créer et publier ressources, flashcards, quiz, scènes de chasse aux risques et base du chatbot.',
    features: [
      'Éditeur de ressources (vidéo, fiche, podcast…)',
      'Banque de questions + niveaux de difficulté',
      'Éditeur de flashcards par thématique',
      'Workflow de validation QHSE',
      'Gestion des thématiques',
    ],
  },
  users: {
    title: 'Utilisateurs & rôles',
    description: 'Attribution des droits collaborateur / référent / administrateur.',
    features: [
      'Synchronisation annuaire (SSO)',
      'Attribution des rôles',
      'Rattachement référent ↔ périmètre',
      'Désactivation / RGPD',
    ],
  },
  org: {
    title: 'Sites & équipes',
    description: 'Structure organisationnelle utilisée pour les périmètres et statistiques.',
    features: [
      'Arborescence sites / services',
      'Référents par site',
      'Points de rassemblement & contacts urgence par site',
    ],
  },
  settings: {
    title: 'Paramètres',
    description: 'Configuration de la plateforme et de la gamification.',
    features: [
      'Barème XP et niveaux',
      'Badges et missions du jour',
      'Activation du classement d’équipe',
      'Paramètres du chatbot',
    ],
  },
}

export default function AdminPlaceholder({ section }: { section: keyof typeof SECTIONS }) {
  return <ComingSoon {...SECTIONS[section]} />
}
