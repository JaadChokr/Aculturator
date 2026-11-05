# Acculturator v2 — Santé & Sécurité au Travail

Plateforme interne d’acculturation des collaborateurs, parcours **Santé & Sécurité au Travail (SST)**.
Ce dépôt contient le **front-end**, organisé en **portails** selon le rôle de l’utilisateur :

| Portail | Route | Rôles autorisés | État |
|---|---|---|---|
| Espace collaborateur | `/collaborateur` | collaborateur, référent, admin | ✅ Fonctionnel (données mockées) |
| Portail référent | `/referent` | référent, admin | 🧱 Squelette + périmètre décrit |
| Portail administrateur | `/admin` | admin | 🧱 Squelette + périmètre décrit |

## Stack

- **React 19 + TypeScript** (Vite)
- **Tailwind CSS v4** + composants **shadcn/ui** (Radix UI) pour une identité visuelle unifiée
- **React Router 7** (routes déclarées par portail, pages chargées à la demande)
- **Motion** (ex-Framer Motion) pour les animations et gestes
- **Zustand** (état de progression du collaborateur, persisté en `localStorage` pour la démo)
- **lucide-react** (icônes), police **IBM Plex Sans** (embarquée)

## Démarrer

```bash
npm install
npm run dev          # http://localhost:5173 (sélecteur de profil de démo activé)
npm run build        # build de production → dist/
npm run build:demo   # build statique autonome (routeur en mémoire, chemins relatifs) → dist-demo/
npm run lint && npm run typecheck
npm run format       # Prettier
```

En développement, le menu utilisateur (en haut à droite, dans l’en-tête) permet de **changer de profil**
(collaborateur / référent / admin) pour visiter les trois portails. Ce sélecteur est piloté par
`VITE_DEMO_ROLE_SWITCHER` et n’est pas actif dans le build de production.

## Architecture

```
src/
├── app/                      # Assemblage de l'application
│   ├── auth/                 # AuthProvider (mock), RequireRole (garde par rôle)
│   ├── theme/                # Thème clair / sombre / système
│   ├── portals.ts            # ⭐ Registre des portails
│   ├── router.tsx            # Construit les routes à partir du registre
│   └── App.tsx
├── shared/                   # Commun à tous les portails
│   ├── ui/                   # Design system (shadcn/ui) : Button, Card, Badge, Tabs, Dialog…
│   ├── components/           # Composants transverses : Mascot, PageHeader, ProgressRing, Confetti, Toaster…
│   ├── layouts/PortalLayout  # Shell commun : sidebar, header, navigation mobile
│   ├── content/              # ⭐ Modèle de contenu SST + données de démo (thématiques, ressources, quiz…)
│   ├── api/                  # Services (ex. ChatService) — à brancher sur le back-end
│   ├── lib/utils.ts          # cn(), dates, shuffle…
│   └── types/                # Rôles, contrat PortalDefinition
├── portals/
│   ├── collaborateur/
│   │   ├── index.tsx         # PortalDefinition : navigation + routes
│   │   ├── pages/            # Une page = une rubrique
│   │   ├── components/       # Composants propres au portail
│   │   └── store/            # Progression, badges, missions, recommandations
│   ├── referent/             # Squelette
│   └── admin/                # Squelette
└── index.css                 # ⭐ Design tokens (couleurs, rayons, animations)
```

### Ajouter un portail ou une rubrique

1. **Rubrique** : créer la page dans `src/portals/<portail>/pages/`, puis l’ajouter dans
   `nav` et `routes` du fichier `src/portals/<portail>/index.tsx`. Le layout, la navigation desktop/mobile
   et le fil d’Ariane sont automatiques.
2. **Portail** : créer `src/portals/<id>/index.tsx` exportant un `PortalDefinition`
   (voir `src/shared/types/portal.ts`) et l’ajouter au tableau `PORTALS` de `src/app/portals.ts`.

### Identité visuelle — règles d’équipe

Charte **institutionnelle rouge et blanc** : rouge de marque (`primary`) pour les actions et repères,
surfaces blanches sur fond gris très clair, graphite (`inverse`, `accent`) pour les bandeaux contrastés,
gris neutres pour le reste. Pas d’emojis ni de dégradés décoratifs : icônes `lucide-react` uniquement.
Chaque thématique SST a une icône et un repère couleur discret (`THEMES[x].icon` / `.dot`), affichés via
`<ThemeBadge>` et `<ThemeIcon>`.

- Utiliser **uniquement les tokens** (`bg-primary`, `text-muted-foreground`, `bg-accent`, `text-xp`, `bg-success`…),
  jamais de couleur codée en dur dans une page. Les tokens clair/sombre sont définis dans `src/index.css`.
- Réutiliser `@/shared/ui` ; pour un nouveau composant shadcn : `npx shadcn@latest add <composant>`
  (le fichier `components.json` pointe déjà vers `src/shared/ui`).
- Chaque page commence par un `<PageHeader eyebrow title description />`.
- Icône et repère couleur des thématiques : `THEMES[x].icon` / `.dot` (`src/shared/content/themes.ts`).
- Sur mobile : barre de navigation basse (5 premières entrées de la `nav`), libellés courts via `short`.

### Animations (Motion)

Les réglages d'animation communs sont dans `src/shared/motion/` : ressorts (`spring`, `springBouncy`),
apparitions (`fadeUp`, `popIn`), `hoverLift`, et les composants `<Stagger>` / `<Reveal>` (apparition en cascade)
et `<AnimatedNumber>` (compteurs). Règles d'équipe :

- Utiliser ces réglages plutôt que des valeurs ad hoc, pour garder une identité de mouvement unique.
- Animer pour **signifier** (apparition, feedback, récompense), en restant court (≤ 450 ms hors ressorts).
- `MotionConfig reducedMotion="user"` (dans `App.tsx`) coupe les animations si l'utilisateur le demande au système.

Exemples dans l'espace collaborateur : indicateur de navigation qui glisse (`layoutId`), transitions de page,
flashcards **glissables** (droite = « Je sais », gauche = « À revoir ») empilées en paquet, questions de quiz
qui défilent, cœurs et combos animés, scores et XP qui comptent, grille de ressources qui se réorganise au filtrage,
marqueurs de la chasse aux risques à ressort, notifications empilées.

## Espace collaborateur — fonctionnalités

| Rubrique | Contenu | Piliers mobilisés (conception) |
|---|---|---|
| **Tableau de bord** | Niveau & XP, série de jours, missions du jour, « Recommandé pour vous » (prochaines étapes personnalisées), maîtrise par thématique, activité 14 j, contenus obligatoires, défi d’équipe, « Le saviez-vous ? » | tous |
| **Vidéos & ressources** | Vidéos, fiches, infographies, podcasts ; filtres (type, thématique, non consultées, favoris), recherche ; lecteur (média réel via `mediaUrl`, sinon aperçu simulé) ; résumé « À retenir » débloqué après lecture ; **check express** corrigé | attention, engagement, retour d’information |
| **Flashcards** | Répétition espacée (**système de Leitner**, 5 boîtes : 1-3-7-14-30 j), session du jour, paquets par thématique, carte 3D **glissable** (geste « swipe »), didacticiel des gestes et raccourcis affiché à la première session (rouvrable via « ? »), indice, auto-évaluation (À revoir / Hésitant / Je sais), combos, raccourcis clavier | consolidation, engagement |
| **Quiz & défis** | **Défi du jour** adaptatif (thématiques les plus faibles, XP ×2), **Défi chrono** (15 s, 3 vies, combos), **Entraînement** par thématique sans pression, **Chasse aux risques** (scène illustrée, 6 dangers à repérer + leurres) ; correction expliquée + lien vers la ressource ; écran « revoir mes erreurs » ; didacticiel affiché à la première partie (rouvrable via « ? », chrono en pause pendant sa lecture) | engagement, retour d’information, attention |
| **Prévi (chatbot)** | Assistant SST, idées de questions proposées directement dans le fil (renouvelées après chaque réponse), réponses sourcées renvoyant vers les ressources, retour utile / pas utile | engagement, retour d’information |
| **Trophées & niveaux** | 6 niveaux (Éveil → Ambassadeur·rice SST), 9 badges, statistiques personnelles | motivation |

### Les 4 piliers de l’apprentissage (S. Dehaene) — principes implicites

Les piliers guident la **conception** des rubriques ; ils ne sont **jamais nommés ni affichés** dans
l’interface collaborateur. Ils se traduisent par l’expérience :

- **Attention** — formats courts (≤ 5 min), un message à la fois, résumé « À retenir » après lecture.
- **Engagement actif** — l’utilisateur agit : quiz, chasse aux risques, check express, questions à Prévi.
- **Retour d’information** — chaque réponse est corrigée et expliquée immédiatement, avec un lien vers la ressource.
- **Consolidation** — répétition espacée des flashcards, missions du jour, séries de jours.

En coulisses, `src/portals/collaborateur/store/insights.ts` calcule des scores internes par pilier
pour ordonner les **prochaines étapes** du tableau de bord (« Réviser 8 cartes », « S’entraîner :
Risque routier »…). Ces scores pourront alimenter les statistiques du portail référent.
**Règle d’équipe :** ne pas introduire de libellé « pilier » ou de jargon pédagogique dans l’interface
collaborateur ; exprimer le principe par la fonctionnalité elle-même.

### Gamification (paramétrable)

Barème d’XP : `XP` dans `src/shared/content/gamification.ts` · Niveaux : `LEVELS` ·
Badges : `store/badges.ts` · Missions quotidiennes : `store/missions.ts`.

## Brancher le back-end (prochaines étapes)

- **Authentification** : remplacer `MOCK_USERS` / `AuthProvider` par le SSO de l’entreprise ; le rôle pilote l’accès aux portails.
- **Contenus** : remplacer les constantes de `src/shared/content/*` par des appels API (idéalement via TanStack Query) ; les types sont déjà définis (`types.ts`).
- **Progression** : le store Zustand expose des actions métier (`recordQuiz`, `reviewCard`, `markResourceViewed`…) ; les synchroniser avec l’API.
- **Chatbot** : implémenter `ChatService` (`src/shared/api/chat.ts`) sur un LLM + RAG limité aux contenus validés QHSE.
- **Médias** : renseigner `mediaUrl` sur les ressources pour lire les vraies vidéos/podcasts.

> ⚠️ Les contenus SST fournis sont des exemples rédigés pour la démo : ils doivent être relus et validés par l’équipe QHSE avant mise en production.
