# Reso — réservation en ligne pour les pros de la beauté

**Reso** : une seule offre, un agenda clair, des rendez-vous pris en ligne 24h/24 et des emails automatiques. Ce dépôt contient :

- la **landing page** et sa liste d'attente (double confirmation par email) ;
- l'**application** : création de compte, établissement, prestations, équipe (jusqu'à 3 praticiens), horaires, agenda, prise de rendez-vous manuelle, **page de réservation publique** `/r/<slug>`, espace client `/rdv/<jeton>` (annulation en ligne) et emails automatiques (confirmation, notification pro, rappel, demande d'avis, annulation).

Les paiements de l'abonnement ne sont pas encore branchés : tout compte créé utilise l'application sans restriction.

## Stack

- Next.js 16 (App Router, rendu serveur, `proxy.ts` pour la CSP) · React 19 · TypeScript
- Tailwind CSS 4 (tokens dans `src/app/globals.css`)
- PostgreSQL via `postgres` (Supabase, Neon, serveur local…) ; migrations SQL dans `db/migrations`
- Authentification maison : mots de passe scrypt, sessions en base (cookie `httpOnly`), jetons hachés
- Emails via Resend (API HTTP, sans SDK) ; sortie console en développement
- Tests : Vitest (domaine serveur + intégration PostgreSQL) · Playwright (captures et recette de bout en bout)

## Démarrer

```bash
npm install
cp .env.example .env.local   # renseigner DATABASE_URL (PostgreSQL 14+)
npm run db:migrate           # applique db/migrations/*.sql une seule fois chacune
npm run dev                  # http://localhost:3000
```

Puis créer un compte sur `/inscription` : l'application guide vers la création de l'établissement, les prestations, les horaires et l'équipe. La page de réservation publique est indiquée dans **Paramètres**.

Sans `DATABASE_URL`, seule la landing fonctionne : les demandes vont dans `.data/waitlist.json` et les emails sont affichés dans le terminal (le lien de confirmation y figure). Avec `EMAIL_PROVIDER=console`, tous les emails (vérification de compte, confirmations de rendez-vous…) sont écrits dans le journal serveur.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run lint` · `npm run typecheck` · `npm test` | Qualité (regroupées dans `npm run check`) |
| `npm run db:migrate` | Applique les migrations SQL (`DATABASE_URL` requis) |
| `npm run screenshots` | Captures de la landing aux 7 largeurs de référence + contrôle du scroll horizontal (serveur lancé) ; `--docs` régénère `docs/previews/` |
| `node scripts/recette-landing.mjs` | Recette fonctionnelle de la landing : navigation, menu mobile, CTA, préinscription avec et sans JavaScript, mouvement réduit |
| `node scripts/recette-parcours.mjs` | Parcours complet d'un établissement en mode live : landing → inscription → vérification d'email → onboarding → réservation cliente → mot de passe oublié → reconnexion (serveur lancé avec `RESO_LAUNCH_MODE=live`) |
| `node scripts/recette-app.mjs` | Recette de bout en bout de l'application avec Playwright (compte → établissement → réservation publique → annulation) |
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
src/server/db.ts           connexion PostgreSQL partagée (postgres.js, prepare: false)
src/server/auth            mots de passe, sessions, gardes (requireUser / requireEstablishment), actions serveur
src/server/app             domaine de l'application : établissements, praticiens, horaires, prestations,
                           clients, disponibilités (computeSlots), rendez-vous, notifications (file d'emails)
src/server/app/actions     actions serveur des formulaires (validation Zod)
src/lib/time.ts            fuseaux horaires sans dépendance, formats français
src/app/(auth)             /inscription, /connexion, /mot-de-passe-oublie, /reinitialiser
src/app/app                espace pro : agenda, clients, prestations, équipe, emails, paramètres
src/app/r/[slug]           page de réservation publique (4 étapes, sans JavaScript obligatoire)
src/app/rdv/[token]        espace client d'un rendez-vous (détail, annulation)
src/components/app         composants de l'espace pro (formulaires, agenda jour, coquille)
src/components/booking     coquille de la page de réservation
src/app/api/waitlist       POST /api/waitlist, /confirm, /unsubscribe
src/app/api/internal       emails de rendez-vous, rejeu liste d'attente, purge (protégés par secret)
db/migrations              schéma SQL (0001 liste d'attente, 0002 application, 0003 conditions et index)
tests                      tests unitaires et d'intégration
```

## Configuration commerciale

Toutes les valeurs affichées (prix, nombre de praticiens, CTA, métadonnées) dérivent de `src/config/offer.ts`, alimenté par les variables `RESO_*` (voir `.env.example`).

- **Changer le prix** : `RESO_MONTHLY_PRICE_EX_VAT=39` puis rebuild. Le format français avec espaces insécables est appliqué partout.
- **Passer en mode live** : `RESO_LAUNCH_MODE=live`. Les CTA deviennent « Créer mon compte » vers `/inscription`, le lien Connexion vers `/connexion` (surchargeables par `RESO_SIGNUP_URL` et `RESO_LOGIN_URL`, chemins internes ou URLs HTTPS), le formulaire d'attente est remplacé par un bloc CTA et les textes (FAQ, mentions) basculent. `RESO_TRIAL_DAYS` ne doit être renseigné qu'une fois l'essai validé. L'application elle-même (`/inscription`, `/app`, `/r/<slug>`) fonctionne dans les deux modes, avec une base de données.
- **Pages légales** : `RESO_LEGAL_ENTITY`, `RESO_HOSTING_PROVIDER`, `RESO_SUPPORT_EMAIL`, `RESO_PUBLICATION_DIRECTOR`. Tant qu'elles manquent, les pages affichent un bandeau « préproduction » et n'inventent rien.
- **Indexation** : `RESO_INDEXABLE=true` uniquement en production validée (sinon `noindex` et `robots.txt` bloquant).

## Formulaire et contrat technique

`POST /api/waitlist` (JSON, 8 Ko max, origine vérifiée) → `202 {status:"accepted"}` y compris pour un doublon ; `422` champs invalides ; `429` limitation ; `503` base indisponible. Le formulaire fonctionne aussi sans JavaScript (POST classique puis redirection `/?inscription=ok`).

Flux : demande + tâche email dans une même transaction → envoi après la réponse (`after()`) avec jeton aléatoire stocké haché (48 h, usage unique) → `GET /confirmer-inscription?token=…` affiche un bouton → `POST /api/waitlist/confirm` consomme le jeton → jeton de désinscription distinct créé pour `/desinscription`.

Anti-abus : validation Zod stricte (champs inattendus rejetés), champ piège, 5 tentatives / 15 min par IP, 3 emails / heure par adresse, clé d'idempotence pour les réessais navigateur. Aucun email ni jeton dans les journaux.

## Application

- **Comptes** : inscription email + mot de passe (scrypt), email de vérification, réinitialisation par jeton haché (usage unique, 1 h), changement de mot de passe depuis Paramètres (révoque les autres sessions). Session de 30 jours glissants dans un cookie `httpOnly` ; le jeton n'est stocké qu'haché.
- **Tableau de bord** (`/app`) : rendez-vous du jour, puis sur la période choisie (mois en cours, mois dernier, 30 jours) : nombre de rendez-vous et part en ligne, chiffre d'affaires réalisé et à venir, taux de remplissage (minutes réservées / minutes d'ouverture des praticiens actifs), annulations et absences, nouvelles clientes, rendez-vous par jour, prestations les plus demandées, activité par praticien. Calculs purs dans `src/lib/stats.ts` (testés), requêtes dans `src/server/app/stats.ts`.
- **Établissement** : un par compte, identifiant d'URL généré depuis le nom, horaires hebdomadaires (jusqu'à deux plages par jour), horaires propres à un praticien possibles, règles de réservation (pas des créneaux, délai minimal, horizon, délai d'annulation), conditions de réservation libres (affichées avant confirmation, sur la page du rendez-vous et dans l'email de confirmation), mise en pause de la réservation en ligne. Tout est modifiable par l'établissement dans Paramètres.
- **Rendez-vous** : les créneaux sont calculés par `computeSlots` (fonction pure testée) à partir des horaires, des rendez-vous existants et du tampon de la prestation. En base, une contrainte d'exclusion (`bookings_no_overlap`, GiST) rend le double-booking impossible même sous concurrence : une insertion en conflit renvoie « Ce créneau vient d'être réservé ».
- **Réservation publique** `/r/<slug>` : prestation → praticien et créneau → coordonnées → confirmation. Champ piège, limitation par IP, pas de compte client. Le client reçoit un lien `/rdv/<jeton>` pour voir et annuler (tant que le délai d'annulation le permet).
- **Emails automatiques** (table `email_jobs`) : confirmation à la cliente, notification à l'établissement à chaque réservation et annulation en ligne (vers son email de contact, sinon l'adresse de connexion), rappel N heures avant, demande d'avis N heures après, annulation par le pro. Les emails clientes partent au nom de l'établissement (« Maison Alba via Reso », adresse d'`EMAIL_FROM`, Reply-To vers l'email de contact). Les envois immédiats partent après la réponse (`after()`), les envois différés par le cron `/api/internal/email-jobs`. Réglables dans **Emails automatiques**.
- **Limites v1** : un seul compte par établissement (pas d'invitation d'équipe), pas de SMS, pas de paiement en ligne ni d'abonnement (à venir), limitation de débit en mémoire (par instance).

## Base de données

Renseigner `DATABASE_URL` (pooler en mode transaction accepté : `prepare: false`) puis `npm run db:migrate`. Le script applique `db/migrations/*.sql` dans l'ordre et mémorise ceux déjà passés (`schema_migrations`) : il est sûr de le relancer à chaque déploiement. `npm run build` l'exécute automatiquement quand `DATABASE_URL` est défini (sur Vercel : variable présente à l'étape de build), sinon il l'ignore avec un avertissement.

Déploiement Vercel, variables minimales : `DATABASE_URL` (Supabase → Connect → Transaction pooler, port 6543) ou, plus simple, l'intégration Supabase du marketplace Vercel qui injecte `POSTGRES_URL` (acceptée telle quelle) ; `RESO_SITE_URL` (`https://votre-domaine`) ; `INTERNAL_TASKS_SECRET` (chaîne aléatoire) ; `RESO_LAUNCH_MODE=live` pour ouvrir les inscriptions. Sans `RESEND_API_KEY` + `EMAIL_FROM`, l'application fonctionne mais aucun email ne part (inscription et réservations restent possibles).

Extensions requises : `citext` et `btree_gist` (créées par la migration ; disponibles sur Supabase, Neon et PostgreSQL standard). Le RLS est activé sur toutes les tables : l'application accède à la base avec un rôle propriétaire (ou `bypassrls`), jamais depuis le navigateur.

Développement sans Docker : un PostgreSQL local suffit (`initdb`, `pg_ctl start`, `createdb reso`, puis `DATABASE_URL=postgres://…/reso npm run db:migrate`). Une base `reso_test` migrée et `TEST_DATABASE_URL` activent les tests d'intégration.

## Exploitation

- **Emails de rendez-vous** : `POST` (ou `GET`) `/api/internal/email-jobs` avec `Authorization: Bearer $INTERNAL_TASKS_SECRET`, toutes les 5 à 15 min (Vercel Cron, ou un cron externe type cron-job.org ; sur Vercel Cron, donner à `INTERNAL_TASKS_SECRET` la valeur de `CRON_SECRET`). Sans ce cron, les confirmations partent quand même, mais pas les rappels ni les demandes d'avis.
- **Rejeu des emails en échec (liste d'attente)** : `POST /api/internal/email-tasks` avec `Authorization: Bearer $INTERNAL_TASKS_SECRET` (cron toutes les 5 à 15 min). Backoff 1 min → 5 min → 30 min → 2 h, alerte après 5 échecs (`ALERT_WEBHOOK_URL`).
- **Purge** : `POST /api/internal/purge` (cron quotidien) — 7 jours pour les demandes non confirmées, 12 mois pour la liste confirmée (`WAITLIST_*_RETENTION_*`, propositions à valider).
- **Sécurité** : CSP avec nonce (`src/proxy.ts`), `X-Frame-Options: DENY`, `Referrer-Policy` stricte (`no-referrer` sur les pages à jeton), HSTS en production, `poweredByHeader` désactivé.
- **Emails** : configurer SPF, DKIM et DMARC sur le domaine d'`EMAIL_FROM` avant tout envoi réel.

## Recette

Voir `docs/recette.md` pour l'état des critères F01 à F15 de la landing et le parcours de recette de l'application (`node scripts/recette-app.mjs`), `docs/recette-landing.md` pour la refonte de la landing et `docs/DESIGN.md` pour la direction de design.

## Décisions à obtenir avant publication publique

Domaine et marque vérifiés · identité légale, hébergeur et contact · prix et conditions confirmés · infrastructure base + email choisie · durées de conservation validées · relecture des contenus.
