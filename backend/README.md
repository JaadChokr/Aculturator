# Backend (à venir)

Emplacement réservé au backend d'Acculturator. La stack est au choix de l'équipe (Node/NestJS,
Java/Spring, .NET…) ; le frontend n'impose que le **contrat d'API** décrit dans
[`docs/api-contract.md`](../docs/api-contract.md).

## Points d'attention

- **Contrats partagés** : les types échangés sont dans `packages/contracts`
  (`@acculturator/contracts`). Un backend TypeScript peut l'ajouter comme workspace
  (`"workspaces": ["packages/*", "frontend/*", "backend"]` dans le `package.json` racine) et
  l'importer directement ; sinon, reproduire ces types à l'identique.
- **Authentification** : SSO de l'entreprise, session par cookie ; `GET /api/me` renvoie
  l'utilisateur et son rôle (`collaborateur`, `referent`, `admin`). Les droits sont vérifiés côté
  serveur, le frontend ne fait que masquer les portails non autorisés.
- **Contenus** : le catalogue doit être relu et validé par l'équipe QHSE ; les contenus actuels
  (`mock-server/src/data/`) sont des exemples rédigés pour la démo et peuvent servir de
  jeu d'amorçage.
- **Assistant** : réponses limitées aux contenus validés (RAG), avec liens vers les ressources.
- **Implémentation de référence** : `mock-server/src/routes.ts` répond déjà à chaque endpoint
  (avec des données d'exemple) ; c'est le comportement attendu, à reproduire avec une vraie base,
  le SSO et les règles de droits.

## Brancher le frontend

```bash
# frontend/shell/.env.development.local
VITE_MOCK_SERVER=false
# VITE_API_URL=/api   (défaut ; en dev, Vite relaie /api vers http://localhost:3000)
```

Le port cible du proxy de dev se règle dans `frontend/shell/vite.config.ts`.
