import type { Flashcard } from './types'

export const FLASHCARDS: Flashcard[] = [
  // Fondamentaux
  {
    id: 'f-duerp',
    themeId: 'fondamentaux',
    front: 'Que signifie DUERP ?',
    back: 'Document Unique d’Évaluation des Risques Professionnels. Il recense les risques de chaque unité de travail et les actions de prévention associées.',
    hint: 'Un document… unique.',
  },
  {
    id: 'f-duerp-maj',
    themeId: 'fondamentaux',
    front: 'À quelle fréquence le DUERP est-il mis à jour (entreprise ≥ 11 salariés) ?',
    back: 'Au moins une fois par an, et à chaque changement important (nouvel équipement, réorganisation, accident…).',
  },
  {
    id: 'f-retrait',
    themeId: 'fondamentaux',
    front: 'Quelle condition ouvre le droit de retrait ?',
    back: 'Un motif raisonnable de penser qu’une situation présente un danger grave et imminent pour sa vie ou sa santé.',
    hint: 'Deux adjectifs pour qualifier le danger.',
  },
  {
    id: 'f-at-delai',
    themeId: 'fondamentaux',
    front: 'Accident du travail : sous quel délai informer son employeur ?',
    back: 'Dans la journée, au plus tard dans les 24 heures. L’employeur dispose ensuite de 48 h pour déclarer à la CPAM.',
  },
  {
    id: 'f-9principes',
    themeId: 'fondamentaux',
    front: 'Quel est le 1er des 9 principes généraux de prévention ?',
    back: 'Éviter les risques. Viennent ensuite : évaluer ceux qui ne peuvent être évités, les combattre à la source, adapter le travail à l’homme…',
  },
  {
    id: 'f-epc',
    themeId: 'fondamentaux',
    front: 'Protection collective ou individuelle : laquelle est prioritaire ?',
    back: 'La protection collective (garde-corps, ventilation…). Les EPI viennent en complément, quand le risque ne peut être supprimé autrement.',
  },
  // Postures
  {
    id: 'f-tms',
    themeId: 'postures',
    front: 'Que sont les TMS ?',
    back: 'Troubles musculosquelettiques : affections des muscles, tendons et nerfs (dos, épaules, poignets…). Première cause de maladie professionnelle en France.',
  },
  {
    id: 'f-charge',
    themeId: 'postures',
    front: 'Les 3 réflexes pour soulever une charge ?',
    back: '1. Jambes fléchies, pieds écartés\n2. Dos droit\n3. Charge près du corps, sans torsion',
  },
  {
    id: 'f-tms-signes',
    themeId: 'postures',
    front: 'Citez deux signes précoces de TMS.',
    back: 'Fourmillements, engourdissements, raideurs, douleurs qui persistent après le travail… À signaler tôt au médecin du travail.',
  },
  // Écran
  {
    id: 'f-202020',
    themeId: 'ecran',
    front: 'Règle du 20-20-20 ?',
    back: 'Toutes les 20 minutes, regarder à environ 6 m (20 pieds) pendant 20 secondes pour reposer ses yeux.',
  },
  {
    id: 'f-ecran-hauteur',
    themeId: 'ecran',
    front: 'Hauteur et distance idéales de l’écran ?',
    back: 'Haut de l’écran au niveau des yeux, à 50-70 cm (environ un bras tendu).',
  },
  {
    id: 'f-ecran-fenetre',
    themeId: 'ecran',
    front: 'Comment orienter son écran par rapport à une fenêtre ?',
    back: 'Perpendiculairement : ni dos à la fenêtre (reflets), ni face à elle (éblouissement).',
  },
  {
    id: 'f-pause',
    themeId: 'ecran',
    front: 'Combien de temps rester assis sans bouger ?',
    back: 'Idéalement pas plus d’une heure : se lever, marcher, s’étirer quelques minutes rompt la sédentarité.',
  },
  // RPS
  {
    id: 'f-rps',
    themeId: 'rps',
    front: 'Que recouvrent les risques psychosociaux ?',
    back: 'Stress, violences internes (harcèlement, conflits), violences externes (clients, usagers) et épuisement professionnel.',
  },
  {
    id: 'f-rps-qui',
    themeId: 'rps',
    front: 'Je me sens dépassé·e : à qui en parler ?',
    back: 'Manager, RH, médecin du travail, représentants du personnel (CSE), référent harcèlement, cellule d’écoute psychologique si elle existe.',
  },
  {
    id: 'f-referent-harcelement',
    themeId: 'rps',
    front: 'Où est désigné le référent harcèlement sexuel ?',
    back: 'Au sein du CSE, et par l’employeur dans les entreprises d’au moins 250 salariés.',
  },
  {
    id: 'f-deconnexion',
    themeId: 'rps',
    front: 'Qu’est-ce que le droit à la déconnexion ?',
    back: 'Le droit de ne pas être connecté aux outils numériques professionnels en dehors du temps de travail, pour protéger repos et vie personnelle.',
  },
  // Incendie
  {
    id: 'f-triangle',
    themeId: 'incendie',
    front: 'Quels sont les 3 éléments du triangle du feu ?',
    back: 'Un combustible, un comburant (l’oxygène de l’air) et une source d’énergie (chaleur, étincelle). Retirer un élément éteint le feu.',
  },
  {
    id: 'f-classeA',
    themeId: 'incendie',
    front: 'Feu de classe A ?',
    back: 'Feu de matériaux solides : papier, bois, carton, tissu. Extincteur à eau pulvérisée.',
  },
  {
    id: 'f-co2',
    themeId: 'incendie',
    front: 'Quel extincteur pour un feu d’origine électrique ?',
    back: 'L’extincteur CO₂ (dioxyde de carbone).',
  },
  {
    id: 'f-ascenseur',
    themeId: 'incendie',
    front: 'Évacuation : peut-on prendre l’ascenseur ?',
    back: 'Jamais. Il peut se bloquer ou s’ouvrir sur un étage enfumé. On emprunte les escaliers balisés.',
  },
  {
    id: 'f-serrefile',
    themeId: 'incendie',
    front: 'Rôle du serre-file ?',
    back: 'Il ferme la marche lors d’une évacuation, vérifie que personne ne reste dans la zone et ferme les portes derrière lui.',
  },
  // Secours
  {
    id: 'f-pas',
    themeId: 'secours',
    front: 'Que signifie P.A.S. ?',
    back: 'Protéger – Alerter – Secourir. Dans cet ordre.',
  },
  {
    id: 'f-15',
    themeId: 'secours',
    front: '15, 18, 112, 114 : qui est qui ?',
    back: '15 = SAMU\n18 = Pompiers\n112 = Urgence européenne\n114 = Urgence par SMS',
  },
  {
    id: 'f-alerte',
    themeId: 'secours',
    front: 'Les informations à donner lors de l’alerte ?',
    back: 'Où (adresse précise), quoi (nature de l’accident), combien de victimes, leur état, les gestes faits. Ne raccrocher que lorsqu’on vous le dit.',
  },
  {
    id: 'f-dae',
    themeId: 'secours',
    front: 'Qui peut utiliser un défibrillateur (DAE) ?',
    back: 'Toute personne, même non formée. L’appareil guide vocalement chaque étape.',
  },
  {
    id: 'f-sst',
    themeId: 'secours',
    front: 'Qu’est-ce qu’un SST ?',
    back: 'Un Sauveteur Secouriste du Travail : salarié formé pour porter les premiers secours et agir en prévention.',
  },
  // Routier
  {
    id: 'f-route',
    themeId: 'routier',
    front: 'Première cause de mortalité au travail en France ?',
    back: 'Le risque routier (accidents de trajet et de mission).',
  },
  {
    id: 'f-pause-route',
    themeId: 'routier',
    front: 'Toutes les combien faire une pause sur un long trajet ?',
    back: 'Toutes les 2 heures environ, quelques minutes au moins.',
  },
  {
    id: 'f-tel',
    themeId: 'routier',
    front: 'Téléphone au volant : quelle règle ?',
    back: 'On ne téléphone pas en conduisant : on s’arrête en lieu sûr. Même en mains libres, la conversation détourne l’attention.',
  },
]
