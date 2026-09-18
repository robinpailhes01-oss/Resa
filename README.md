# Reso — landing page et liste d'attente

Landing page française de **Reso**, solution de réservation pour les professionnels de la beauté et du bien-être. Une seule offre, un prix affiché dès le premier écran, un formulaire de préinscription relié à une base avec double confirmation par email.

Ce dépôt couvre l'étape 1 du produit (cahier des charges « Landing page », v1.0). Le mode par défaut est **pré-lancement** : aucun essai ni connexion fictifs.

## Stack

- Next.js 16 (App Router, rendu serveur, `proxy.ts` pour la CSP) · React 19 · TypeScript
- Tailwind CSS 4 (tokens dans `src/app/globals.css`)
- PostgreSQL via `postgres` (Supabase, Neon…) ; fichier JSON local en développement
- Emails via Resend (API HTTP, sans SDK) ; sortie console en développement
- Tests : Vitest (domaine serveur) · Playwright (captures de recette)

## Démarrer

```bash
npm install
cp .env.example .env.local   # ajuster si besoin
npm run dev                  # http://localhost:3000
```

Sans `DATABASE_URL`, les demandes sont écrites dans `.data/waitlist.json` et les emails sont affichés dans le terminal (le lien de confirmation y figure).

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run lint` · `npm run typecheck` · `npm test` | Qualité (regroupées dans `npm run check`) |
| `npm run screenshots` | Captures aux 6 largeurs de référence + contrôle du scroll horizontal (serveur lancé) |
| `node scripts/og-image.mjs` | Régénère `src/app/opengraph-image.png` |

## Organisation du code

```
src/config/offer.ts        configuration commerciale (source unique : prix, mode, limites, URLs)
src/content/fr/landing.ts  tous les textes, variantes pré-lancement / live, données fictives des aperçus
src/app/globals.css        tokens visuels (couleurs, typographie, rayons, ombre)
src/components/ui          Button, Input/Select, StatusMessage, Logo, Section
src/components/previews    aperçus produit en HTML (agenda, réservation, emails) — aucune image de texte
src/components/landing     sections de la page, header, formulaire
src/server/waitlist        contrat (schema), service, stores (mémoire, fichier, PostgreSQL), jetons
src/server/email           adaptateurs (console, Resend) et gabarit de l'email de confirmation
src/app/api/waitlist       POST /api/waitlist, /confirm, /unsubscribe
src/app/api/internal       rejeu des emails et purge (protégés par secret)
db/migrations              schéma SQL
tests                      tests unitaires du domaine
```

## Configuration commerciale

Toutes les valeurs affichées (prix, nombre de praticiens, CTA, métadonnées) dérivent de `src/config/offer.ts`, alimenté par les variables `RESO_*` (voir `.env.example`).

- **Changer le prix** : `RESO_MONTHLY_PRICE_EX_VAT=39` puis rebuild. Le format français avec espaces insécables est appliqué partout.
- **Passer en mode live** : `RESO_LAUNCH_MODE=live` **et** `RESO_SIGNUP_URL=https://…` (URL réelle). Sans URL, le build échoue volontairement. `RESO_LOGIN_URL` affiche le lien Connexion ; `RESO_TRIAL_DAYS` ne doit être renseigné qu'une fois l'essai validé. En live, le formulaire est remplacé par un bloc CTA et les textes (FAQ, mentions) basculent.
- **Pages légales** : `RESO_LEGAL_ENTITY`, `RESO_HOSTING_PROVIDER`, `RESO_SUPPORT_EMAIL`, `RESO_PUBLICATION_DIRECTOR`. Tant qu'elles manquent, les pages affichent un bandeau « préproduction » et n'inventent rien.
- **Indexation** : `RESO_INDEXABLE=true` uniquement en production validée (sinon `noindex` et `robots.txt` bloquant).

## Formulaire et contrat technique

`POST /api/waitlist` (JSON, 8 Ko max, origine vérifiée) → `202 {status:"accepted"}` y compris pour un doublon ; `422` champs invalides ; `429` limitation ; `503` base indisponible. Le formulaire fonctionne aussi sans JavaScript (POST classique puis redirection `/?inscription=ok`).

Flux : demande + tâche email dans une même transaction → envoi après la réponse (`after()`) avec jeton aléatoire stocké haché (48 h, usage unique) → `GET /confirmer-inscription?token=…` affiche un bouton → `POST /api/waitlist/confirm` consomme le jeton → jeton de désinscription distinct créé pour `/desinscription`.

Anti-abus : validation Zod stricte (champs inattendus rejetés), champ piège, 5 tentatives / 15 min par IP, 3 emails / heure par adresse, clé d'idempotence pour les réessais navigateur. Aucun email ni jeton dans les journaux.

## Base de données

Appliquer `db/migrations/0001_waitlist.sql` (Supabase : éditeur SQL ou `supabase db push`). Renseigner `DATABASE_URL` (pooler en mode transaction accepté : `prepare: false`).

## Exploitation

- **Rejeu des emails en échec** : `POST /api/internal/email-tasks` avec `Authorization: Bearer $INTERNAL_TASKS_SECRET` (cron toutes les 5 à 15 min). Backoff 1 min → 5 min → 30 min → 2 h, alerte après 5 échecs (`ALERT_WEBHOOK_URL`).
- **Purge** : `POST /api/internal/purge` (cron quotidien) — 7 jours pour les demandes non confirmées, 12 mois pour la liste confirmée (`WAITLIST_*_RETENTION_*`, propositions à valider).
- **Sécurité** : CSP avec nonce (`src/proxy.ts`), `X-Frame-Options: DENY`, `Referrer-Policy` stricte (`no-referrer` sur les pages à jeton), HSTS en production, `poweredByHeader` désactivé.
- **Emails** : configurer SPF, DKIM et DMARC sur le domaine d'`EMAIL_FROM` avant tout envoi réel.

## Recette

Voir `docs/recette.md` pour l'état des critères F01 à F15 et la matrice de captures.

## Décisions à obtenir avant publication publique

Domaine et marque vérifiés · identité légale, hébergeur et contact · prix et conditions confirmés · infrastructure base + email choisie · durées de conservation validées · relecture des contenus.
