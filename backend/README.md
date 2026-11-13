# Backend (à venir)

Emplacement réservé au backend d'Acculturator, prévu en **Python avec FastAPI**. Le frontend
n'impose que le **contrat d'API** décrit dans [`docs/api-contract.md`](../docs/api-contract.md).

## Points d'attention

- **Contrats** : les types attendus par le frontend sont dans `frontend/packages/contracts`
  (`@acculturator/contracts`). Les traduire une fois en modèles Pydantic ; ensuite, ces modèles
  font foi et les types TypeScript sont générés à partir du schéma OpenAPI publié par FastAPI
  (`/openapi.json`), par exemple avec `openapi-typescript` (voir « Contrats et backend FastAPI »
  dans [`docs/architecture.md`](../docs/architecture.md)). Les unions comme `LearningEvent`
  (champ `type`) correspondent aux unions discriminées de Pydantic.
- **Authentification** : SSO de l'entreprise, session par cookie ; `GET /api/me` renvoie
  l'utilisateur et son rôle (`collaborateur`, `referent`, `admin`). Les droits sont vérifiés côté
  serveur, le frontend ne fait que masquer les portails non autorisés.
- **Contenus** : le catalogue doit être relu et validé par l'équipe QHSE ; les contenus actuels
  (`mock-server/src/data/sst/` pour le parcours SST) sont des exemples rédigés pour la démo et
  peuvent servir de jeu d'amorçage.
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

En développement, Vite relaie `/api` vers `http://localhost:3000` (le mock-server en mode Node).
FastAPI (uvicorn) écoute par défaut sur le port 8000 : lancer le frontend avec

```bash
VITE_API_PROXY_TARGET=http://localhost:8000 npm run dev
```

Les routes FastAPI doivent alors être servies sous le préfixe `/api` (ex. `APIRouter(prefix="/api")`).
