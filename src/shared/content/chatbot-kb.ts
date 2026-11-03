import type { ChatKnowledge } from './types'

/**
 * Base de connaissances du chatbot de démonstration (recherche par mots-clés).
 * En production, remplacer `MockChatService` par un service branché sur un
 * modèle de langage + RAG sur les contenus validés par l'équipe QHSE.
 */
export const CHAT_KB: ChatKnowledge[] = [
  {
    id: 'urgence',
    keywords: [
      'urgence',
      'numero',
      'numeros',
      'appeler',
      'samu',
      'pompier',
      '15',
      '18',
      '112',
      '114',
      'accident grave',
      'malaise',
    ],
    themeId: 'secours',
    answer:
      '**En cas d’urgence**, composez :\n• **15** — SAMU (urgence médicale)\n• **18** — Pompiers\n• **112** — Numéro d’urgence européen\n• **114** — Urgence par SMS\n\nPensez **P.A.S.** : Protéger, Alerter, Secourir. Prévenez aussi un Sauveteur Secouriste du Travail (SST) de votre site.',
    links: [
      { label: 'Fiche numéros d’urgence', to: 'ressources?r=r-numeros' },
      { label: 'Vidéo P.A.S.', to: 'ressources?r=r-pas' },
    ],
  },
  {
    id: 'retrait',
    keywords: [
      'retrait',
      'droit de retrait',
      'danger grave',
      'imminent',
      'refuser',
      'alerte',
      'droit d alerte',
    ],
    themeId: 'fondamentaux',
    answer:
      'Si vous avez un **motif raisonnable** de penser qu’une situation présente un **danger grave et imminent** pour votre vie ou votre santé :\n1. **Alertez** immédiatement votre responsable (ou un membre du CSE).\n2. Vous pouvez **vous retirer** de la situation, sans sanction ni retenue de salaire.\n3. Votre retrait ne doit pas créer de danger pour d’autres personnes.',
    links: [{ label: 'Fiche droit d’alerte et de retrait', to: 'ressources?r=r-droit-retrait' }],
  },
  {
    id: 'accident',
    keywords: [
      'accident',
      'blesse',
      'blessure',
      'declarer',
      'declaration',
      'at',
      'cpam',
      'tombe',
      'chute',
      'coupure',
    ],
    themeId: 'fondamentaux',
    answer:
      'Accident du travail, le bon timing :\n1. **Faites-vous soigner** (même si cela paraît bénin).\n2. **Informez votre employeur** dans la journée, au plus tard sous **24 h**.\n3. L’employeur **déclare** l’accident à la CPAM sous **48 h**.\n\nUn presqu’accident (sans blessure) se signale aussi : c’est précieux pour la prévention.',
    links: [{ label: 'Infographie accident du travail', to: 'ressources?r=r-at' }],
  },
  {
    id: 'dos',
    keywords: [
      'dos',
      'lombaire',
      'porter',
      'charge',
      'carton',
      'soulever',
      'manutention',
      'tms',
      'mal au dos',
      'epaule',
      'poignet',
    ],
    themeId: 'postures',
    answer:
      'Pour **porter une charge** sans se blesser :\n• Évaluez le poids, utilisez une aide (diable, chariot) si possible.\n• **Jambes fléchies, dos droit**, pieds écartés.\n• **Charge près du corps**, pas de torsion : on tourne avec les pieds.\n\nDouleurs ou fourmillements persistants ? Parlez-en au **médecin du travail** : ce sont des signes précoces de TMS.',
    links: [
      { label: 'Vidéo : porter une charge', to: 'ressources?r=r-charges' },
      { label: 'Flashcards Gestes & postures', to: 'flashcards?theme=postures' },
    ],
  },
  {
    id: 'ecran',
    keywords: [
      'ecran',
      'yeux',
      'fatigue visuelle',
      'bureau',
      'poste',
      'chaise',
      'siege',
      'souris',
      'clavier',
      'teletravail',
      'ordinateur',
      'nuque',
    ],
    themeId: 'ecran',
    answer:
      'Un poste écran bien réglé :\n• **Haut de l’écran au niveau des yeux**, à 50-70 cm.\n• Écran **perpendiculaire à la fenêtre**.\n• Pieds à plat, coudes à ~90°, avant-bras posés.\n• Règle du **20-20-20** pour les yeux, et levez-vous au moins toutes les heures.',
    links: [
      { label: 'Vidéo : régler son poste', to: 'ressources?r=r-poste' },
      { label: 'Fiche 20-20-20', to: 'ressources?r=r-202020' },
    ],
  },
  {
    id: 'stress',
    keywords: [
      'stress',
      'stresse',
      'burn',
      'burnout',
      'epuisement',
      'fatigue',
      'surcharge',
      'charge mentale',
      'anxiete',
      'pression',
      'deborde',
      'rps',
      'mal etre',
    ],
    themeId: 'rps',
    answer:
      'Merci d’en parler, c’est important.\nVous pouvez vous adresser à : votre **manager**, les **RH**, le **médecin du travail**, vos **représentants du personnel (CSE)**, ou la **cellule d’écoute psychologique** si votre entreprise en propose une (confidentielle).\n\nSi vous êtes en détresse, le **3114** (numéro national de prévention du suicide) répond 24h/24.',
    links: [{ label: 'Podcast : stress au travail', to: 'ressources?r=r-stress' }],
  },
  {
    id: 'harcelement',
    keywords: [
      'harcelement',
      'harcele',
      'sexiste',
      'humiliation',
      'insulte',
      'violence',
      'agression',
      'discrimination',
    ],
    themeId: 'rps',
    answer:
      'Le harcèlement moral ou sexuel et les agissements sexistes sont **interdits**. Victime ou témoin, vous pouvez contacter :\n• le **référent harcèlement** (CSE / entreprise),\n• votre **manager** ou les **RH**,\n• le **médecin du travail**.\n\nNotez les faits (dates, lieux, témoins) : cela aide à les faire reconnaître.',
    links: [{ label: 'Fiche : réagir face au harcèlement', to: 'ressources?r=r-harcelement' }],
  },
  {
    id: 'incendie',
    keywords: ['feu', 'incendie', 'fumee', 'extincteur', 'flamme', 'brule', 'alarme'],
    themeId: 'incendie',
    answer:
      'Départ de feu :\n1. **Donnez l’alerte** (alarme, 18 ou 112).\n2. Si le feu est **naissant** et que vous êtes formé·e, utilisez l’**extincteur adapté** (CO₂ pour l’électrique), à 2-3 m, à la base des flammes.\n3. Sinon, **évacuez** en fermant les portes derrière vous.',
    links: [{ label: 'Vidéo : quel extincteur ?', to: 'ressources?r=r-extincteurs' }],
  },
  {
    id: 'evacuation',
    keywords: [
      'evacuation',
      'evacuer',
      'sortie',
      'point de rassemblement',
      'ascenseur',
      'exercice',
      'serre file',
      'guide file',
    ],
    themeId: 'incendie',
    answer:
      'Au signal d’évacuation :\n• Quittez votre poste **immédiatement**, sans vos affaires.\n• **Jamais d’ascenseur**, suivez le balisage et les guides/serre-files.\n• Rejoignez le **point de rassemblement** et attendez l’autorisation pour en partir.',
    links: [{ label: 'Infographie évacuation', to: 'ressources?r=r-evacuation' }],
  },
  {
    id: 'route',
    keywords: [
      'route',
      'voiture',
      'conduire',
      'conduite',
      'trajet',
      'deplacement',
      'telephone',
      'volant',
      'velo',
      'trottinette',
    ],
    themeId: 'routier',
    answer:
      'Le **risque routier** est la première cause de mortalité au travail. Les bons réflexes :\n• **Pas de téléphone** au volant : arrêtez-vous en lieu sûr.\n• **Pause toutes les 2 h** environ.\n• Préparez l’itinéraire et partez avec de la marge.',
    links: [{ label: 'Podcast : sur la route du travail', to: 'ressources?r=r-route' }],
  },
  {
    id: 'duerp',
    keywords: ['duerp', 'document unique', 'evaluation des risques', 'risques professionnels'],
    themeId: 'fondamentaux',
    answer:
      'Le **DUERP** (Document Unique d’Évaluation des Risques Professionnels) recense les risques de chaque unité de travail et le plan de prévention. Il est obligatoire dès le 1er salarié et tenu à disposition des salariés. Demandez-le à votre **référent SST** ou à votre manager.',
  },
  {
    id: 'referent',
    keywords: [
      'referent',
      'contact',
      'qui contacter',
      'interlocuteur',
      'medecin du travail',
      'cse',
      'qhse',
      'sst',
    ],
    answer:
      'Vos interlocuteurs santé-sécurité :\n• **Référent SST de votre site** — visible dans votre profil.\n• **Médecin du travail** — via les RH.\n• **CSE / commission SSCT** — vos représentants.\n• **Sauveteurs Secouristes du Travail** — affichage dans chaque étage.',
  },
  {
    id: 'epi',
    keywords: [
      'epi',
      'equipement',
      'protection',
      'gants',
      'casque',
      'chaussures',
      'lunettes',
      'gilet',
    ],
    themeId: 'fondamentaux',
    answer:
      'Les **EPI** (équipements de protection individuelle) complètent les protections collectives quand le risque ne peut pas être supprimé. Ils sont **fournis gratuitement** par l’employeur, doivent être **adaptés** et **portés** dès que les consignes l’exigent. Un EPI abîmé se signale et se remplace.',
  },
]

export const CHAT_SUGGESTIONS = [
  'Quels numéros appeler en cas d’urgence ?',
  'Comment exercer mon droit de retrait ?',
  'J’ai mal au dos en portant des cartons',
  'Je me sens stressé·e en ce moment',
  'Comment régler mon écran ?',
  'Que faire si l’alarme incendie sonne ?',
]
