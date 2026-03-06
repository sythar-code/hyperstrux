# Hyperstructure Game

Structure separee frontend/backend avec stack securisee Nakama + PostgreSQL.

- `backend/`: docs + volumes de persistance
- `frontend/`: client navigateur (Vite + TypeScript + Nakama JS)
- `docker-compose.yml`: services backend securises

## Prerequis

- Docker Desktop
- Node.js 20+
- npm 10+

## 1) Configurer les secrets

Depuis la racine du projet:

```bash
cp .env.example .env
```

Ensuite, modifie `.env` avec des secrets forts.

## 2) Lancer le backend (Nakama + Postgres)

```bash
docker compose up -d
```

Par defaut, seul l'API Nakama est exposee:
- API Nakama: `http://localhost:7350`

## 3) Lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes securite

- PostgreSQL n'est pas expose au host.
- La console Nakama n'est pas exposee au host.
- Secrets et credentials externalises dans `.env`.
- Conteneurs durcis (`no-new-privileges`, capacites Linux supprimees).

## Checklist pre-production

- Regenerer tous les secrets `.env` (server/session/refresh/console/runtime).
- Si des logs ont deja affiche les secrets, les considerer compromis et les regenerer avant ouverture publique.
- Laisser `NAKAMA_BIND_ADDR=127.0.0.1` et publier via reverse proxy HTTPS (Nginx/Caddy/Traefik).
- Activer TLS en frontal et forcer HTTPS.
- Verifier que le module runtime est a jour (pas d'endpoint debug actif).
- Creer une base propre (sans donnees de test) avant ouverture publique.
