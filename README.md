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
- **lucide-react** (icônes), police **Plus Jakarta Sans** (embarquée)

## Démarrer

```bash
npm install
npm run dev          # http://localhost:5173 (sélecteur de profil de démo activé)
npm run build        # build de production → dist/
npm run build:demo   # build statique autonome (routeur en mémoire, chemins relatifs) → dist-demo/
npm run lint && npm run typecheck
npm run format       # Prettier
```

En développement, le menu utilisateur (en bas de la barre latérale) permet de **changer de profil**
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
│   │   └── store/            # Progression, badges, missions, indicateurs des 4 piliers
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

- Utiliser **uniquement les tokens** (`bg-primary`, `text-muted-foreground`, `bg-accent`, `text-xp`, `bg-success`…),
  jamais de couleur codée en dur dans une page. Les tokens clair/sombre sont définis dans `src/index.css`.
- Réutiliser `@/shared/ui` ; pour un nouveau composant shadcn : `npx shadcn@latest add <composant>`
  (le fichier `components.json` pointe déjà vers `src/shared/ui`).
- Chaque page commence par un `<PageHeader eyebrow title description />`.
- Couleurs des thématiques SST : `THEMES[x].tone` (`src/shared/content/themes.ts`).
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

| Rubrique | Contenu | Piliers mobilisés |
|---|---|---|
| **Tableau de bord** | Niveau & XP, série de jours, missions du jour, indicateurs des 4 piliers + levier de progression conseillé, maîtrise par thématique, activité 14 j, contenus obligatoires, défi d’équipe, « Le saviez-vous ? » | tous |
| **Vidéos & ressources** | Vidéos, fiches, infographies, podcasts ; filtres (type, thématique, non consultées, favoris), recherche ; lecteur (média réel via `mediaUrl`, sinon aperçu simulé) ; résumé « À retenir » débloqué après lecture ; **check express** corrigé | attention, engagement, retour d’information |
| **Flashcards** | Répétition espacée (**système de Leitner**, 5 boîtes : 1-3-7-14-30 j), session du jour, paquets par thématique, carte 3D **glissable** (geste « swipe »), indice, auto-évaluation (À revoir / Hésitant / Je sais), combos, raccourcis clavier | consolidation, engagement |
| **Quiz & défis** | **Défi du jour** adaptatif (thématiques les plus faibles, XP ×2), **Défi chrono** (15 s, 3 vies, combos), **Entraînement** par thématique sans pression, **Chasse aux risques** (scène illustrée, 6 dangers à repérer + leurres) ; correction expliquée + lien vers la ressource ; écran « revoir mes erreurs » | engagement, retour d’information, attention |
| **Prévi (chatbot)** | Assistant SST avec suggestions, réponses sourcées renvoyant vers les ressources, retour 👍/👎, encart urgences (15/18/112/114) | engagement, retour d’information |
| **Trophées & niveaux** | 6 niveaux (Éveil → Ambassadeur·rice SST), 9 badges, statistiques personnelles | motivation |

### Les 4 piliers de l’apprentissage (S. Dehaene)

Chaque activité est étiquetée par les piliers qu’elle mobilise (`<PillarTags />`) et le tableau de bord
calcule un score par pilier (`src/portals/collaborateur/store/insights.ts`) :

- **Attention** — formats ≤ 5 min, une idée à la fois, part de ressources suivies.
- **Engagement actif** — répondre, chercher, questionner : volume d’interactions.
- **Retour d’information** — correction immédiate et expliquée : taux de bonnes réponses.
- **Consolidation** — répétition espacée et régularité : cartes ancrées (boîte ≥ 3) + série de jours.

Le pilier le plus faible donne un **levier de progression** avec une action concrète.

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
