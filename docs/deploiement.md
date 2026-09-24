# Mettre Reso en ligne : Supabase + Vercel

Ce guide met le site `resa-lemon.vercel.app` en mode lancement : inscription ouverte, essai gratuit de 7 jours sans carte bancaire, abonnement à 39 € HT / mois activé à la main tant que le paiement en ligne n’est pas branché.

Durée : environ 20 minutes. Rien à installer sur votre ordinateur.

## 1. Créer la base de données sur Supabase

1. Ouvrez https://supabase.com/dashboard et connectez-vous avec votre nouveau compte.
2. **New project** :
   - *Organization* : votre organisation ;
   - *Name* : `reso` ;
   - *Database password* : cliquez sur **Generate a password** puis **copiez-le** dans un endroit sûr (il ne sera plus affiché) ;
   - *Region* : **West EU (Paris)** ;
   - **Create new project**. Patientez 1 à 2 minutes.
3. Une fois le projet prêt, cliquez sur **Connect** (bouton en haut de la page du projet).
4. Onglet **Connection string**, choisissez **Transaction pooler** (port `6543`). Copiez l’URI, qui ressemble à :
   ```
   postgresql://postgres.xxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
   ```
5. Remplacez `[YOUR-PASSWORD]` par le mot de passe copié à l’étape 2. Gardez cette URL : c’est votre `DATABASE_URL`.

> **Attention** : n’utilisez ni l’URL du projet (`https://xxxx.supabase.co`), ni la connexion « Direct » (`db.xxxx.supabase.co:5432`) : la première n’héberge pas la base, la seconde n’est joignable qu’en IPv6, que Vercel n’a pas. Le build échoue alors avec `CONNECT_TIMEOUT` à l’étape des migrations. Seule l’URL du **pooler** (`…pooler.supabase.com`) fonctionne, et elle doit être **copiée telle quelle** depuis le bouton Connect : la région dans l’hôte (`aws-0-eu-west-3`, `aws-1-eu-west-3`, `aws-0-eu-central-1`…) est propre à votre projet. Avec une mauvaise région, le build échoue avec `tenant/user … not found`.

Les tables sont créées automatiquement par Reso au premier déploiement (migrations dans `db/migrations`). Vous n’avez rien à faire dans l’éditeur SQL.

> Alternative : dans Vercel, onglet **Storage → Create Database → Supabase**. L’intégration crée le projet Supabase et injecte `POSTGRES_URL` toute seule ; Reso l’accepte à la place de `DATABASE_URL`. Dans ce cas, sautez les étapes 3 à 5 et ne renseignez pas `DATABASE_URL` à l’étape 2 ci-dessous.

## 2. Renseigner les variables sur Vercel

1. Ouvrez https://vercel.com → projet **resa** → **Settings** → **Environment Variables**.
2. Ajoutez chaque variable ci-dessous (environnement **Production**, et cochez aussi **Preview** si vous voulez tester les aperçus de branches) :

| Variable | Valeur | Rôle |
|---|---|---|
| `DATABASE_URL` | l’URL de l’étape 1 | base de données (comptes, agendas, rendez-vous) |
| `RESO_LAUNCH_MODE` | `live` | ouvre l’inscription et la connexion sur le site |
| `RESO_SITE_URL` | `https://reso-app.fr` (ou `https://resa-lemon.vercel.app` tant que le domaine n’est pas rattaché) | liens absolus des emails, canonical |
| `INTERNAL_TASKS_SECRET` | une longue chaîne aléatoire | protège les routes internes (rappels par email) |
| `RESO_SUPPORT_EMAIL` | `contact@reso-app.fr` | affichée aux établissements pour activer l’abonnement, adresse de réponse des emails |
| `RESO_TRIAL_DAYS` | `7` (facultatif, 7 par défaut) | durée de l’essai gratuit ; `0` le désactive |
| `RESO_INDEXABLE` | `true` quand le site est prêt | autorise Google à indexer la landing |

Emails (nécessaires pour la vérification de compte, les confirmations, rappels et demandes d’avis) :

| Variable | Valeur |
|---|---|
| `RESEND_API_KEY` | clé API créée dans Resend → API Keys (permission « Sending access », domaine `reso-app.fr`). **Copiez-la au moment de sa création** : ensuite Resend ne l’affiche plus que masquée (`re_••••`), et une clé masquée ne fonctionne pas. Elle commence par `re_` et ne contient que des lettres et des chiffres. |
| `EMAIL_FROM` | `Reso <contact@reso-app.fr>` |

`EMAIL_FROM` est l’expéditeur qui apparaît dans la boîte de réception de vos clients : un nom affiché puis, entre chevrons, une adresse du domaine vérifié dans Resend. Avec `contact@reso-app.fr`, les réponses arrivent dans votre boîte Hostinger. Vous pouvez aussi utiliser une adresse qui n’existe pas comme boîte (par exemple `Reso <rendez-vous@reso-app.fr>`) : Resend envoie quand même, et l’adresse de réponse reste `RESO_SUPPORT_EMAIL`.

Sans ces deux variables, l’inscription et les réservations fonctionnent, mais aucun email ne part.

3. **Redéployez** pour que les variables soient prises en compte : onglet **Deployments** → dernier déploiement → menu **⋯** → **Redeploy**. Le build applique les migrations sur la base, puis publie le site.

## 3. Vérifier

1. Ouvrez https://resa-lemon.vercel.app : le bouton principal est « Essayer gratuitement » et la barre indique « 7 jours d’essai gratuit · Sans carte bancaire ».
2. Créez un compte test, votre établissement, une prestation, puis ouvrez votre lien de réservation dans une fenêtre privée et réservez un créneau.
3. Sur le tableau de bord, le bandeau « Essai gratuit · 7 jours restants » s’affiche.
4. Si l’inscription affiche une erreur : **Vercel → Deployments → dernier déploiement → Logs** ; l’erreur la plus fréquente est une `DATABASE_URL` incomplète (mot de passe non remplacé).

## 4. Rappels et demandes d’avis (cron)

Les confirmations partent immédiatement. Les rappels avant rendez-vous et les demandes d’avis sont envoyés par un appel régulier à :

```
GET https://resa-lemon.vercel.app/api/internal/email-jobs
Authorization: Bearer <INTERNAL_TASKS_SECRET>
```

Le plus simple : un compte gratuit sur https://cron-job.org, une tâche toutes les 10 minutes avec cette URL et cet en-tête. (Vercel Cron en offre Hobby ne permet qu’un appel par jour.)

## 5. Gérer l’essai et l’abonnement (sans paiement en ligne)

Chaque établissement dispose de 7 jours d’essai à partir de sa création. Ensuite, sa page de réservation en ligne est suspendue (ses clientes ne peuvent plus réserver) ; son espace pro et ses données restent accessibles, avec un bandeau l’invitant à vous contacter.

Pour activer un abonnement après accord (virement, facture…), dans **Supabase → SQL Editor** :

```sql
-- Activer un établissement (remplacez le slug par celui affiché dans son lien /r/…)
update establishments set subscription_status = 'active' where slug = 'institut-lumiere';

-- Prolonger un essai de 7 jours
update establishments set trial_ends_at = now() + interval '7 days' where slug = 'institut-lumiere';

-- Arrêter un abonnement
update establishments set subscription_status = 'cancelled' where slug = 'institut-lumiere';
```

Quand le paiement en ligne sera branché (Stripe), cette activation deviendra automatique.

## 6. Rattacher reso-app.fr (domaine chez Hostinger)

Ne changez pas les serveurs de noms : vos emails (boîte Hostinger et Resend) dépendent des enregistrements DNS actuels. Il suffit d’ajouter deux enregistrements.

1. Vercel → projet **resa** → **Settings → Domains** → **Add** → `reso-app.fr`. Acceptez la proposition d’ajouter aussi `www.reso-app.fr` avec redirection vers `reso-app.fr`. Vercel affiche les valeurs DNS attendues.
2. Hostinger → **Domaines → reso-app.fr → DNS / Nameservers** :
   - supprimez l’enregistrement **A** de `@` qui pointe vers la page « parked » (`2.57.91.91`) et créez un **A** `@` → `76.76.21.21` ;
   - modifiez le **CNAME** `www` pour qu’il pointe vers `cname.vercel-dns.com` (au lieu de `reso-app.fr`).
   Ne touchez ni aux **MX**, ni aux **TXT** (`v=spf1…`, `resend._domainkey`, `send`, `_dmarc`).
3. Revenez dans Vercel : le domaine passe en « Valid Configuration » après quelques minutes (jusqu’à une heure). Le certificat HTTPS est automatique.
4. Mettez `RESO_SITE_URL` à `https://reso-app.fr` et `RESO_INDEXABLE` à `true`, puis redéployez.

Pour vérifier : `https://reso-app.fr` doit afficher Reso, et `https://www.reso-app.fr` rediriger vers `https://reso-app.fr`.

## 7. Import de la fiche Google à l’inscription (facultatif)

À la création de son établissement, le pro peut chercher sa fiche Google : nom, adresse, téléphone, activité et horaires d’ouverture sont préremplis. Le bloc n’apparaît que si une clé Google est configurée.

1. https://console.cloud.google.com → créez un projet (ex. `reso`) et activez la facturation (obligatoire chez Google, mais les 5 000 premières recherches du mois sont gratuites ; au-delà, environ 0,03 € la recherche).
2. **APIs et services → Bibliothèque** → activez **Places API (New)** (bien la version « New »).
3. **Identifiants → Créer des identifiants → Clé API**. Sur la clé : **Restrictions relatives aux API → Places API (New)** uniquement. Pas de restriction de site web (la clé est utilisée par le serveur, jamais par le navigateur).
4. Vercel → Environment Variables → `GOOGLE_PLACES_API_KEY` = la clé → Redeploy.

Sans cette variable, le formulaire d’onboarding reste identique à aujourd’hui.

Ce que l’import récupère : nom, adresse, code postal, ville, téléphone, activité, horaires d’ouverture, texte de présentation et jusqu’à six photos (affichées sur la page de réservation, retirables dans Paramètres). Google ne fournit pas les prestations ni les prix : à la place, la page Prestations propose des prestations types selon l’activité, à cocher puis ajuster.

Pour vérifier les emails après un changement de clé : appelez `https://www.reso-app.fr/api/internal/email-jobs` avec l’en-tête `Authorization: Bearer <INTERNAL_TASKS_SECRET>` ; la réponse indique les envois réussis et, en cas d’échec, la cause (`lastErrors`).

## 8. Après le rattachement du domaine

Vercel a choisi `www.reso-app.fr` comme adresse principale et redirige `reso-app.fr` vers elle. Pour que les liens des emails et les liens de réservation utilisent directement la bonne adresse, mettez `RESO_SITE_URL=https://www.reso-app.fr` (ou, si vous préférez l’adresse sans www : Vercel → Settings → Domains → sur `reso-app.fr`, choisissez-la comme principale et faites rediriger `www`, puis gardez `RESO_SITE_URL=https://reso-app.fr`).

Une page ouverte avant un redéploiement peut afficher « This page couldn’t load » au clic suivant : c’est le navigateur qui parle encore à l’ancienne version. Un simple rechargement suffit.

## 9. Notifications Telegram et récap hebdomadaire

Vous recevez un message Telegram à chaque inscription, chaque établissement créé et chaque retour envoyé depuis le widget, plus un récapitulatif chaque lundi à 9 h (Paris) : nouveaux comptes, établissements, rendez-vous, abonnements actifs, essais qui se terminent, retours reçus. Les paiements seront ajoutés au branchement de Stripe.

1. Dans Telegram, ouvrez **@BotFather** → `/newbot` → donnez un nom (ex. « Reso ») et un identifiant (ex. `reso_notifs_bot`). BotFather affiche le **token** (forme `123456789:AAH…`).
2. Ouvrez votre nouveau bot dans Telegram et envoyez-lui n’importe quel message (« bonjour »).
3. Dans votre navigateur, ouvrez `https://api.telegram.org/bot<TOKEN>/getUpdates` (remplacez `<TOKEN>`). Dans la réponse, repérez `"chat":{"id":123456789` : ce nombre est votre **chat id**.
4. Vercel → Environment Variables → `TELEGRAM_BOT_TOKEN` et `TELEGRAM_CHAT_ID` → Redeploy.
5. Test : ouvrez `https://www.reso-app.fr/api/internal/telegram-test` avec l’en-tête `Authorization: Bearer <INTERNAL_TASKS_SECRET>` (ou demandez-moi de le faire) : vous recevez « les notifications Telegram fonctionnent ».

Le récap du lundi est déclenché par un cron Vercel (`vercel.json`). Pour qu’il soit autorisé, ajoutez sur Vercel la variable `CRON_SECRET` avec la même valeur que `INTERNAL_TASKS_SECRET`. Pour le recevoir tout de suite : `https://www.reso-app.fr/api/internal/weekly-report` avec le même en-tête.

## 10. Abonnement payant (SumUp)

Variables : `SUMUP_API_KEY` (clé secrète, SumUp → Développeurs → Clés API), `SUMUP_MERCHANT_CODE` (code marchand `MXXXXXXX`), `RESO_VAT_RATE` (20 par défaut, `0` en franchise de TVA), `RESO_LEGAL_ID` (SIREN) et `RESO_VAT_NUMBER` (facultatif). Redeploy après ajout.

Fonctionnement : le pro clique « Payer » dans Abonnement, paie sur la page SumUp, revient sur le site ; Reso vérifie le paiement auprès de SumUp, active l’abonnement pour un mois, envoie un reçu par email et une notification Telegram. Cinq jours avant l’échéance, un email de renouvellement avec lien de paiement part automatiquement (cron quotidien 8 h Paris). Trois jours après l’échéance sans paiement, la page de réservation est suspendue (statut « paiement en attente ») jusqu’au règlement. La résiliation en fin de période se fait depuis l’espace pro.

Le prélèvement automatique sur carte enregistrée n’est pas activé : il dépend de l’option « paiements récurrents » du compte SumUp. Tant qu’elle n’est pas disponible, chaque mois est réglé en un clic depuis l’email ou la page Abonnement.

Pour lancer le cycle à la main : `https://www.reso-app.fr/api/internal/billing` avec l’en-tête `Authorization: Bearer <INTERNAL_TASKS_SECRET>`.

## 11. Pages légales

Mentions légales, CGV et confidentialité lisent la configuration : `RESO_LEGAL_ENTITY` (raison sociale et adresse ; par défaut SAS Harmonie Group, 61 rue du Rouet, 13008 Marseille), `RESO_LEGAL_ID` (SIREN), `RESO_VAT_NUMBER`, `RESO_PUBLICATION_DIRECTOR` (par défaut Robin Pailhes), `RESO_HOSTING_PROVIDER` (par défaut Vercel Inc.). Renseignez au minimum `RESO_LEGAL_ID`.
