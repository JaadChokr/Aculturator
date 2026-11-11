# Acculturator v2 — Santé & Sécurité au Travail

Plateforme interne d’acculturation des collaborateurs, parcours **Santé & Sécurité au Travail (SST)**.
Ce dépôt contient le **front-end**, organisé en **portails** selon le rôle de l’utilisateur :

| Portail                | Route            | Rôles autorisés                | État                             |
| ---------------------- | ---------------- | ------------------------------ | -------------------------------- |
| Espace collaborateur   | `/collaborateur` | collaborateur, référent, admin | ✅ Fonctionnel (données de démo) |
| Portail référent       | `/referent`      | référent, admin                | 🧱 Squelette + périmètre décrit  |
| Portail administrateur | `/admin`         | admin                          | 🧱 Squelette + périmètre décrit  |

## Stack

- **React 19 + TypeScript**, build **Vite**, monorepo **npm workspaces**
- **Tailwind CSS v4** + composants **shadcn/ui** (Radix UI) pour une identité visuelle unifiée
- **React Router 7** (routes déclarées par portail, pages chargées à la demande)
- **TanStack Query** (données serveur : utilisateur, catalogue, notifications…)
- **Motion** (ex-Framer Motion) pour les animations et gestes
- **Zustand** (état d'interface et progression locale de démo)
- **lucide-react** (icônes), police **IBM Plex Sans** (embarquée)

## Démarrer

```bash
npm install
npm run dev          # http://localhost:5173 — faux backend de démo intégré, sélecteur de profil activé
npm run mock-server  # optionnel : le faux backend en serveur Node sur http://localhost:3000/api
npm run build        # build de production → frontend/shell/dist/
npm run build:demo   # build statique autonome (routeur en mémoire) → frontend/shell/dist-demo/
npm run lint && npm run typecheck
npm run format       # Prettier
```

En développement, le menu utilisateur (en haut à droite) permet de **changer de profil**
(collaborateur / référent / admin) pour visiter les trois portails. Ce sélecteur est piloté par
`VITE_DEMO_ROLE_SWITCHER` et n'est pas actif dans le build de production.

Pour travailler avec un serveur (faux backend Node ou vrai backend) : `VITE_MOCK_SERVER=false`
dans `frontend/shell/.env.development.local` (voir [`backend/README.md`](backend/README.md)).

## Architecture

Monorepo modulaire : les **bibliothèques partagées** dans `packages/`, **un dossier par portail** (et l’application hôte) dans `frontend/` :

```
packages/             Bibliothèques partagées (importées par les applications)
├── contracts/        @acculturator/contracts   Types du domaine & DTO, partagés avec le backend
├── design-system/    @acculturator/design-system  Identité visuelle commune : composants, mise en page, animations, thème
└── core/             @acculturator/core        Socle applicatif sans interface : API, authentification, parcours, catalogue
frontend/             Applications : un dossier par portail + l'application hôte
├── shell/            @acculturator/shell       Application hôte : providers, routeur, registre des portails, build
├── collaborateur/    @acculturator/portal-collaborateur
│   └── src/          index.tsx (PortalDefinition) · pages/ · components/ · store/
├── referent/         @acculturator/portal-referent   (squelette)
└── admin/            @acculturator/portal-admin      (squelette)
mock-server/          @acculturator/mock-server Faux backend de démo (données d'exemple), hors frontend
backend/              Emplacement réservé au backend
docs/                 architecture.md · api-contract.md
```

Règles de dépendance, **vérifiées par ESLint** :
`contracts ← design-system ← core ← portails ← shell`. Le design system est **purement visuel**
(aucun accès aux données) : c'est lui qui garantit une identité visuelle unique entre portails.
Un portail n'importe jamais un autre portail ni le shell, et n'utilise que les points d'entrée publics
de `design-system` (`/ui`, `/layout`…) et de `core` (`/api`, `/catalog`…).

Le frontend ne contient **aucune donnée ni logique serveur** : les pages passent par `api`
(`@acculturator/core/api`), qui appelle toujours `/api` en HTTP. En démo et en développement,
c'est `mock-server` qui répond (directement dans le navigateur) ; en production, le vrai backend.
Le passage au vrai backend ne modifie aucune ligne du frontend.

➡️ Détails, recettes (ajouter une rubrique, un portail, un appel API, un composant shadcn) :
[`docs/architecture.md`](docs/architecture.md) · Endpoints : [`docs/api-contract.md`](docs/api-contract.md)

### Identité visuelle — règles d’équipe

Charte **institutionnelle rouge et blanc** : rouge de marque (`primary`) pour les actions et repères,
surfaces blanches sur fond gris très clair, graphite (`inverse`, `accent`) pour les bandeaux contrastés,
gris neutres pour le reste. Pas d’emojis ni de dégradés décoratifs : icônes `lucide-react` uniquement.
Chaque thématique SST a une icône et un repère couleur discret (`THEMES[x].icon` / `.dot`), affichés via
`<ThemeBadge>` et `<ThemeIcon>`.

- Utiliser **uniquement les tokens** (`bg-primary`, `text-muted-foreground`, `bg-accent`, `text-xp`, `bg-success`…),
  jamais de couleur codée en dur dans une page. Les tokens clair/sombre sont définis dans `packages/design-system/src/styles/index.css`.
- Réutiliser `@acculturator/design-system/ui` ; pour un nouveau composant shadcn : `cd packages/design-system && npx shadcn@latest add <composant>`
  (le fichier `components.json` du socle pointe vers `src/ui`).
- Chaque page commence par un `<PageHeader eyebrow title description />`.
- Largeurs, sur-titres, choix exclusifs et teintes de difficulté passent par les briques du design system
  (`Page`/`PAGE_WIDTH`, `Eyebrow`, `SegmentedControl`, `ChoiceGroup`/`ChoiceCard`, `DIFFICULTY_STYLE`) ;
  ESLint refuse leurs équivalents recopiés (voir `docs/architecture.md`, « Rester conforme au style partagé »).
- Icône et repère couleur des thématiques : `THEMES[x].icon` / `.dot` (`packages/design-system/src/themes/index.ts`).
- Sur mobile : barre de navigation basse (5 premières entrées de la `nav`), libellés courts via `short`.

### En-tête commun

Compteurs propres au portail (`HeaderSlot`), **notifications** (affichage : `packages/design-system/src/components/notifications/`,
chargement : `useNotifications()` de `@acculturator/core/notifications`, données de démo par rôle dans `mock-server/src/data/notifications.ts`),
bouton de thème, puis menu utilisateur (identité, apparence clair/sombre/système, portails, profil de démo).
Sur mobile, l’en-tête est allégé : libellé court de la page, thème réglable depuis le menu utilisateur.

### Animations (Motion)

Les réglages d'animation communs sont dans `packages/design-system/src/motion/` : ressorts (`spring`, `springBouncy`),
apparitions (`fadeUp`, `popIn`), `hoverLift`, et les composants `<Stagger>` / `<Reveal>` (apparition en cascade)
et `<AnimatedNumber>` (compteurs). Règles d'équipe :

- Utiliser ces réglages plutôt que des valeurs ad hoc, pour garder une identité de mouvement unique.
- Animer pour **signifier** (apparition, feedback, récompense), en restant court (≤ 450 ms hors ressorts).
- `MotionConfig reducedMotion="user"` (dans `App.tsx`) coupe les animations si l'utilisateur le demande au système.

Exemples dans l'espace collaborateur : indicateur de navigation qui glisse (`layoutId`), transitions de page,
flashcards **glissables** (droite = « Je sais », gauche = « À revoir ») empilées en paquet, questions de quiz
qui défilent, cœurs et combos animés, scores et XP qui comptent, grille de ressources qui se réorganise au filtrage,
marqueurs de la chasse aux risques à ressort, notifications empilées.

## Point d'entrée : choix du parcours

La plateforme s'ouvre sur une page de **choix du parcours** (`/`), prévue pour accueillir d'autres
thématiques d'acculturation que la santé et la sécurité au travail. Une fois le parcours choisi,
l'utilisateur arrive sur le portail d'accueil de son profil ; il peut en changer depuis le menu
utilisateur (Parcours › Changer). Le catalogue, l'assistant et la progression sont propres à chaque
parcours (voir [`docs/architecture.md`](docs/architecture.md#parcours)).

## Espace collaborateur — fonctionnalités

| Rubrique                | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Piliers mobilisés (conception)              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| **Tableau de bord**     | Niveau & XP, série de jours, tuiles chiffrées (le détail des missions du jour s’ouvre dans une bulle depuis sa tuile), « Recommandé pour vous » (prochaines étapes personnalisées, contenu obligatoire non consulté toujours épinglé en tête), maîtrise par thématique, activité 14 j, défi d’équipe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | tous                                        |
| **Modules**             | Parcours découpé en blocs ordonnés (ex. SST : 5 modules), présentés en liste déroulante : chaque module s’ouvre sur place pour montrer ses étapes (le module en cours est ouvert d’office) ; chaque module enchaîne des étapes existantes (ressources, flashcards d’une thématique, quiz de validation à 75 %, chasse aux risques). En mode séquentiel, un module se débloque quand le précédent est terminé ; « Retour au module » depuis chaque étape ; module en cours proposé dans « Recommandé pour vous ». Rubrique masquée pour un parcours sans modules                                                                                                                                                                                                                                                                                                                                                                                                                | attention, consolidation                    |
| **Vidéos & ressources** | Vidéos, fiches, infographies, podcasts ; filtres (type, thématique, non consultées, favoris), recherche ; lecteur (média réel via `mediaUrl`, sinon aperçu simulé) avec **plein écran** (bouton ou double-clic ; repli en vue pleine page si le navigateur le refuse) ; parcours en étapes guidées par un bouton « Suivant » (regarder ou lire → « À retenir » → **check express** corrigé ; la suite se débloque à la fin de la vidéo)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | attention, engagement, retour d’information |
| **Flashcards**          | Répétition espacée (**système de Leitner** en coulisses, 5 boîtes : 1-3-7-14-30 j ; côté utilisateur, aucun jargon : seulement « Ancrage » par paquet et le total de cartes ancrées dans « Révision du jour »), session du jour, paquets par thématique, carte 3D **glissable** (geste « swipe »), didacticiel des gestes et raccourcis affiché à la première session (rouvrable via « ? »), indice, auto-évaluation (À revoir / Hésitant / Je sais), combos, raccourcis clavier                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | consolidation, engagement                   |
| **Quiz & défis**        | **Niveau de difficulté** (présenté en escalier : cartes de plus en plus hautes et foncées, du rouge clair au bordeaux, sur un axe « plus accessible → plus exigeant ») choisi juste après le défi, avant de commencer (tous niveaux, découverte, confirmé, expert ; niveau conseillé selon la maîtrise ; mémorisé ; questions du niveau en priorité, complétées par le niveau voisin ; +5/+10 XP par bonne réponse confirmé/expert ; « Passer au niveau supérieur » après un score ≥ 80 %, « Changer de niveau ») pour le défi chrono et l’entraînement · **Défi du jour** adaptatif (thématiques les plus faibles, XP ×2), **Défi chrono** (15 s, 3 vies, combos), **Entraînement** par thématique sans pression, **Chasse aux risques** (scène illustrée, 6 dangers à repérer + leurres) ; correction expliquée + lien vers la ressource ; écran « revoir mes erreurs » ; didacticiel affiché à la première partie (rouvrable via « ? », chrono en pause pendant sa lecture) | engagement, retour d’information, attention |
| **Prévi (chatbot)**     | Assistant SST, carrousel d’idées de questions au-dessus du champ de saisie (les questions déjà posées disparaissent), réponses sourcées renvoyant vers les ressources, retour utile / pas utile                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | engagement, retour d’information            |
| **Trophées & niveaux**  | 6 niveaux (Éveil → Ambassadeur·rice SST), 9 badges, statistiques personnelles                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | motivation                                  |

### Les 4 piliers de l’apprentissage (S. Dehaene) — principes implicites

Les piliers guident la **conception** des rubriques ; ils ne sont **jamais nommés ni affichés** dans
l’interface collaborateur. Ils se traduisent par l’expérience :

- **Attention** — formats courts (≤ 5 min), un message à la fois, résumé « À retenir » après lecture.
- **Engagement actif** — l’utilisateur agit : quiz, chasse aux risques, check express, questions à Prévi.
- **Retour d’information** — chaque réponse est corrigée et expliquée immédiatement, avec un lien vers la ressource.
- **Consolidation** — répétition espacée des flashcards, missions du jour, séries de jours.

En coulisses, `frontend/collaborateur/src/store/insights.ts` calcule des scores internes par pilier
pour ordonner les **prochaines étapes** du tableau de bord (« Réviser 8 cartes », « S’entraîner :
Risque routier »…). Ces scores pourront alimenter les statistiques du portail référent.
**Règle d’équipe :** ne pas introduire de libellé « pilier » ou de jargon pédagogique dans l’interface
collaborateur ; exprimer le principe par la fonctionnalité elle-même.

### Gamification (paramétrable)

Barème d’XP : `XP` dans `packages/core/src/content/gamification.ts` · Niveaux : `LEVELS` ·
Badges : `frontend/collaborateur/src/store/badges.ts` · Missions quotidiennes : `store/missions.ts`.

## Brancher le back-end

Le frontend est prêt : contrats de données (`packages/contracts`), client HTTP et endpoints
(`packages/core/src/api/http/`), événements d'apprentissage déjà émis par le portail collaborateur.

- **Authentification** : SSO de l'entreprise derrière `GET /api/me` ; le rôle pilote l'accès aux portails.
- **Contenus** : `GET /api/catalog` remplace les données de démo (`mock-server/src/data/`).
- **Progression** : `POST /api/progress/events` reçoit chaque action (`LearningEvent`).
- **Assistant** : `POST /api/chat`, LLM + RAG limité aux contenus validés QHSE.
- **Médias** : renseigner `mediaUrl` sur les ressources pour lire les vraies vidéos/podcasts.

Contrat complet : [`docs/api-contract.md`](docs/api-contract.md) · Guide : [`backend/README.md`](backend/README.md).

> ⚠️ Les contenus SST fournis sont des exemples rédigés pour la démo : ils doivent être relus et validés par l’équipe QHSE avant mise en production.
