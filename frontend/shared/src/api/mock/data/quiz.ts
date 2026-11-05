import type { QuizQuestion } from '@acculturator/contracts'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Fondamentaux
  {
    id: 'q-duerp',
    themeId: 'fondamentaux',
    difficulty: 1,
    question: 'À partir de combien de salariés le DUERP est-il obligatoire ?',
    options: ['Dès le 1er salarié', 'À partir de 11', 'À partir de 50', 'À partir de 250'],
    answer: 0,
    explanation:
      'Toute entreprise employant au moins un salarié doit évaluer les risques et les transcrire dans le DUERP.',
  },
  {
    id: 'q-retrait',
    themeId: 'fondamentaux',
    difficulty: 2,
    question: 'Le droit de retrait s’applique en cas de danger…',
    options: ['Grave et imminent', 'Léger mais fréquent', 'Hypothétique', 'Uniquement climatique'],
    answer: 0,
    explanation:
      'Le retrait est possible face à un danger grave et imminent pour sa vie ou sa santé (art. L4131-1 du Code du travail).',
    resourceId: 'r-droit-retrait',
  },
  {
    id: 'q-at',
    themeId: 'fondamentaux',
    difficulty: 1,
    question: 'Après un accident du travail, vous informez votre employeur…',
    options: [
      'Dans la semaine',
      'Dans les 24 heures',
      'Seulement si arrêt de travail',
      'À la visite médicale suivante',
    ],
    answer: 1,
    explanation:
      'Le salarié informe l’employeur dans la journée, au plus tard dans les 24 h. L’employeur déclare ensuite l’accident à la CPAM sous 48 h.',
    resourceId: 'r-at',
  },
  {
    id: 'q-epi',
    themeId: 'fondamentaux',
    difficulty: 2,
    question: 'Vrai ou faux : les EPI sont la première mesure de prévention à mettre en place.',
    options: ['Vrai', 'Faux'],
    answer: 1,
    explanation:
      'Faux : on cherche d’abord à supprimer le risque, puis à le réduire par des protections collectives. Les EPI complètent.',
  },
  {
    id: 'q-quasi',
    themeId: 'fondamentaux',
    difficulty: 2,
    question: 'Un collègue glisse sans se blesser sur une flaque. Que faire ?',
    options: [
      'Rien, il n’y a pas de blessé',
      'Le signaler comme presqu’accident',
      'Attendre que ça se reproduise',
      'En parler à la pause café',
    ],
    answer: 1,
    explanation:
      'Un presqu’accident est un signal précieux : le signaler permet de corriger la situation avant qu’un accident ne survienne.',
  },
  // Postures
  {
    id: 'q-tms',
    themeId: 'postures',
    difficulty: 1,
    question: 'Les TMS représentent environ quelle part des maladies professionnelles reconnues ?',
    options: ['10 %', '30 %', '50 %', 'Près de 90 %'],
    answer: 3,
    explanation:
      'Les TMS représentent près de 9 maladies professionnelles reconnues sur 10 en France.',
    resourceId: 'r-tms',
  },
  {
    id: 'q-charge',
    themeId: 'postures',
    difficulty: 1,
    question: 'Pour porter une charge, on la garde…',
    options: [
      'À bout de bras',
      'Au plus près du corps',
      'Sur une seule épaule',
      'Au-dessus de la tête',
    ],
    answer: 1,
    explanation: 'Plus la charge est éloignée du corps, plus l’effort sur le dos augmente.',
    resourceId: 'r-charges',
  },
  {
    id: 'q-torsion',
    themeId: 'postures',
    difficulty: 2,
    question: 'Quel mouvement éviter en manutention ?',
    options: [
      'Fléchir les genoux',
      'Se rapprocher de la charge',
      'La torsion du tronc',
      'Utiliser un diable',
    ],
    answer: 2,
    explanation:
      'Les torsions du tronc sous charge sollicitent fortement les disques lombaires : on tourne avec les pieds.',
  },
  {
    id: 'q-tms-facteurs',
    themeId: 'postures',
    difficulty: 3,
    question: 'Lequel n’est PAS un facteur de risque de TMS ?',
    options: ['Gestes répétitifs', 'Stress', 'Alternance des tâches', 'Postures contraignantes'],
    answer: 2,
    explanation:
      'Alterner les tâches est au contraire une mesure de prévention : elle varie les sollicitations.',
  },
  // Écran
  {
    id: 'q-ecran',
    themeId: 'ecran',
    difficulty: 1,
    question: 'Distance recommandée entre les yeux et l’écran ?',
    options: ['20-30 cm', '50-70 cm', '1 m à 1,50 m', 'Plus de 2 m'],
    answer: 1,
    explanation: 'Entre 50 et 70 cm, soit environ la longueur d’un bras tendu.',
    resourceId: 'r-poste',
  },
  {
    id: 'q-202020',
    themeId: 'ecran',
    difficulty: 1,
    question: 'La règle du 20-20-20 sert à…',
    options: [
      'Limiter la fatigue visuelle',
      'Organiser ses mails',
      'Régler son siège',
      'Calculer ses pauses déjeuner',
    ],
    answer: 0,
    explanation:
      'Toutes les 20 min, regarder à ~6 m pendant 20 s détend les muscles de l’accommodation.',
    resourceId: 'r-202020',
  },
  {
    id: 'q-fenetre',
    themeId: 'ecran',
    difficulty: 2,
    question: 'Comment placer son écran par rapport à une fenêtre ?',
    options: [
      'Face à la fenêtre',
      'Dos à la fenêtre',
      'Perpendiculaire à la fenêtre',
      'Collé à la vitre',
    ],
    answer: 2,
    explanation: 'Perpendiculaire : on évite à la fois l’éblouissement et les reflets.',
  },
  {
    id: 'q-portable',
    themeId: 'ecran',
    difficulty: 2,
    question: 'En télétravail sur ordinateur portable, la meilleure option est…',
    options: [
      'Travailler depuis le canapé',
      'Utiliser un support + clavier et souris externes',
      'Poser l’ordinateur sur les genoux',
      'Baisser la luminosité au minimum',
    ],
    answer: 1,
    explanation:
      'Un support rehausse l’écran au niveau des yeux ; clavier et souris externes permettent de garder les avant-bras posés.',
  },
  // RPS
  {
    id: 'q-rps',
    themeId: 'rps',
    difficulty: 1,
    question: 'Lequel de ces éléments fait partie des risques psychosociaux ?',
    options: ['Le bruit', 'Le harcèlement moral', 'Les vibrations', 'Le risque chimique'],
    answer: 1,
    explanation:
      'Les RPS regroupent stress, violences internes (dont le harcèlement), violences externes et épuisement professionnel.',
  },
  {
    id: 'q-temoin',
    themeId: 'rps',
    difficulty: 2,
    question: 'Vous êtes témoin de propos humiliants répétés envers un collègue. Que faire ?',
    options: [
      'Ne rien dire, ça ne vous regarde pas',
      'En parler au collègue et le signaler',
      'Attendre qu’il se plaigne',
      'En rire pour détendre l’atmosphère',
    ],
    answer: 1,
    explanation:
      'Soutenir la personne et signaler (manager, RH, référent harcèlement, CSE) aide à faire cesser la situation.',
    resourceId: 'r-harcelement',
  },
  {
    id: 'q-stress',
    themeId: 'rps',
    difficulty: 2,
    question: 'Quel signe peut alerter sur un stress chronique ?',
    options: [
      'Troubles du sommeil persistants',
      'Avoir faim à midi',
      'Prendre ses congés',
      'Partir à l’heure',
    ],
    answer: 0,
    explanation:
      'Troubles du sommeil, irritabilité, fatigue persistante ou isolement sont des signaux d’alerte à ne pas banaliser.',
    resourceId: 'r-stress',
  },
  {
    id: 'q-deco',
    themeId: 'rps',
    difficulty: 3,
    question: 'Le droit à la déconnexion concerne…',
    options: [
      'Uniquement les cadres',
      'Le temps hors travail',
      'Les pannes informatiques',
      'Les pauses déjeuner uniquement',
    ],
    answer: 1,
    explanation:
      'Il garantit de ne pas être sollicité par les outils numériques professionnels en dehors du temps de travail.',
  },
  // Incendie
  {
    id: 'q-triangle',
    themeId: 'incendie',
    difficulty: 1,
    question: 'Le triangle du feu associe combustible, comburant et…',
    options: ['Eau', 'Énergie d’activation', 'Fumée', 'Vent'],
    answer: 1,
    explanation:
      'Une source d’énergie (chaleur, étincelle, flamme) est nécessaire pour déclencher la combustion.',
  },
  {
    id: 'q-co2',
    themeId: 'incendie',
    difficulty: 2,
    question: 'Quel extincteur utiliser sur un feu d’origine électrique ?',
    options: ['Eau pulvérisée sans additif', 'CO₂', 'Sable mouillé', 'Couverture humide'],
    answer: 1,
    explanation: 'Le CO₂ est non conducteur et ne laisse pas de résidu sur les équipements.',
    resourceId: 'r-extincteurs',
  },
  {
    id: 'q-ascenseur',
    themeId: 'incendie',
    difficulty: 1,
    question: 'Lors d’une évacuation, l’ascenseur…',
    options: [
      'Est le plus rapide',
      'Est réservé aux managers',
      'Ne doit jamais être utilisé',
      'Peut servir si peu de monde',
    ],
    answer: 2,
    explanation: 'Un ascenseur peut tomber en panne ou s’ouvrir sur un étage enfumé.',
    resourceId: 'r-evacuation',
  },
  {
    id: 'q-fumee',
    themeId: 'incendie',
    difficulty: 2,
    question: 'Couloir enfumé sur votre chemin d’évacuation : vous…',
    options: [
      'Le traversez en courant',
      'Vous baissez : l’air est plus respirable près du sol',
      'Ouvrez toutes les fenêtres',
      'Retournez chercher vos affaires',
    ],
    answer: 1,
    explanation:
      'Les fumées chaudes montent : près du sol, l’air est moins toxique. Si c’est impossible, restez dans un local, porte fermée, et signalez-vous.',
  },
  {
    id: 'q-point',
    themeId: 'incendie',
    difficulty: 1,
    question: 'Une fois dehors, vous…',
    options: [
      'Rentrez chez vous',
      'Rejoignez le point de rassemblement',
      'Retournez au bureau après 5 min',
      'Allez prendre un café',
    ],
    answer: 1,
    explanation:
      'Au point de rassemblement, on vérifie que tout le monde est sorti. On n’en part qu’avec l’autorisation des responsables.',
  },
  // Secours
  {
    id: 'q-pas',
    themeId: 'secours',
    difficulty: 1,
    question: 'Premier réflexe face à un accident ?',
    options: [
      'Secourir la victime',
      'Protéger pour éviter le sur-accident',
      'Prendre une photo',
      'Prévenir les collègues',
    ],
    answer: 1,
    explanation: 'On protège d’abord, pour ne pas faire une victime de plus.',
    resourceId: 'r-pas',
  },
  {
    id: 'q-15',
    themeId: 'secours',
    difficulty: 1,
    question: 'Le 15 correspond…',
    options: ['Aux pompiers', 'Au SAMU', 'À la police', 'Au centre antipoison'],
    answer: 1,
    explanation: '15 = SAMU, 18 = pompiers, 17 = police, 112 = numéro d’urgence européen.',
    resourceId: 'r-numeros',
  },
  {
    id: 'q-114',
    themeId: 'secours',
    difficulty: 2,
    question: 'Le 114 permet de…',
    options: [
      'Joindre les secours par SMS',
      'Signaler un vol',
      'Contacter la médecine du travail',
      'Joindre la mairie',
    ],
    answer: 0,
    explanation:
      'Le 114 est le numéro d’urgence accessible par SMS, notamment pour les personnes sourdes ou malentendantes.',
    resourceId: 'r-numeros',
  },
  {
    id: 'q-dae',
    themeId: 'secours',
    difficulty: 2,
    question: 'Un défibrillateur peut être utilisé…',
    options: [
      'Par un médecin uniquement',
      'Par un SST uniquement',
      'Par toute personne',
      'Seulement avec autorisation',
    ],
    answer: 2,
    explanation:
      'Tout le monde peut utiliser un DAE : il analyse le rythme cardiaque et guide vocalement.',
  },
  {
    id: 'q-raccrocher',
    themeId: 'secours',
    difficulty: 3,
    question: 'Lors de l’appel aux secours, quand raccrocher ?',
    options: [
      'Dès l’adresse donnée',
      'Quand l’opérateur vous le dit',
      'Après 1 minute',
      'Quand la victime parle',
    ],
    answer: 1,
    explanation:
      'L’opérateur peut avoir besoin d’informations complémentaires ou vous guider dans les gestes.',
  },
  // Routier
  {
    id: 'q-route',
    themeId: 'routier',
    difficulty: 1,
    question: 'Quelle est la première cause de mortalité au travail en France ?',
    options: ['Les chutes de hauteur', 'Le risque routier', 'Les incendies', 'Les machines'],
    answer: 1,
    explanation:
      'Les accidents de la route (trajet et mission) sont la première cause de décès liés au travail.',
    resourceId: 'r-route',
  },
  {
    id: 'q-tel',
    themeId: 'routier',
    difficulty: 2,
    question: 'Votre manager vous appelle pendant que vous conduisez. Vous…',
    options: [
      'Décrochez en haut-parleur',
      'Rappelez une fois arrêté·e en lieu sûr',
      'Répondez par SMS',
      'Décrochez si la route est droite',
    ],
    answer: 1,
    explanation: 'Aucun appel ne vaut un accident : on s’arrête en lieu sûr pour rappeler.',
  },
  {
    id: 'q-pause-route',
    themeId: 'routier',
    difficulty: 1,
    question: 'Sur un long trajet, une pause est recommandée…',
    options: [
      'Toutes les 30 min',
      'Toutes les 2 h environ',
      'Toutes les 5 h',
      'Uniquement à l’arrivée',
    ],
    answer: 1,
    explanation:
      'Une pause toutes les deux heures environ limite la somnolence et la baisse de vigilance.',
  },
]
