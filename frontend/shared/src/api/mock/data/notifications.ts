import type { AppNotification, Role } from '@acculturator/contracts'

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()

/**
 * Notifications de démonstration, par rôle.
 * En production : à remplacer par l'API (ou un flux temps réel).
 */
const BY_ROLE: Record<Role, Omit<AppNotification, 'read'>[]> = {
  collaborateur: [
    {
      id: 'n-c1',
      kind: 'safety',
      title: 'Exercice d’évacuation jeudi à 10 h',
      body: 'Site Lyon – Part-Dieu. Point de rassemblement : parking nord.',
      to: '/collaborateur/ressources?r=r-evacuation',
      createdAt: ago(35),
    },
    {
      id: 'n-c2',
      kind: 'content',
      title: 'Nouveau contenu obligatoire',
      body: 'Harcèlement et agissements sexistes : réagir (3 min).',
      to: '/collaborateur/ressources?r=r-harcelement',
      createdAt: ago(60 * 3),
    },
    {
      id: 'n-c3',
      kind: 'review',
      title: 'Des cartes vous attendent',
      body: 'Votre révision du jour est prête : quelques minutes suffisent.',
      to: '/collaborateur/flashcards',
      createdAt: ago(60 * 7),
    },
    {
      id: 'n-c4',
      kind: 'team',
      title: 'Défi d’équipe Logistique',
      body: 'Vous êtes 3e cette semaine. Plus que 340 XP pour la 2e place.',
      to: '/collaborateur',
      createdAt: ago(60 * 26),
    },
    {
      id: 'n-c5',
      kind: 'badge',
      title: 'Badge débloqué : Cinéphile prévention',
      body: 'Vous avez consulté 5 ressources.',
      to: '/collaborateur/trophees',
      createdAt: ago(60 * 50),
    },
  ],
  referent: [
    {
      id: 'n-r1',
      kind: 'report',
      title: 'Nouvelle remontée terrain',
      body: 'Câble en travers d’un passage signalé au 2e étage.',
      to: '/referent/remontees',
      createdAt: ago(20),
    },
    {
      id: 'n-r2',
      kind: 'content',
      title: '4 collaborateurs en retard',
      body: 'Le module obligatoire « Protéger, Alerter, Secourir » n’a pas été suivi.',
      to: '/referent/equipe',
      createdAt: ago(60 * 5),
    },
  ],
  admin: [
    {
      id: 'n-a1',
      kind: 'content',
      title: '2 contenus en attente de validation QHSE',
      body: 'Fiche « Risque chimique » et quiz « Travail en hauteur ».',
      to: '/admin/contenus',
      createdAt: ago(60 * 2),
    },
  ],
}

export const notificationsForRole = (role: Role) => BY_ROLE[role]
