---
name: reso-analyse-parcours
description: Analyse du parcours client RESO (où les pros s'arrêtent, combien de temps entre les étapes, quelles erreurs), à partir du rapport Telegram, des parcours individuels et des chiffres Meta. À utiliser quand Robin demande « où ils bloquent », « pourquoi pas d'abonnés », ou à chaque point d'étape d'un test. Produit un diagnostic simple faits / hypothèses / action, propose une seule expérience à valider et tient l'historique (observations O-XXX, tests, enseignements).
---

# Analyse du parcours RESO

## 1. Contexte

Lire `ads/pilotage/regles.md`, `definitions.md`, `plan-de-mesure.md`, `journal.md`
(observations, tests et enseignements précédents : ne pas reproposer une hypothèse déjà tranchée).

## 2. Données à rassembler

| Source | Contenu | Comment |
|---|---|---|
| Rapport Telegram quotidien | Tunnel 24 h / 7 j, par pub, envoi à Meta | Robin le transfère |
| Parcours individuels | Pour chaque inscrit : étapes franchies, dates, étape où il s'est arrêté | Rapport Telegram (section parcours) quand elle existe, sinon alertes Telegram d'inscription |
| Meta | Dépense, impressions, vues 3 s, clics, conversations | Capture ou export de Robin |
| Retours directs | Ce que les pros ont dit (appel, DM, terrain) | Notes de Robin — à traiter comme des faits qualitatifs |
| Cartes de clics / relectures | Seulement si validées et installées | Résumé par Robin ou export |

Ne jamais inventer un chiffre manquant : le nommer comme manquant.

## 3. Calculs

Pour chaque passage d'étape (visite → inscription → établissement → page publiée → 1re réservation → payant) :
- **taux de passage** = arrivés à l'étape suivante ÷ arrivés à l'étape (avec les effectifs bruts à côté) ;
- **délai médian** entre les deux étapes, et le nombre de personnes **bloquées depuis plus de 48 h** ;
- l'étape où le plus de personnes s'arrêtent = **maillon faible**.

Sous 20 personnes à une étape : pas de pourcentage seul, toujours « 3 sur 7 », et une lecture
personne par personne (« Léa : établissement créé, 0 prestation, bloquée depuis 3 j »).

## 4. Diagnostic

| Arrêt observé | Causes possibles à examiner |
|---|---|
| Visites sans inscription | promesse pub ≠ page, page lente sur mobile, prix, manque de preuve |
| Inscription sans établissement | formulaire long, doute, pas le bon moment |
| Établissement sans page publiée | ajout des prestations ou des horaires trop long, import Google raté |
| Page publiée sans réservation | lien pas partagé (bio, story), clientes pas prévenues |
| Activé sans abonnement | fin d'essai non anticipée, pas de relance, prix, paiement |

Classer les hypothèses de la plus probable à la moins probable, en disant sur quoi on s'appuie.

## 5. Rapport (toujours ce format)

```
PARCOURS · <date> · période

Ce qu'on observe (faits)
- …

Où ça bloque
- Maillon faible : <étape> — X sur Y passent, délai médian Z

Causes possibles (hypothèses)
1. … (pourquoi on y pense)
2. …

Action recommandée (attend ton accord)
- Une seule expérience : quoi, pour qui, combien de temps, coût, comment on mesure

Confiance : signal faible | tendance | fiable — pourquoi
```

## 6. Historique

- `journal.md` : ajouter une observation `O-XXX` (date, faits, maillon, confiance).
- Si Robin valide une expérience : fiche `T-XXX` (skill `reso-nouveau-test`) et décision `D-XXX`.
- À la fin de l'expérience : résultat mesuré, puis un enseignement `E-XXX`.
- Si un événement manque pour trancher : le proposer dans `plan-de-mesure.md` (statut « proposé »).
