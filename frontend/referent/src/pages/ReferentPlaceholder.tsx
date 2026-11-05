import { ComingSoon } from '@acculturator/design-system/components'

const SECTIONS = {
  overview: {
    title: 'Vue d’ensemble du périmètre',
    description:
      'Taux de participation, progression moyenne par thématique et alertes de l’équipe.',
    features: [
      'KPI d’engagement (actifs 7 j / 30 j)',
      'Progression moyenne par thématique',
      'Modules obligatoires non suivis',
      'Comparaison inter-sites anonymisée',
    ],
  },
  team: {
    title: 'Mon équipe',
    description: 'Suivi individuel des collaborateurs du périmètre.',
    features: [
      'Liste des collaborateurs + progression',
      'Relance ciblée (notification / mail)',
      'Export CSV',
      'Filtres par site / service',
    ],
  },
  stats: {
    title: 'Statistiques',
    description: 'Analyse des résultats pour cibler les actions de prévention.',
    features: [
      'Questions les plus échouées',
      'Indicateurs pédagogiques (engagement, réussite, ancrage des connaissances)',
      'Évolution dans le temps',
      'Questions posées au chatbot (anonymisées)',
    ],
  },
  campaigns: {
    title: 'Campagnes & défis',
    description: 'Animer la prévention avec des défis d’équipe ponctuels.',
    features: [
      'Créer un défi d’équipe daté',
      'Affecter un parcours obligatoire',
      'Classement d’équipe (opt-in)',
      'Messages d’encouragement',
    ],
  },
  reports: {
    title: 'Remontées terrain',
    description: 'Situations dangereuses et presqu’accidents signalés par les collaborateurs.',
    features: [
      'File des signalements',
      'Statut de traitement',
      'Lien avec le DUERP',
      'Retour au déclarant',
    ],
  },
}

export default function ReferentPlaceholder({ section }: { section: keyof typeof SECTIONS }) {
  return <ComingSoon {...SECTIONS[section]} />
}
