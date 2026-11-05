# Architecture

Acculturator est un **monorepo npm (workspaces)**. Chaque portail est un paquet autonome, le socle
commun est partagé, et les **contrats de données** sont isolés pour être réutilisés par le backend.

```
.
├── packages/
│   └── contracts/            @acculturator/contracts — types du domaine & DTO (aucune dépendance)
├── frontend/
│   ├── shell/                @acculturator/shell — application hôte (Vite) : providers, routeur, registre des portails
│   ├── shared/               @acculturator/shared — socle commun à tous les portails
│   ├── collaborateur/        @acculturator/portal-collaborateur
│   ├── referent/             @acculturator/portal-referent
│   └── admin/                @acculturator/portal-admin
├── backend/                  emplacement réservé au futur backend (voir backend/README.md)
└── docs/                     architecture, contrat d'API
```

## Graphe de dépendances

```
contracts  ←  shared  ←  portails (collaborateur, referent, admin)  ←  shell
    ↑
 backend (futur)
```

Ces frontières sont **vérifiées par ESLint** (`eslint.config.js`, règle `no-restricted-imports`) :

| Module               | Peut importer                                    | Ne peut pas importer                                                |
| -------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| `packages/contracts` | rien (imports relatifs uniquement)               | toute bibliothèque, tout autre paquet                               |
| `frontend/shared`    | `contracts`, bibliothèques                       | un portail, le shell, lui-même par nom de paquet                    |
| `frontend/<portail>` | `contracts`, points d'entrée publics de `shared` | un autre portail, le shell, des chemins internes (`shared/src/...`) |
| `frontend/shell`     | tout                                             | —                                                                   |

Conséquence : un portail peut être confié à une équipe, refondu ou retiré sans toucher aux autres.
Ce qui doit être partagé passe par `@acculturator/shared` (ou `contracts` pour les types).

## Le socle partagé (`@acculturator/shared`)

Chaque dossier est un **point d'entrée public** déclaré dans `exports` de `frontend/shared/package.json` :

| Point d'entrée   | Rôle                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `/ui`            | Design system shadcn/ui (Button, Card, Dialog, Tabs…)                                                                       |
| `/components`    | Composants transverses : PageHeader, Mascot, ProgressRing, Confetti, Toaster, NotificationsMenu, états de chargement/erreur |
| `/layout`        | `PortalLayout` : en-tête, navigation latérale et mobile, menu utilisateur                                                   |
| `/motion`        | Réglages d'animation communs (ressorts, apparitions, `Stagger`, `Reveal`, `AnimatedNumber`)                                 |
| `/auth`          | `AuthProvider`, `useAuth()`, libellés des rôles                                                                             |
| `/theme`         | Thème clair / sombre / système                                                                                              |
| `/portal`        | Contrat `PortalDefinition` et registre des portails (`usePortalRegistry`)                                                   |
| `/api`           | **Couche d'accès aux données** (voir ci-dessous)                                                                            |
| `/catalog`       | Chargement unique du catalogue pédagogique (`CatalogProvider`, `useCatalog`, `getCatalog`)                                  |
| `/content`       | Référentiels d'affichage : thématiques (icônes, couleurs), barème de gamification, libellés                                 |
| `/lib`, `/hooks` | Utilitaires (`cn`, dates…) et hooks génériques                                                                              |
| `/styles.css`    | Design tokens (couleurs, rayons, animations) et Tailwind                                                                    |

## Couche d'accès aux données

Les pages ne font **jamais** d'appel réseau direct ni d'import de données en dur : elles passent par
l'objet `api` (`@acculturator/shared/api`), qui implémente l'interface `Api` :

```ts
api.auth.getCurrentUser()        api.content.getCatalog()
api.chat.ask(question)           api.chat.getSuggestions()
api.notifications.list()         api.notifications.markRead(ids)
api.progress.track(event)
```

Deux implémentations, choisies par `VITE_API_MODE` :

- `mock` (défaut) — `frontend/shared/src/api/mock/` : données de démonstration et latence simulée,
  aucun serveur requis. Les données de démo vivent dans `mock/data/`.
- `http` — `frontend/shared/src/api/http/` : appels au backend sur `VITE_API_URL` (défaut `/api`,
  relayé vers `http://localhost:3000` par le serveur de dev Vite). Endpoints : [`api-contract.md`](./api-contract.md).

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
ThemeProvider → QueryClientProvider → AuthProvider → CatalogProvider
  → PortalRegistryProvider(PORTALS) → MotionConfig → TooltipProvider → RouterProvider
```

`frontend/shell/src/portals.ts` est **le seul endroit** qui connaît la liste des portails. Le routeur
génère les routes à partir de chaque `PortalDefinition`, protège chaque portail par rôle
(`RequireRole`) et redirige `/` vers le portail d'accueil du rôle connecté.

Variables d'environnement (`frontend/shell/.env.*`) :

| Variable                  | Valeurs                         | Effet                                                |
| ------------------------- | ------------------------------- | ---------------------------------------------------- |
| `VITE_API_MODE`           | `mock` \| `http`                | Source des données                                   |
| `VITE_API_URL`            | URL                             | Préfixe des appels HTTP (défaut `/api`)              |
| `VITE_ROUTER_MODE`        | `browser` \| `hash` \| `memory` | Type de routeur (`memory` pour la démo autonome)     |
| `VITE_DEMO_ROLE_SWITCHER` | `true` \| `false`               | Sélecteur de profil de démo dans le menu utilisateur |

## Recettes

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

1. Déclarer les types échangés dans `packages/contracts/src/`.
2. Ajouter la méthode à l'interface concernée dans `frontend/shared/src/api/types.ts`.
3. L'implémenter dans `api/mock/` **et** `api/http/` (TypeScript signale l'oubli).
4. Documenter l'endpoint dans [`api-contract.md`](./api-contract.md).
5. Consommer depuis un composant avec `useQuery` / `useMutation`.

### Ajouter un composant shadcn/ui

```bash
cd frontend/shared && npx shadcn@latest add <composant>
```

Le composant est généré dans `frontend/shared/src/ui/`. Remplacer l'import `@/lib/utils` généré par
`../lib`, puis l'exporter depuis `frontend/shared/src/ui/index.ts`.
