@AGENTS.md

# Reso

- Contenus : `src/content/fr/landing.ts` (jamais de texte en dur dans les composants).
- Configuration commerciale : `src/config/offer.ts` (prix, mode, URLs) — aucun montant en dur ailleurs.
- Avant de pousser : `npm run check` (lint, typecheck, tests).
- Base : `DATABASE_URL` + `npm run db:migrate` (migrations dans `db/migrations`, jamais modifier une migration déjà poussée : en ajouter une nouvelle).
- Application : domaine dans `src/server/app`, actions serveur dans `src/server/app/actions`, aucune requête SQL dans les composants.

# Acquisition payante (pubs, tracking, parcours client)

- Avant toute tâche pub, tracking ou parcours : lire `ads/pilotage/regles.md` (validation de Robin avant toute action ou dépense), puis `journal.md` (tests, décisions, enseignements), `budget.md`, `definitions.md`, `plan-de-mesure.md`, `tracking.md`.
- Équipe : agents `.claude/agents/reso-*.md` ; skills `reso-nouveau-test`, `reso-rapport-test`, `reso-analyse-parcours`.
- Mesure : `src/server/acquisition` (étapes, parcours, rapport Telegram quotidien) ; abonnements Reso = `payments`, jamais `booking_payments`.
- Après chaque décision ou résultat : compléter `ads/pilotage/journal.md`.
