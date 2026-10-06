# Tracking RESO : comment ça marche, où voir les résultats

## En une phrase

Chaque pro qui arrive par une pub porte une « étiquette » (les UTM du lien). RESO garde cette étiquette
jusqu'à l'inscription, puis note chaque étape franchie. Avec son accord cookies, Meta reçoit aussi ces
étapes pour optimiser les pubs.

## Le chemin d'une pro

```
Pub Meta (lien avec utm_campaign=t001&utm_content=site_pub01)
  │
  ▼  arrive sur reso-app.fr
  │   • cookie reso_src : l'origine (UTM), 30 jours, premier contact
  │   • visite comptée (agrégée par jour et par origine, sans identifiant)
  │   • bandeau cookies → si « Accepter » : Pixel Meta (PageView, ViewContent…)
  │
  ▼  crée son compte ............ étape « inscription »        → Meta : CompleteRegistration
  ▼  crée son établissement ..... étape « essai démarré »      → Meta : StartTrial
  ▼  prestations + horaires ..... « page publiée » (calculée dans l'admin)
  ▼  1re réservation en ligne ... étape « activation »         → Meta : Activation
  │     (hors réservation faite avec l'email de la pro)
  ▼  1er paiement Mollie ........ étape « abonnement payé »    → Meta : Subscribe (29 €)
```

Les paiements des clientes des salons (acomptes, Mollie Connect) ne déclenchent **jamais** d'étape :
ils apparaissent à part dans l'admin, comme indicateur d'usage.

## Où voir quoi

| Question | Où regarder |
|---|---|
| Combien j'ai dépensé, impressions, clics, coût par clic | **Gestionnaire de publicités Meta** |
| Combien de conversations Instagram | Gestionnaire de publicités (colonne « Conversations commencées ») + boîte de réception Meta Business Suite |
| Visites, inscriptions, établissements, pages publiées, 1res réservations, **abonnés payants**, par pub | **reso-app.fr/admin/acquisition** (connecté avec ton compte admin) |
| Chaque nouvelle inscription, avec son origine | **Telegram** (ligne « 📣 origine : meta · paid · t001 · site_pub01 ») |
| Est-ce que Meta reçoit bien les événements | **Gestionnaire d'événements Meta** → ton jeu de données → Vue d'ensemble / Tester les événements |
| Le rapport complet et la décision suivante | Envoie une capture Meta + la page admin à Claude → skill `reso-rapport-test` |

## Mise en route (une seule fois)

### 1. Dans Meta (Robin)

1. **Gestionnaire d'événements** → Connecter des sources de données → **Web** → nom « RESO » → Créer.
2. Choisir « Configurer manuellement » si on te propose un partenaire, puis fermer : le code est déjà dans le site.
3. Copier **l'identifiant du jeu de données** (une suite de chiffres) → c'est `NEXT_PUBLIC_META_PIXEL_ID`.
4. Dans le jeu de données → **Paramètres** → section « API Conversions » → **Générer un jeton d'accès**
   → c'est `META_CAPI_TOKEN`. Ne le colle jamais dans le chat.
5. Onglet **Tester les événements** → copier le **code de test** (ex. `TEST12345`) → c'est `META_TEST_EVENT_CODE`.
6. **Paramètres d'entreprise → Sécurité de la marque → Domaines** → ajouter `reso-app.fr` → vérifier (TXT DNS).

### 2. Dans Vercel (Robin)

Projet RESO → Settings → **Environment Variables** → environnement **Production** :

| Nom | Valeur | Secret ? |
|---|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | l'identifiant du jeu de données | non (visible dans le site) |
| `META_CAPI_TOKEN` | le jeton d'accès | **oui** |
| `META_TEST_EVENT_CODE` | le code de test (à retirer une fois les tests faits) | non |

Sans ces variables, rien n'est envoyé à Meta et le bandeau cookies ne s'affiche pas. L'origine des
inscriptions et la page admin fonctionnent quand même.

### 3. Mise en ligne

Le code est sur la branche `ads`. La mise en production = fusion dans `main` (accord de Robin requis).
La migration `0020_acquisition.sql` s'applique automatiquement au déploiement (3 nouvelles tables, rien de modifié).

### 4. Test avant de dépenser 1 €

1. Ouvrir `https://www.reso-app.fr/?utm_source=meta&utm_medium=paid&utm_campaign=test&utm_content=test` en navigation privée.
2. Le bandeau apparaît → **Accepter**.
3. Gestionnaire d'événements → Tester les événements : **PageView** doit apparaître (source : navigateur).
4. Créer un compte de test → **CompleteRegistration** (source : serveur) ; créer l'établissement → **StartTrial**.
5. `/admin/acquisition` : la ligne « meta · test · test » montre 1 inscription et 1 établissement créé.
6. Telegram : l'alerte d'inscription affiche « origine : meta · paid · test · test ».
7. Supprimer `META_TEST_EVENT_CODE` dans Vercel, redéployer.

## Liens des pubs du test T-001

| Cellule | Lien |
|---|---|
| A · Site | `https://www.reso-app.fr/?utm_source=meta&utm_medium=paid&utm_campaign=t001&utm_content=site_pub01` |
| B · Conversation | pas de lien : destination « Instagram Direct ». Dans la conversation, envoyer : `https://www.reso-app.fr/inscription?utm_source=instagram&utm_medium=dm&utm_campaign=t001&utm_content=dm_pub01` |

## Limites connues

- Sans accord cookies, Meta ne reçoit rien pour cette personne : Meta sous-estimera les résultats.
  La page admin RESO, elle, compte toutes les inscriptions (avec leur origine UTM).
- Les leads de conversation Instagram ne passent pas par le site avant l'inscription : ils sont suivis
  à la main par Robin jusqu'au lien d'inscription (qui porte ses propres UTM).
- « Page publiée » est calculée (pas d'étape « publier » dans RESO).
