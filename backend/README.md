# Backend (Nakama + PostgreSQL)

Backend securise via `docker-compose.yml` a la racine.

## Module economie Nakama

Le runtime serveur autoritaire est fourni dans:

- `backend/nakama/data/modules/hyperstructure_economy.js` (runtime execute par Nakama)
- `backend/nakama/data/modules/hyperstructure_economy.ts` (source TypeScript documente)

RPC disponibles:

- `economy_get_state`
- `economy_start_building`
- `economy_cancel`
- `economy_apply_boost`
- `economy_finish_with_credits`
- `economy_debug_seed`
- `getInventory`
- `useItem`

### Inventaire serveur autoritaire

- Collection storage: `hyperstructure`
- Key storage: `inventory_state_v1`
- Items Time Rift disponibles:
  - `TIME_RIFT_60`
  - `TIME_RIFT_300`
  - `TIME_RIFT_3600`
  - `TIME_RIFT_43200`

### Tests inventaire (Node local)

```bash
node backend/tests/hyperstructure_inventory.tests.js
```

## Demarrage

```bash
docker compose up -d
```

## Services exposes

- Nakama API: `http://localhost:7350`
- PostgreSQL: non expose (interne Docker)
- Nakama Console: non exposee (interne Docker)

## Variables d'environnement

Copie `.env.example` vers `.env` puis remplace toutes les valeurs `CHANGE_ME_*`.

## Arret

```bash
docker compose down
```
