# Définitions du tunnel RESO

Version 1 — proposée le 6 octobre 2026, à valider par Robin. Toute modification est notée dans `journal.md`.

## Tunnel « site »

| # | Étape | Définition | Source de la donnée |
|---|---|---|---|
| 1 | Publicité | Impressions, vues de 3 s, clics | Meta (export ou capture envoyé par Robin) |
| 2 | Visite | Page vue sur reso-app.fr ; origine (UTM, fbclid) conservée 30 jours, premier contact | Pixel (après consentement) + base RESO |
| 3 | Inscription | Compte créé (`users`) | Base RESO + Conversions API `CompleteRegistration` |
| 4 | Onboarding | Établissement créé, l'essai démarre (`establishments`) | Base RESO + `StartTrial` |
| 5 | Page publiée | Établissement réservable : réservation ouverte, ≥ 1 prestation active, ≥ 1 praticien avec des horaires | Base RESO (calculé) |
| 6 | Première réservation | 1re réservation `source = 'online'`, hors réservations faites avec l'email de la pro | Base RESO + événement `Activation` |
| 7 | Abonnement payé | 1er paiement `payments.status = 'paid'` (Mollie) | Base RESO + `Subscribe` (valeur 29 €) |

« Utilisateur activé » = a atteint l'étape 6.

## Tunnel « conversation Instagram »

| # | Étape | Définition | Source |
|---|---|---|---|
| 1 | Publicité | Impressions, clics vers la messagerie | Meta |
| 2 | Conversation | Conversation démarrée dans Instagram Direct | Meta (« conversations commencées ») |
| 3 | Lead qualifié | La personne est une pro de la beauté et répond à la question de qualification | Suivi manuel de Robin (fiche lead) |
| 4 | Rendez-vous de setting | Appel ou visio de configuration planifié | Suivi manuel |
| 5 → 7 | Inscription → abonnement | Comme le tunnel site ; le lien envoyé en DM porte `utm_source=instagram&utm_medium=dm` | Base RESO |

## Indicateurs du rapport

| Indicateur | Calcul | En clair |
|---|---|---|
| Dépense | somme Meta | ce qu'on a payé |
| CPM | dépense ÷ impressions × 1000 | prix pour être vu 1 000 fois |
| Taux d'arrêt (hook) | vues 3 s ÷ impressions | sur 100 personnes qui voient la pub, combien regardent 3 s |
| Taux de clic lien | clics lien ÷ impressions | sur 100 personnes, combien cliquent |
| Coût par lead | dépense ÷ (inscriptions ou leads qualifiés) | ce que coûte un contact sérieux |
| Coût par client | dépense ÷ abonnements payés | l'indicateur final |
