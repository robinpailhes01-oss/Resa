@AGENTS.md

# Reso

- Contenus : `src/content/fr/landing.ts` (jamais de texte en dur dans les composants).
- Configuration commerciale : `src/config/offer.ts` (prix, mode, URLs) — aucun montant en dur ailleurs.
- Avant de pousser : `npm run check` (lint, typecheck, tests).
- Base : `DATABASE_URL` + `npm run db:migrate` (migrations dans `db/migrations`, jamais modifier une migration déjà poussée : en ajouter une nouvelle).
- Application : domaine dans `src/server/app`, actions serveur dans `src/server/app/actions`, aucune requête SQL dans les composants.
- Vidéos (Reels, montages face caméra + app, HyperFrames) : commencer par le skill `reso-video` ; projets dans `videos/<nn-slug>/` (médias lourds non versionnés).
