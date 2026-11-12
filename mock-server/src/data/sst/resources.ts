import type { Resource } from '@acculturator/contracts'

// Contenus de démonstration (à relire par l’équipe QHSE). En production : base de contenus gérée depuis le portail admin.
export const RESOURCES: Resource[] = [
  {
    id: 'r-acteurs',
    themeId: 'fondamentaux',
    type: 'video',
    title: 'Qui fait quoi en santé-sécurité ?',
    summary:
      'Employeur, managers, CSE, médecin du travail, référents… et vous : le rôle de chacun en 4 minutes.',
    durationMin: 4,
    mandatory: true,
    keyPoints: [
      'L’employeur a une obligation de sécurité : il évalue les risques et met en place des mesures de prévention.',
      'Le CSE (et sa commission SSCT) est consulté sur la santé, la sécurité et les conditions de travail.',
      'Le service de prévention et de santé au travail (médecin du travail) suit votre santé en lien avec votre poste.',
      'Chaque salarié doit prendre soin de sa sécurité et de celle des autres, selon sa formation et ses moyens.',
    ],
    check: {
      question: 'Qui doit prendre soin de sa propre sécurité et de celle de ses collègues ?',
      options: [
        'Uniquement les managers',
        'Uniquement le référent SST',
        'Chaque salarié',
        'Le médecin du travail',
      ],
      answer: 2,
      explanation:
        'Le Code du travail (art. L4122-1) prévoit que chaque travailleur prend soin de sa santé et de sa sécurité et de celles des autres personnes concernées par ses actes.',
    },
  },
  {
    id: 'r-droit-retrait',
    themeId: 'fondamentaux',
    type: 'fiche',
    title: 'Droit d’alerte et droit de retrait',
    summary:
      'Face à un danger grave et imminent : comment alerter et dans quelles conditions se retirer.',
    durationMin: 3,
    keyPoints: [
      'Vous alertez immédiatement l’employeur de toute situation présentant un danger grave et imminent pour votre vie ou votre santé.',
      'Vous pouvez vous retirer de cette situation, sans sanction ni retenue de salaire si le motif est raisonnable.',
      'Le retrait ne doit pas créer de nouveau danger pour autrui.',
    ],
    check: {
      question:
        'Le droit de retrait peut-il entraîner une retenue sur salaire s’il est exercé de façon légitime ?',
      options: ['Oui, toujours', 'Non', 'Seulement après 24 h', 'Seulement pour les intérimaires'],
      answer: 1,
      explanation:
        'Aucune sanction ni retenue de salaire ne peut être prise contre un salarié qui s’est retiré d’une situation de travail dont il avait un motif raisonnable de penser qu’elle présentait un danger grave et imminent.',
    },
  },
  {
    id: 'r-at',
    themeId: 'fondamentaux',
    type: 'infographie',
    title: 'Accident du travail : les 3 étapes',
    summary: 'Se faire soigner, informer, déclarer : le bon timing en cas d’accident.',
    durationMin: 2,
    isNew: true,
    keyPoints: [
      'Se faire soigner d’abord, même pour une blessure qui semble bénigne.',
      'Informer son employeur dans la journée, au plus tard dans les 24 heures.',
      'L’employeur déclare l’accident à la CPAM dans les 48 heures.',
      'Tout incident, même sans blessure, mérite d’être remonté : c’est un signal pour la prévention.',
    ],
  },
  {
    id: 'r-charges',
    themeId: 'postures',
    type: 'video',
    title: 'Porter une charge sans se blesser',
    summary: 'Démonstration pas-à-pas des bons gestes pour soulever, porter et déposer.',
    durationMin: 5,
    mandatory: true,
    keyPoints: [
      'Évaluer la charge avant de la soulever ; utiliser une aide à la manutention dès que possible.',
      'Pieds écartés, jambes fléchies, dos droit : ce sont les jambes qui travaillent.',
      'Garder la charge au plus près du corps et éviter les torsions du tronc.',
    ],
    check: {
      question: 'Pour soulever un carton au sol, vous…',
      options: [
        'Gardez les jambes tendues et penchez le dos',
        'Fléchissez les jambes, dos droit, charge près du corps',
        'Le soulevez le plus vite possible',
        'Tournez le buste pour le poser sur le côté',
      ],
      answer: 1,
      explanation:
        'Fléchir les jambes et garder le dos droit répartit l’effort sur les muscles des cuisses ; la charge près du corps limite la contrainte sur les lombaires.',
    },
  },
  {
    id: 'r-tms',
    themeId: 'postures',
    type: 'infographie',
    title: 'TMS : comprendre pour prévenir',
    summary:
      'Les troubles musculosquelettiques expliqués en une image : causes, signes, prévention.',
    durationMin: 2,
    keyPoints: [
      'Les TMS représentent près de 9 maladies professionnelles reconnues sur 10 en France.',
      'Facteurs : répétitivité, efforts, postures contraignantes, mais aussi stress et manque de récupération.',
      'Les premiers signes (fourmillements, douleurs) doivent être signalés tôt.',
    ],
  },
  {
    id: 'r-poste',
    themeId: 'ecran',
    type: 'video',
    title: 'Régler son poste en 5 étapes',
    summary: 'Siège, écran, clavier, souris, lumière : un poste bien réglé en moins de 5 minutes.',
    durationMin: 4,
    isNew: true,
    keyPoints: [
      'Le haut de l’écran au niveau des yeux, à une distance d’environ un bras tendu (50 à 70 cm).',
      'Pieds à plat, cuisses à l’horizontale, avant-bras posés, coudes à environ 90°.',
      'Écran perpendiculaire aux fenêtres pour éviter reflets et éblouissements.',
    ],
    check: {
      question: 'Où placer le haut de votre écran ?',
      options: [
        'Au-dessus du niveau des yeux',
        'Au niveau des yeux',
        'Au niveau du menton',
        'Peu importe',
      ],
      answer: 1,
      explanation:
        'Le haut de l’écran au niveau des yeux permet de garder la nuque dans une position neutre, le regard légèrement vers le bas.',
    },
  },
  {
    id: 'r-202020',
    themeId: 'ecran',
    type: 'fiche',
    title: 'La règle du 20-20-20',
    summary: 'Une astuce simple pour limiter la fatigue visuelle.',
    durationMin: 1,
    keyPoints: [
      'Toutes les 20 minutes, regardez à environ 6 mètres (20 pieds) pendant 20 secondes.',
      'Pensez à cligner des yeux : devant un écran, on cligne beaucoup moins.',
      'Alternez les tâches et levez-vous régulièrement.',
    ],
  },
  {
    id: 'r-stress',
    themeId: 'rps',
    type: 'podcast',
    title: 'Stress au travail : en parler, c’est déjà agir',
    summary:
      'Témoignages et conseils d’une psychologue du travail pour repérer les signaux d’alerte.',
    durationMin: 12,
    keyPoints: [
      'Signaux d’alerte : troubles du sommeil, irritabilité, isolement, perte de motivation.',
      'Interlocuteurs : manager, RH, médecin du travail, référent harcèlement, représentants du personnel.',
      'Un dispositif d’écoute psychologique confidentiel peut être proposé par l’entreprise.',
    ],
  },
  {
    id: 'r-harcelement',
    themeId: 'rps',
    type: 'fiche',
    title: 'Harcèlement et agissements sexistes : réagir',
    summary: 'Victime ou témoin : les recours et les personnes à contacter.',
    durationMin: 3,
    mandatory: true,
    keyPoints: [
      'Le harcèlement moral ou sexuel est interdit et sanctionné.',
      'Un référent harcèlement est désigné au sein du CSE (et par l’employeur dans les entreprises d’au moins 250 salariés).',
      'Témoin, vous pouvez signaler et soutenir : votre réaction compte.',
    ],
  },
  {
    id: 'r-extincteurs',
    themeId: 'incendie',
    type: 'video',
    title: 'Quel extincteur pour quel feu ?',
    summary: 'Classes de feu et types d’extincteurs, démonstration à l’appui.',
    durationMin: 4,
    keyPoints: [
      'Classe A : solides (papier, bois, tissu) → eau pulvérisée avec additif.',
      'Classe B : liquides inflammables → mousse ou poudre.',
      'Feu d’origine électrique → CO₂ (dioxyde de carbone).',
      'Attaquer le feu à la base des flammes, à environ 2-3 mètres, sans jamais se mettre en danger.',
    ],
    check: {
      question: 'Un départ de feu sur une multiprise : quel extincteur ?',
      options: ['Eau pulvérisée sans additif', 'CO₂', 'Un seau d’eau', 'Aucun, on souffle dessus'],
      answer: 1,
      explanation:
        'Le CO₂ est adapté aux feux d’origine électrique : il ne conduit pas l’électricité et ne laisse pas de résidu.',
    },
  },
  {
    id: 'r-evacuation',
    themeId: 'incendie',
    type: 'infographie',
    title: 'Évacuation : les 6 réflexes',
    summary: 'Alarme, chemin, point de rassemblement : ce qu’il faut faire et ne pas faire.',
    durationMin: 2,
    keyPoints: [
      'Au signal d’évacuation, quitter son poste immédiatement, sans revenir chercher ses affaires.',
      'Ne jamais prendre l’ascenseur ; suivre les consignes des guides et serre-files.',
      'Rejoindre le point de rassemblement et y rester jusqu’à autorisation.',
    ],
  },
  {
    id: 'r-pas',
    themeId: 'secours',
    type: 'video',
    title: 'Protéger, Alerter, Secourir',
    summary: 'Le triptyque « PAS » appliqué à une situation réelle d’accident au bureau.',
    durationMin: 5,
    mandatory: true,
    keyPoints: [
      'Protéger : supprimer ou isoler le danger pour éviter un sur-accident.',
      'Alerter : 15 (SAMU), 18 (pompiers), 112 (numéro européen), 114 (par SMS).',
      'Secourir : réaliser les gestes adaptés en attendant les secours, rester auprès de la victime.',
    ],
    check: {
      question: 'Dans quel ordre agir face à un accident ?',
      options: [
        'Secourir, Alerter, Protéger',
        'Alerter, Secourir, Protéger',
        'Protéger, Alerter, Secourir',
        'Protéger, Secourir, Alerter',
      ],
      answer: 2,
      explanation:
        'On protège d’abord (éviter le sur-accident), on alerte ensuite les secours, puis on secourt la victime.',
    },
  },
  {
    id: 'r-numeros',
    themeId: 'secours',
    type: 'fiche',
    title: 'Les numéros d’urgence à connaître',
    summary: 'Fiche mémo à imprimer ou à garder sur son téléphone.',
    durationMin: 1,
    keyPoints: [
      '15 : SAMU — urgence médicale.',
      '18 : sapeurs-pompiers — incendie, accident, secours à personne.',
      '112 : numéro d’urgence européen, depuis n’importe quel téléphone.',
      '114 : urgences par SMS, pour les personnes sourdes, malentendantes ou ne pouvant pas parler.',
    ],
  },
  {
    id: 'r-route',
    themeId: 'routier',
    type: 'podcast',
    title: 'Sur la route du travail',
    summary:
      'Pourquoi le risque routier est la première cause de mortalité au travail, et comment s’en protéger.',
    durationMin: 8,
    keyPoints: [
      'Les accidents de la route (trajet et mission) sont la première cause de décès liés au travail en France.',
      'Le téléphone au volant multiplie le risque d’accident : on ne téléphone pas en conduisant, même avec un kit.',
      'Planifier ses déplacements et prévoir des pauses toutes les deux heures.',
    ],
  },
]
