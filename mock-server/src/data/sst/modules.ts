import type { ModulesPlan } from '@acculturator/contracts'

/**
 * Parcours SST organisé en 5 modules, à suivre dans l'ordre : chaque module se débloque
 * quand le précédent est terminé. Les étapes renvoient vers les contenus du catalogue.
 */
export const MODULES: ModulesPlan = {
  ordering: 'sequential',
  modules: [
    {
      id: 'm-fondamentaux',
      title: 'Les fondamentaux de la prévention',
      description: 'Qui fait quoi, vos droits et les bons réflexes en cas d’accident du travail.',
      themeIds: ['fondamentaux'],
      durationMin: 20,
      steps: [
        { kind: 'resource', resourceId: 'r-acteurs' },
        { kind: 'resource', resourceId: 'r-droit-retrait' },
        { kind: 'resource', resourceId: 'r-at' },
        { kind: 'flashcards', themeId: 'fondamentaux' },
        {
          kind: 'quiz',
          questionIds: ['q-duerp', 'q-retrait', 'q-at', 'q-epi', 'q-quasi'],
          passRatio: 0.75,
        },
      ],
    },
    {
      id: 'm-poste',
      title: 'Mon poste de travail',
      description: 'Porter sans se blesser, prévenir les TMS et régler son poste sur écran.',
      themeIds: ['postures', 'ecran'],
      durationMin: 25,
      steps: [
        { kind: 'resource', resourceId: 'r-charges' },
        { kind: 'resource', resourceId: 'r-tms' },
        { kind: 'resource', resourceId: 'r-poste' },
        { kind: 'resource', resourceId: 'r-202020' },
        { kind: 'flashcards', themeId: 'postures' },
        { kind: 'flashcards', themeId: 'ecran' },
        {
          kind: 'quiz',
          questionIds: ['q-tms', 'q-charge', 'q-torsion', 'q-ecran', 'q-202020', 'q-fenetre'],
          passRatio: 0.75,
        },
      ],
    },
    {
      id: 'm-rps',
      title: 'Prévenir les risques psychosociaux',
      description: 'Reconnaître le stress, réagir face au harcèlement et préserver sa déconnexion.',
      themeIds: ['rps'],
      durationMin: 15,
      steps: [
        { kind: 'resource', resourceId: 'r-stress' },
        { kind: 'resource', resourceId: 'r-harcelement' },
        { kind: 'flashcards', themeId: 'rps' },
        {
          kind: 'quiz',
          questionIds: ['q-rps', 'q-temoin', 'q-stress', 'q-deco'],
          passRatio: 0.75,
        },
      ],
    },
    {
      id: 'm-urgence',
      title: 'Réagir en cas d’urgence',
      description: 'Incendie, évacuation et premiers secours : les gestes qui comptent.',
      themeIds: ['incendie', 'secours'],
      durationMin: 30,
      steps: [
        { kind: 'resource', resourceId: 'r-extincteurs' },
        { kind: 'resource', resourceId: 'r-evacuation' },
        { kind: 'resource', resourceId: 'r-pas' },
        { kind: 'resource', resourceId: 'r-numeros' },
        { kind: 'hazard', sceneId: 'open-space' },
        { kind: 'flashcards', themeId: 'incendie' },
        { kind: 'flashcards', themeId: 'secours' },
        {
          kind: 'quiz',
          questionIds: ['q-triangle', 'q-co2', 'q-fumee', 'q-pas', 'q-15', 'q-dae'],
          passRatio: 0.75,
        },
      ],
    },
    {
      id: 'm-route',
      title: 'Sur la route',
      description: 'Préparer ses trajets professionnels et rester vigilant au volant.',
      themeIds: ['routier'],
      durationMin: 10,
      steps: [
        { kind: 'resource', resourceId: 'r-route' },
        { kind: 'flashcards', themeId: 'routier' },
        {
          kind: 'quiz',
          questionIds: ['q-route', 'q-tel', 'q-pause-route'],
          passRatio: 0.75,
        },
      ],
    },
  ],
}
