# Contrat d'API (frontend ↔ backend)

Ce document décrit les endpoints appelés par le frontend
(`frontend/shared/src/api/http/index.ts`). `mock-server/src/routes.ts` en est une implémentation de
référence avec des données d'exemple. Les types cités sont définis dans
**`packages/contracts`** (`@acculturator/contracts`), source de vérité partagée : le backend
devrait les importer (s'il est en TypeScript) ou les reproduire à l'identique.

## Conventions

- Préfixe : `/api` (configurable côté frontend via `VITE_API_URL`).
- Format : JSON (`Content-Type: application/json`), dates en ISO 8601.
- Authentification : **session par cookie** issue du SSO de l'entreprise
  (le client envoie `credentials: 'include'`). Toutes les routes exigent un utilisateur connecté.
- Erreurs : code HTTP explicite (`401` non authentifié, `403` rôle insuffisant, `4xx/5xx` sinon).
  Le frontend affiche un état d'erreur avec « Réessayer ».
- `204 No Content` accepté pour les écritures sans réponse.

## Endpoints

| Méthode | Chemin                | Corps               | Réponse             | Usage                                                          |
| ------- | --------------------- | ------------------- | ------------------- | -------------------------------------------------------------- |
| `GET`   | `/me`                 | —                   | `User`              | Utilisateur connecté et son rôle (pilote l'accès aux portails) |
| `GET`   | `/catalog`            | —                   | `Catalog`           | Catalogue pédagogique chargé au démarrage                      |
| `POST`  | `/chat`               | `ChatRequest`       | `ChatReply`         | Question à l'assistant SST                                     |
| `GET`   | `/chat/suggestions`   | —                   | `string[]`          | Idées de questions proposées dans le carrousel                 |
| `GET`   | `/notifications`      | —                   | `AppNotification[]` | Notifications de l'utilisateur (le contenu dépend du rôle)     |
| `POST`  | `/notifications/read` | `{ ids: string[] }` | `204`               | Marquer des notifications comme lues                           |
| `POST`  | `/progress/events`    | `LearningEvent`     | `204`               | Événement d'apprentissage (envoi « fire and forget »)          |

> Hors contrat : `POST /demo/role` (`{ role }` → `204`) n'existe que dans `mock-server`, pour le
> sélecteur de profil de la démo. Le vrai backend ne l'implémente pas : le rôle vient du SSO.

### `User`

```ts
type Role = 'collaborateur' | 'referent' | 'admin'
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  site: string
  team: string
  jobTitle: string
}
```

### `Catalog`

```ts
interface Catalog {
  resources: Resource[] // vidéos, fiches, infographies, podcasts (+ check express)
  flashcards: Flashcard[]
  quizQuestions: QuizQuestion[]
  hazardScenes: HazardScene[] // chasse aux risques : dangers + leurres, coordonnées dans un viewBox 1000×600
}
```

Détail des champs : `packages/contracts/src/content.ts`. `ThemeId` est une liste fermée de
thématiques SST ; ajouter une thématique demande aussi d'ajouter son icône et sa couleur dans
`frontend/shared/src/content/themes.ts`.

### `ChatReply`

```ts
interface ChatRequest {
  question: string
}
interface ChatReply {
  text: string
  links?: { label: string; to: string }[] // `to` relatif au portail collaborateur, ex. "ressources?r=r-pas"
  matched?: string // identifiant de la réponse de référence (traçabilité QHSE)
}
```

Recommandation : réponses générées par un LLM **contraint aux contenus validés QHSE** (RAG sur le
catalogue), avec renvoi vers les ressources sources dans `links`.

### `AppNotification`

```ts
type NotificationKind = 'content' | 'review' | 'badge' | 'team' | 'safety' | 'report'
interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  to?: string // chemin absolu dans l'application, ouvert au clic
  createdAt: string // ISO 8601
  read: boolean
}
```

### `LearningEvent`

```ts
type LearningEvent =
  | { type: 'resource_viewed'; resourceId: string }
  | { type: 'card_reviewed'; cardId: string; grade: 'again' | 'hard' | 'good' }
  | { type: 'question_answered'; questionId?: string; themeId: ThemeId; correct: boolean }
  | {
      type: 'quiz_completed'
      mode: 'entrainement' | 'chrono' | 'defi-du-jour' | 'chasse'
      themeId?: ThemeId
      score: number
      total: number
    }
  | { type: 'hazard_found'; sceneId: string; hazardId: string }
  | { type: 'chat_question_asked' }
```

Le backend horodate et rattache l'événement à l'utilisateur de la session
(`TrackedEvent { userId, occurredAt, event }`). Ces événements alimentent la progression et les
statistiques des portails référent et administrateur.

## Évolutions prévues

| Endpoint                                    | Pour                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `GET /progress`                             | Hydrater la progression du collaborateur à la connexion (aujourd'hui locale) |
| `GET /referent/team`, `GET /referent/stats` | Portail référent : suivi de l'équipe, statistiques par thématique            |
| `GET/POST/PUT/DELETE /admin/content/*`      | Portail administrateur : édition du catalogue                                |
| `GET/PUT /admin/users`                      | Portail administrateur : rôles et périmètres                                 |

Chaque ajout suit la recette « Ajouter un appel au backend » de [`architecture.md`](./architecture.md).
