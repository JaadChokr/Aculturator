# Contrat d'API (frontend ↔ backend)

Ce document décrit les endpoints appelés par le frontend
(`frontend/packages/core/src/api/http/index.ts`). `mock-server/src/routes.ts` en est une implémentation de
référence avec des données d'exemple. Les types cités sont définis dans
**`frontend/packages/contracts`** (`@acculturator/contracts`). Le backend (Python, FastAPI) les
reproduit en modèles Pydantic ; à terme, ces types TypeScript seront générés à partir de son schéma
OpenAPI (voir « Contrats et backend FastAPI » dans [`architecture.md`](./architecture.md)).

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
| `GET`   | `/parcours`           | —                   | `Parcours[]`        | Parcours proposés sur la page de choix                         |
| `GET`   | `/notifications`      | —                   | `AppNotification[]` | Notifications de l'utilisateur (le contenu dépend du rôle)     |
| `POST`  | `/notifications/read` | `{ ids: string[] }` | `204`               | Marquer des notifications comme lues                           |

Endpoints **propres à un parcours**, préfixés par `/parcours/:id` (ex. `/parcours/sst/catalog`) ;
un parcours inconnu ou non disponible répond `404` :

| Méthode | Chemin                           | Corps           | Réponse     | Usage                                                 |
| ------- | -------------------------------- | --------------- | ----------- | ----------------------------------------------------- |
| `GET`   | `/parcours/:id/catalog`          | —               | `Catalog`   | Catalogue du parcours, chargé à l'entrée d'un portail |
| `POST`  | `/parcours/:id/chat`             | `ChatRequest`   | `ChatReply` | Question à l'assistant du parcours                    |
| `GET`   | `/parcours/:id/chat/suggestions` | —               | `string[]`  | Idées de questions proposées dans le carrousel        |
| `POST`  | `/parcours/:id/progress/events`  | `LearningEvent` | `204`       | Événement d'apprentissage (envoi « fire and forget ») |

> Hors contrat : `POST /demo/role` (`{ role }` → `204`) n'existe que dans `mock-server`, pour le
> sélecteur de profil de la démo. Le vrai backend ne l'implémente pas : le rôle vient du SSO.

### `Parcours`

```ts
interface Parcours {
  id: string // ex. "sst", utilisé dans les chemins /parcours/:id/…
  title: string // "Santé & Sécurité au Travail"
  shortTitle: string // affiché sous la marque et dans le menu utilisateur
  description: string
  status: 'available' | 'coming_soon'
  stats: { themes: number; resources: number; flashcards: number; quizQuestions: number }
  activities: ActivityId[] // rubriques proposées ; les autres sont masquées dans les portails
  branding: ParcoursBranding
  progress?: ParcoursProgress // avancement de l'utilisateur connecté, absent s'il n'a pas commencé
}

type ActivityId = 'resources' | 'flashcards' | 'quiz' | 'hazard-hunt' | 'assistant'

interface ParcoursBranding {
  icon?: string // clé de la palette d'icônes du design system (ex. "shield-plus")
  assistantName: string // ex. "Prévi"
  assistantScope: string // ex. "la santé et la sécurité au travail"
  assistantDisclaimer?: string // mise en garde affichée sous le champ de l'assistant
  levelTitles?: string[] // titres des 6 niveaux de joueur ; titres génériques sinon
}

interface ParcoursProgress {
  mastery: number // 0-100, même formule que la « Maîtrise globale » du tableau de bord
  resourcesViewed: number
  cardsAnchored: number // flashcards revues avec succès sur la durée
  lastActivity?: string // AAAA-MM-JJ
}
```

Tant que le backend ne renvoie pas `progress`, le frontend le calcule à partir de la progression
enregistrée dans le navigateur (portail collaborateur, `parcoursProgress`). Formule de la maîtrise :
justesse des réponses par thématique × 55 % + part des flashcards ancrées × 25 % + part des
ressources consultées × 20 % (`frontend/collaborateur/src/store/insights.ts`, `overallMastery`).

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
  themes: Theme[] // thématiques du parcours, dans l'ordre d'affichage
  resources: Resource[] // vidéos, fiches, infographies, podcasts (+ check express)
  flashcards: Flashcard[]
  quizQuestions: QuizQuestion[]
  hazardScenes: HazardScene[] // chasse aux risques : illustration + dangers et leurres placés dans son repère
  modules?: ModulesPlan // parcours organisé en modules (voir ci-dessous)
}
```

`modules` (facultatif) organise le parcours en blocs ordonnés :

```ts
interface ModulesPlan {
  ordering: 'sequential' | 'free' // sequential : un module se débloque quand le précédent est terminé
  modules: LearningModule[] // dans l'ordre du parcours
}
interface LearningModule {
  id: string
  title: string
  description: string
  themeIds: ThemeId[]
  durationMin: number
  steps: ModuleStep[] // terminées dans n'importe quel ordre ; module terminé quand toutes le sont
}
type ModuleStep =
  | { kind: 'resource'; resourceId: string }
  | { kind: 'flashcards'; themeId: ThemeId } // toutes les cartes revues au moins une fois
  | { kind: 'quiz'; questionIds: string[]; passRatio: number } // réussi à partir de passRatio (0-1)
  | { kind: 'hazard'; sceneId: string } // tous les dangers repérés
```

La fin d'un module est signalée par l'événement `{ type: 'module_completed', moduleId }` ; le quiz
de validation par `quiz_completed` avec `mode: 'module'` et `moduleId`.

Thématiques et scènes :

```ts
interface Theme {
  id: ThemeId // string, propre au parcours (ex. "incendie")
  title: string
  short: string // libellé court (étiquettes, filtres)
  description: string
  icon: string // clé de la palette d'icônes (ex. "fire") ; inconnue → icône neutre
  color: string // clé de la palette de couleurs (ex. "orange") ; inconnue → couleur neutre
}
interface HazardScene {
  id: string
  image: { src: string; width: number; height: number } // URL (ou URI data:) de l'illustration
  title: string
  description: string
  hazards: Hazard[] // { id, x, y, r, label, explanation, themeId } dans le repère de l'image
  decoys: DecoySpot[] // { x, y, r, label, explanation }
}
```

Détail des champs : `frontend/packages/contracts/src/content.ts`. Les clés d'icône et de couleur disponibles
sont listées dans `frontend/packages/design-system/src/themes/index.ts`.

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
et au parcours de l'URL (`TrackedEvent { userId, occurredAt, event }`). Ces événements alimentent la progression et les
statistiques des portails référent et administrateur.

## Évolutions prévues

| Endpoint                                    | Pour                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `GET /progress`                             | Hydrater la progression du collaborateur à la connexion (aujourd'hui locale) |
| `GET /referent/team`, `GET /referent/stats` | Portail référent : suivi de l'équipe, statistiques par thématique            |
| `GET/POST/PUT/DELETE /admin/content/*`      | Portail administrateur : édition du catalogue                                |
| `GET/PUT /admin/users`                      | Portail administrateur : rôles et périmètres                                 |

Chaque ajout suit la recette « Ajouter un appel au backend » de [`architecture.md`](./architecture.md).
