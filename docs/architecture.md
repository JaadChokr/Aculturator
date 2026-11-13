# Architecture

Acculturator est un **monorepo npm (workspaces)**. Tout le code TypeScript du frontend est dans
`frontend/`, rangé en deux familles :

- **`frontend/packages/`** : les bibliothèques partagées entre les applications, que l'on importe
  (types, design system, socle applicatif) ;
- **`frontend/<application>/`** : ce qui se lance et se déploie, l'application hôte et un dossier
  par portail.

Le backend (Python, FastAPI) est à part, dans `backend/`.

```
.
├── frontend/
│   ├── packages/             bibliothèques partagées par les applications
│   │   ├── contracts/        @acculturator/contracts — types échangés avec le backend (aucune dépendance)
│   │   ├── design-system/    @acculturator/design-system — identité visuelle commune (purement visuel)
│   │   └── core/             @acculturator/core — socle applicatif : API, authentification, parcours, catalogue
│   ├── shell/                @acculturator/shell — application hôte (Vite) : providers, routeur, registre des portails
│   ├── collaborateur/        @acculturator/portal-collaborateur
│   ├── referent/             @acculturator/portal-referent
│   └── admin/                @acculturator/portal-admin
├── mock-server/              @acculturator/mock-server — faux backend de démo, en TypeScript (hors frontend)
├── backend/                  futur backend Python / FastAPI (voir backend/README.md)
└── docs/                     architecture, contrat d'API
```

## Graphe de dépendances

```
Frontend :   contracts  ←  design-system  ←  core  ←  portails (collaborateur, referent, admin)  ←  shell
Backends :   contracts  ←  mock-server (démo, TypeScript)
             backend (futur, Python) : ses modèles Pydantic décrivent les mêmes données

Seul lien entre les deux mondes : des requêtes HTTP sur /api.
(Exception : en démo, le shell installe mock-server dans le navigateur.)
```

Le frontend et les backends (faux ou vrai) ne partagent **que le contrat d'API** et ne
communiquent **qu'en HTTP**. Le mock-server, en TypeScript, importe directement les contrats ; le
backend Python ne le peut pas : voir « Contrats et backend FastAPI » ci-dessous.

Ces frontières sont **vérifiées par ESLint** (`eslint.config.js`, règle `no-restricted-imports`) :

| Module                            | Peut importer                                                     | Ne peut pas importer                                                            |
| --------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `frontend/packages/contracts`     | rien (imports relatifs uniquement)                                | toute bibliothèque, tout autre paquet                                           |
| `frontend/packages/design-system` | `contracts` (types), bibliothèques d'interface                    | `core`, tout autre paquet maison, toute bibliothèque de données (`@tanstack/*`) |
| `frontend/packages/core`          | `contracts`, `design-system`, bibliothèques                       | un portail, le shell, `mock-server`                                             |
| `frontend/<portail>`              | `contracts`, points d'entrée publics de `design-system` et `core` | un autre portail, le shell, `mock-server`, des chemins internes (`…/src/…`)     |
| `frontend/shell`                  | tout                                                              | —                                                                               |
| `mock-server`                     | `contracts`, `node:*`                                             | toute bibliothèque, tout paquet frontend                                        |

Seul le shell connaît `mock-server`, et uniquement pour l'installer en démo/développement :
`design-system`, `core` et les portails ne peuvent pas l'importer.

Conséquence : un portail peut être confié à une équipe, refondu ou retiré sans toucher aux autres.
Ce qui doit être partagé passe par `design-system` (ce qui se voit), `core` (ce qui se charge,
se calcule ou se vérifie) ou `contracts` (les types échangés avec le backend).

## Contrats et backend FastAPI

`@acculturator/contracts` décrit les données échangées avec le backend. Tant que le backend
n'existe pas, ces types écrits à la main (avec [`api-contract.md`](./api-contract.md)) servent de
spécification. Avec FastAPI, la source de vérité passera côté backend :

1. les modèles Pydantic du backend décrivent les données ; FastAPI en publie le schéma OpenAPI
   (`/openapi.json`) ;
2. les types de `frontend/packages/contracts` sont **générés** à partir de ce schéma (par exemple
   avec `openapi-typescript`) au lieu d'être écrits à la main ;
3. le frontend et le mock-server continuent d'importer `@acculturator/contracts` : leur code ne
   change pas, et un champ modifié côté backend casse leur compilation après régénération.

## Le design system (`@acculturator/design-system`)

Garantit une **identité visuelle unique** entre portails. Il est **purement visuel** : il n'appelle
jamais l'API, ne connaît ni l'utilisateur ni les portails, et reçoit en props ce qu'il affiche
(vérifié par ESLint). Il est donc réutilisable tel quel pour une autre thématique d'Acculturator.

Points d'entrée publics (`exports` de `frontend/packages/design-system/package.json`) :

| Point d'entrée   | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/ui`            | Composants shadcn/ui (Button, Card, Dialog, Tabs…)                                                                                                                                                                                                                                                                                                                                                                       |
| `/components`    | Composants transverses : PageHeader, Eyebrow (sur-titre), SegmentedControl (choix exclusif en barre), ChoiceGroup + ChoiceCard (choix en cartes), DifficultyPicker (choix du niveau « en escalier » : marches de plus en plus hautes et foncées, axe de difficulté croissante), DifficultyDots / DIFFICULTY_STYLE (teintes de difficulté), Mascot, ProgressRing, Confetti, Toaster, NotificationsMenu, chargement/erreur |
| `/layout`        | `AppShell` (barre latérale, en-tête, navigation mobile, transitions), `UserMenu`, `StandaloneShell` (même cadre pour les pages hors portail, ex. choix du parcours), `HEADER_BAR` / `CONTENT_AREA` (cadre commun), `Page` / `PAGE_WIDTH` (largeurs de page : full, focus, narrow)                                                                                                                                        |
| `/motion`        | Réglages d'animation communs (ressorts, apparitions, `Stagger`, `Reveal`, `AnimatedNumber`)                                                                                                                                                                                                                                                                                                                              |
| `/theme`         | Thème clair / sombre / système                                                                                                                                                                                                                                                                                                                                                                                           |
| `/themes`        | Palettes d'icônes et de couleurs (`THEME_ICONS`, `THEME_COLORS`, `themeIcon`, `themeDot`) dans lesquelles chaque parcours choisit l'habillage de ses thématiques                                                                                                                                                                                                                                                         |
| `/lib`, `/hooks` | Utilitaires (`cn`, dates…) et hooks d'interface                                                                                                                                                                                                                                                                                                                                                                          |
| `/styles.css`    | Design tokens (couleurs, rayons, animations) et Tailwind                                                                                                                                                                                                                                                                                                                                                                 |

### Rester conforme au style partagé

Les pages ne recopient pas de classes de style : elles utilisent les briques ci-dessus, définies une
seule fois. ESLint le vérifie dans les portails et le shell (`SHARED_STYLE_RULES` dans
`eslint.config.js`) :

| Interdit dans une page                              | À utiliser                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| Conteneur centré à largeur fixe (`mx-auto max-w-…`) | `<Page width>` ou `PAGE_WIDTH.full / focus / narrow`                        |
| Sur-titre recopié (`tracking-[0.12em] uppercase`…)  | `<Eyebrow tone>`                                                            |
| `role="radiogroup"` fait main                       | `SegmentedControl`, ou `ChoiceGroup` + `ChoiceCard`                         |
| Couleurs de niveau (`bg-level-2`…)                  | `DifficultyPicker`, `DIFFICULTY_STYLE`, `DifficultyDots`, `ALL_LEVELS_BAND` |

Toutes les pages partagent le même cadre (en-tête de 64 px, zone de contenu jusqu'à 1 760 px, mêmes marges) : `AppShell` pour les portails, `StandaloneShell` pour les pages hors portail. Une page d'activité (quiz, choix du niveau, résultats, assistant) est en largeur `focus` ; une
rubrique (tableau de bord, listes) en `full` ; une carte à la fois (flashcards) en `narrow`.
Pour faire évoluer le style, on modifie la brique ou le jeton (`styles/index.css`) : toutes les
pages suivent.

## Le socle applicatif (`@acculturator/core`)

Tout ce que les portails partagent **sans être de l'interface** :

| Point d'entrée   | Rôle                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api`           | **Couche d'accès aux données** (voir ci-dessous)                                                                                                   |
| `/auth`          | `AuthProvider`, `useAuth()`, libellés des rôles                                                                                                    |
| `/catalog`       | Chargement unique du catalogue pédagogique (`CatalogProvider`, `useCatalog`, `getCatalog`) et de ses thématiques (`useTheme`, `getTheme`)          |
| `/notifications` | `useNotifications()` : chargement, rafraîchissement et lecture des notifications                                                                   |
| `/parcours`      | Parcours proposés et parcours en cours (`useParcoursList`, `useCurrentParcours`, `useSelectParcours`), son identité (`useBranding`, `getBranding`) |
| `/portal`        | Contrat `PortalDefinition` et registre des portails (`usePortalRegistry`)                                                                          |
| `/content`       | Référentiels fonctionnels : barème de gamification (XP, paliers de niveaux, `levelsWith`), libellés                                                |

Le lien entre les deux se fait dans le shell : `frontend/shell/src/PortalLayout.tsx` charge
l'utilisateur, les portails accessibles et les notifications (`core`), puis les passe à `AppShell`,
`UserMenu` et `NotificationsMenu` (`design-system`).

## Couche d'accès aux données

Les pages ne font **jamais** d'appel réseau direct ni d'import de données en dur : elles passent par
l'objet `api` (`@acculturator/core/api`), qui implémente l'interface `Api` :

```ts
api.auth.getCurrentUser()        api.content.getCatalog()
api.chat.ask(question)           api.chat.getSuggestions()
api.notifications.list()         api.notifications.markRead(ids)
api.progress.track(event)
```

Une seule implémentation : **HTTP** (`frontend/packages/core/src/api/http/`), sur `VITE_API_URL`
(défaut `/api`). Endpoints : [`api-contract.md`](./api-contract.md). Qui répond à ces appels ne
concerne pas le frontend :

| Contexte                     | Qui répond sur `/api`                                                               | Réglage                                                |
| ---------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `npm run dev` (défaut)       | **mock-server dans le navigateur** : il intercepte `fetch` et répond localement     | `VITE_MOCK_SERVER=true` (`.env.development`)           |
| Dev avec serveur             | Vite relaie `/api` vers `localhost:3000` : `npm run mock-server` ou le vrai backend | `VITE_MOCK_SERVER=false` dans `.env.development.local` |
| Démo statique (`build:demo`) | mock-server dans le navigateur                                                      | `.env.demo`                                            |
| Production (`build`)         | le vrai backend ; **mock-server n'est pas embarqué**                                | —                                                      |

Voir [`mock-server/README.md`](../mock-server/README.md).

L'état serveur est géré par **TanStack Query** (cache, rechargement, états de chargement/erreur) :
utilisateur courant (`['me']`), catalogue, notifications, suggestions de l'assistant.
L'état d'interface et la progression locale de démo restent dans des stores **Zustand**.

### Progression

Le portail collaborateur conserve sa progression dans un store local (affichage immédiat, mode
hors-ligne de la démo) **et** émet chaque action d'apprentissage via `api.progress.track(event)`
(`LearningEvent` dans `contracts`) : ressource consultée, carte révisée, question répondue, partie
terminée, danger repéré, question posée à l'assistant. Le backend en déduira la progression de
référence et les statistiques des portails référent et administrateur. Étape suivante prévue :
hydrater le store depuis un endpoint `GET /progress` à la connexion.

## Assemblage par l'application hôte

`frontend/shell/src/App.tsx` empile les providers :

```
ThemeProvider → QueryClientProvider → AuthProvider
  → PortalRegistryProvider(PORTALS) → MotionConfig → TooltipProvider → RouterProvider
```

`frontend/shell/src/portals.ts` est **le seul endroit** qui connaît la liste des portails. Le routeur
génère les routes à partir de chaque `PortalDefinition` :

```
/                     ParcoursPage : choix du parcours (point d'entrée de la plateforme)
/<portail>/…          RequireRole → RequireParcours → PortalLayout → pages du portail
```

### Parcours

La plateforme est prévue pour plusieurs parcours d'acculturation (SST aujourd'hui). Le parcours
choisi est mémorisé dans le navigateur (`@acculturator/core/parcours`) et :

- les appels propres à un parcours (catalogue, assistant, événements de progression) sont
  automatiquement préfixés par `/parcours/:id` dans `frontend/packages/core/src/api/http/` : les pages des
  portails n'ont pas à s'en occuper ;
- `RequireParcours` renvoie vers `/` si aucun parcours n'est choisi (lien direct, première visite),
  puis charge le catalogue du parcours avant d'afficher le portail ;
- changer de parcours (menu utilisateur › Parcours › Changer) oublie les données de l'ancien parcours
  en cache ; l'utilisateur, les notifications et la liste des parcours sont conservés.

**Un parcours se décrit par ses données, pas par du code.** Tout ce qui est propre à une thématique
d'acculturation vient de l'API :

| Donnée                                 | Ce qu'elle pilote dans l'interface                                                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Parcours.activities`                  | Rubriques proposées (ressources, flashcards, quiz, chasse aux risques, assistant) : menu, routes (`RequireActivity`), recommandations, missions et badges s'y limitent |
| `Parcours.branding`                    | Icône du parcours, nom et périmètre de l'assistant, mise en garde, titres des niveaux                                                                                  |
| `Catalog.themes`                       | Thématiques (titres, descriptions) et leur habillage, choisi par clé dans les palettes de `@acculturator/design-system/themes`                                         |
| `Catalog.hazardScenes[].image`         | Illustration de chaque scène de chasse aux risques ; dangers et leurres sont placés dans son repère                                                                    |
| `Catalog.resources`, `flashcards`, `…` | Contenus pédagogiques                                                                                                                                                  |

Une activité est aussi masquée quand le catalogue n'a rien pour l'alimenter (aucune scène, aucune
flashcard…). Côté portail collaborateur : `store/activities.ts` (`offers`, `useOffers`) et
`store/levels.ts` (titres des niveaux du parcours).

**Page de choix du parcours.** Chaque carte affiche la maîtrise du parcours (barre de progression,
ressources consultées, cartes ancrées, dernière activité) ; une recherche (insensible aux accents) et
un filtre Tous / Commencés / À découvrir aident à s'y retrouver quand les parcours se multiplieront.
L'avancement vient de `Parcours.progress` (backend) ou, à défaut, du portail qui sait le calculer
(`PortalDefinition.parcoursProgress`, fourni par le portail collaborateur).

**Progression par parcours.** La progression du collaborateur (XP, niveau, série, cartes, réponses,
badges, missions) est propre à chaque parcours : une sauvegarde par parcours
(`acculturator.collaborateur.progress.<id>`), chargée par le store
(`frontend/collaborateur/src/store/progress.ts`) à chaque changement de parcours, grâce à
`onParcoursChange` de `@acculturator/core/parcours`. Un nouveau parcours part de zéro (le parcours
SST de la démo part d'un profil déjà engagé). Les didacticiels déjà vus sont communs à tous les
parcours (`store/tips.ts`). L'ancienne sauvegarde unique est reprise automatiquement dans le parcours
SST. Côté backend, les événements arrivent déjà par parcours (`/parcours/:id/progress/events`).

Variables d'environnement (`frontend/shell/.env.*`) :

| Variable                  | Valeurs                         | Effet                                                |
| ------------------------- | ------------------------------- | ---------------------------------------------------- |
| `VITE_MOCK_SERVER`        | `true` \| `false`               | Faux backend de démo servi dans le navigateur        |
| `VITE_API_URL`            | URL                             | Préfixe des appels HTTP (défaut `/api`)              |
| `VITE_ROUTER_MODE`        | `browser` \| `hash` \| `memory` | Type de routeur (`memory` pour la démo autonome)     |
| `VITE_DEMO_ROLE_SWITCHER` | `true` \| `false`               | Sélecteur de profil de démo dans le menu utilisateur |

## Recettes

### Ajouter un parcours

1. Côté backend : renvoyer le parcours dans `GET /parcours` (statut, chiffres, `activities`,
   `branding`) et servir ses endpoints `/parcours/:id/…`, à commencer par son catalogue
   (`themes`, contenus, scènes illustrées). En attendant le backend, un parcours de démo s'ajoute
   dans le serveur de démo : un dossier `mock-server/src/data/<id>/` sur le modèle de
   `mock-server/src/data/sst/` (voir [`mock-server/README.md`](../mock-server/README.md)).
2. Côté frontend : rien à écrire. Seulement si une thématique a besoin d'une icône ou d'une couleur
   qui n'existe pas encore, l'ajouter aux palettes de `frontend/packages/design-system/src/themes/index.ts`
   (une clé inconnue prend un habillage neutre en attendant).
3. Une nouvelle **activité** (un nouveau type d'exercice), elle, demande du code : l'ajouter à
   `ActivityId` (`frontend/packages/contracts/src/parcours.ts`), créer sa rubrique dans le portail et la
   relier à `offers`.

### Ajouter une rubrique à un portail

1. Créer la page dans `frontend/<portail>/src/pages/`.
2. L'ajouter dans `nav` et `routes` de `frontend/<portail>/src/index.tsx`.
   Layout, navigation desktop/mobile et fil d'Ariane sont automatiques.

### Ajouter un portail

1. Copier `frontend/referent/` vers `frontend/<id>/` et renommer le paquet
   `@acculturator/portal-<id>` dans son `package.json`.
2. Exporter une `PortalDefinition` depuis `src/index.tsx` (id, basePath, rôles autorisés, nav, routes).
3. Ajouter le paquet aux dépendances de `frontend/shell/package.json`, l'importer dans
   `frontend/shell/src/portals.ts`, puis ajouter son nom à `PORTALS` dans `eslint.config.js`.
4. `npm install` pour lier le nouveau paquet.

### Ajouter un appel au backend

1. Déclarer les types échangés dans `frontend/packages/contracts/src/`.
2. Ajouter la méthode à l'interface concernée dans `frontend/packages/core/src/api/types.ts`.
3. L'implémenter dans `frontend/packages/core/src/api/http/index.ts`.
4. Documenter l'endpoint dans [`api-contract.md`](./api-contract.md) et ajouter sa route de
   démonstration dans `mock-server/src/routes.ts`.
5. Consommer depuis un composant avec `useQuery` / `useMutation`.

### Ajouter un composant shadcn/ui

```bash
cd frontend/packages/design-system && npx shadcn@latest add <composant>
```

Le composant est généré dans `frontend/packages/design-system/src/ui/`. Remplacer l'import `@/lib/utils`
généré par `../lib`, puis l'exporter depuis `frontend/packages/design-system/src/ui/index.ts`.
