# Hyperstrux Admin

Back-office separÃ© du jeu principal.

## Fonctions disponibles

- Authentification via Nakama
- Verification serveur du role admin
- Bootstrap initial du premier superadmin si aucun admin n'existe encore et si le compte connecte est `Heimy`
- Recherche et inspection des utilisateurs
- Envoi d'un message systeme global dans l'inbox
- Envoi de cadeaux inbox a un joueur ou a tous les joueurs

## Demarrage local

```bash
cd admin
npm install
npm run dev
```

## Build

```bash
cd admin
npm run build
```

## Variables d'environnement

Voir `.env.example`.

## Notes de securite

- Le frontend admin n'accorde aucun droit par lui-meme.
- Toutes les actions sensibles passent par des RPC `admin_*` proteges cote Nakama.
- Chaque action sensible ecrit une entree d'audit cote serveur.
- Le bootstrap initial ne doit servir qu'une seule fois pour creer le premier superadmin.
- En production, il est recommande de servir cette app sur un domaine ou sous-domaine separe et de la proteger en plus via nginx/IP allowlist.
