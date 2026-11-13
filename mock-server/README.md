# mock-server — faux backend de démonstration

Ce paquet **n'appartient pas au frontend**. Il joue le rôle du backend tant que celui-ci n'existe
pas : il répond aux endpoints de [`docs/api-contract.md`](../docs/api-contract.md) avec des données
d'exemple (contenus de chaque parcours, comptes de démo, notifications, assistant par mots-clés).

Le frontend ne sait pas qu'il lui parle : il envoie ses requêtes HTTP vers `/api`, comme il le fera
avec le vrai backend.

```
src/
├── routes.ts    Les routes (une Request → une Response) : implémentation de référence du contrat
├── chat.ts      Assistant de démo (recherche par mots-clés)
├── store.ts     État de démo : profil courant, notifications lues
├── data/        Données d'exemple (à relire par l'équipe QHSE avant tout usage réel)
│   ├── parcours.ts      Parcours servis, dans l'ordre de la page de choix
│   ├── types.ts         Forme du contenu d'un parcours (ParcoursContent)
│   ├── sst/             Parcours SST : fiche, catalogue, assistant
│   ├── users.ts         Comptes de démo (un par rôle)
│   └── notifications.ts Notifications de démo par rôle
├── browser.ts   Mode navigateur : intercepte fetch('/api/…') et répond localement
└── node.ts      Mode serveur : expose les mêmes routes sur http://localhost:3000/api
```

## Deux façons de le lancer

| Mode             | Quand                                                                     | Comment                                                                                           |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Navigateur**   | `npm run dev` et la démo statique : aucun serveur à lancer                | `VITE_MOCK_SERVER=true` (déjà dans `.env.development` et `.env.demo`)                             |
| **Serveur Node** | Voir les vraies requêtes réseau, tester le frontend comme avec le backend | `npm run mock-server`, puis `VITE_MOCK_SERVER=false` dans `frontend/shell/.env.development.local` |

Le mode Node utilise Node ≥ 22.18 (exécution directe du TypeScript, d'où les imports en `.ts`).

## Ajouter un parcours de démo

Chaque parcours a son dossier `src/data/<id>/`. Partir d'une copie de `src/data/sst/` :

| Fichier                   | Contenu                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `index.ts`                | **Fiche du parcours** (titre, description, statut, `activities`, `branding`) et assemblage du catalogue |
| `themes.ts`               | Thématiques : titre, libellé court, description, clés d'icône et de couleur                             |
| `resources.ts`            | Ressources (vidéos, fiches, infographies, podcasts), points clés, check express                         |
| `flashcards.ts`           | Flashcards, rattachées à une thématique                                                                 |
| `quiz.ts`                 | Questions de quiz, avec leur niveau (1 découverte, 2 confirmé, 3 expert)                                |
| `hazards.ts` et `scenes/` | Scènes de chasse aux risques : illustration, dangers et leurres placés dans son repère                  |
| `modules.ts`              | Modules (facultatif : retirer `modules` du catalogue pour un parcours sans modules)                     |
| `assistant.ts`            | Assistant : réponses de référence (mots-clés), idées de questions, réponse par défaut                   |

Puis ajouter le parcours à la liste `CONTENTS` de `src/data/parcours.ts`. C'est tout : les chiffres
de la carte (`stats`) sont calculés à partir du catalogue, et les routes `/parcours/<id>/…`
servent le catalogue et l'assistant de ce parcours. Une activité absente de `activities` (ou sans
contenu, ex. aucune scène) est masquée dans les portails. `npm run typecheck` vérifie chaque champ
grâce aux types de `@acculturator/contracts`.

Les clés d'icône et de couleur disponibles sont dans
`frontend/packages/design-system/src/themes/index.ts`. Pour une illustration de scène, un SVG peut être
embarqué comme celui de l'open space (`svgDataUri`) ; un vrai backend servira plutôt une URL.

## Règles

- Ne dépend que de `@acculturator/contracts` (vérifié par ESLint) : un endpoint qui change de forme
  casse la compilation ici comme dans le frontend.
- Seul le shell l'importe, uniquement si `VITE_MOCK_SERVER=true` : il **n'est pas inclus** dans le
  build de production.
- Ajouter un endpoint au contrat = ajouter sa route dans `routes.ts`.
- `POST /demo/role` (changement de profil) est propre à la démo et ne fait pas partie du contrat.
