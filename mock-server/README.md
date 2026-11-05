# mock-server — faux backend de démonstration

Ce paquet **n'appartient pas au frontend**. Il joue le rôle du backend tant que celui-ci n'existe
pas : il répond aux endpoints de [`docs/api-contract.md`](../docs/api-contract.md) avec des données
d'exemple (contenus SST, comptes de démo, notifications, assistant par mots-clés).

Le frontend ne sait pas qu'il lui parle : il envoie ses requêtes HTTP vers `/api`, comme il le fera
avec le vrai backend.

```
src/
├── routes.ts    Les routes (une Request → une Response) : implémentation de référence du contrat
├── chat.ts      Assistant de démo (recherche par mots-clés)
├── store.ts     État de démo : profil courant, notifications lues
├── data/        Données d'exemple (à relire par l'équipe QHSE avant tout usage réel)
├── browser.ts   Mode navigateur : intercepte fetch('/api/…') et répond localement
└── node.ts      Mode serveur : expose les mêmes routes sur http://localhost:3000/api
```

## Deux façons de le lancer

| Mode             | Quand                                                                     | Comment                                                                                           |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Navigateur**   | `npm run dev` et la démo statique : aucun serveur à lancer                | `VITE_MOCK_SERVER=true` (déjà dans `.env.development` et `.env.demo`)                             |
| **Serveur Node** | Voir les vraies requêtes réseau, tester le frontend comme avec le backend | `npm run mock-server`, puis `VITE_MOCK_SERVER=false` dans `frontend/shell/.env.development.local` |

Le mode Node utilise Node ≥ 22.18 (exécution directe du TypeScript, d'où les imports en `.ts`).

## Règles

- Ne dépend que de `@acculturator/contracts` (vérifié par ESLint) : un endpoint qui change de forme
  casse la compilation ici comme dans le frontend.
- Seul le shell l'importe, uniquement si `VITE_MOCK_SERVER=true` : il **n'est pas inclus** dans le
  build de production.
- Ajouter un endpoint au contrat = ajouter sa route dans `routes.ts`.
- `POST /demo/role` (changement de profil) est propre à la démo et ne fait pas partie du contrat.
