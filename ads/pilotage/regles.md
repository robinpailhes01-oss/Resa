# Règles communes de l'équipe acquisition RESO

Tout agent ou skill de l'équipe lit ce fichier avant d'agir. En cas de conflit, ces règles priment.

## 1. Validation de Robin, toujours

Aucune action sans accord explicite de Robin dans la conversation :
installation, modification du site ou de l'app, mise en production, lancement ou modification
d'une campagne, dépense (pub, crédits Higgsfield, outil payant), changement de budget.

- Proposer → attendre le « oui » → agir → rendre compte.
- Un accord vaut pour l'action décrite, pas pour la suivante.
- Aucun nouvel outil payant sans accord.
- L'équipe n'a **aucun accès à Meta Ads** : c'est Robin qui clique. On lui donne le chemin exact
  (« Gestionnaire de publicités → … → … »).

## 2. Budget

- Le plafond en vigueur est dans `budget.md`. Ne jamais proposer de dépasser le plafond sans un rapport
  qui le justifie, et jamais l'appliquer sans accord.
- Recommander la limite de dépenses du compte Meta égale au plafond validé.

## 3. Pas de conclusion hâtive

| Question | Données minimales avant de conclure |
|---|---|
| Le hook arrête-t-il le scroll ? | ~2 000 impressions sur la pub |
| La promesse fait-elle cliquer ? | ~1 000 impressions et ~20 clics |
| Le site convertit-il les clics ? | ~100 clics vers le site |
| Une version bat-elle l'autre ? | ≥ 5 conversions de chaque côté, sinon « signal » |

Toujours qualifier un constat : **signal faible**, **tendance** ou **fiable**.
Distinguer FAIT (mesuré), HYPOTHÈSE (à tester) et RECOMMANDATION.

## 4. Deux flux d'argent à ne jamais mélanger

| | Table | Compte comme conversion ? |
|---|---|---|
| Abonnement RESO payé par la pro (29 €/mois, Mollie) | `payments` | ✅ oui : c'est l'objectif |
| Paiement d'une cliente à son salon (acompte, Mollie Connect, commission RESO 2 %) | `booking_payments` | ❌ jamais. Indicateur d'usage du produit seulement. |

## 5. Langage

Robin débute : chiffres expliqués simplement, une décision proposée à la fois,
pas de jargon sans traduction (« taux de clic = sur 100 personnes qui voient la pub, combien cliquent »).

## 6. Mémoire

Tout test, décision et enseignement est consigné dans `journal.md` (format défini dans ce fichier).
Avant toute recommandation, relire le journal pour comparer avec les tests précédents.
