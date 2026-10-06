# Journal d'acquisition RESO

Mémoire de l'équipe : chaque test, décision et enseignement, du plus récent au plus ancien.
Les agents relisent ce journal avant toute recommandation et le complètent après chaque étape.

## Formats

**Décision** `D-XXX` — date · décision · validée par Robin (oui/non) · raison.
**Test** `T-XXX` — hypothèse · cellules · budget · dates · statut (proposé, validé, en cours, terminé) · résultats · enseignement.
**Enseignement** `E-XXX` — ce qu'on a appris · niveau de confiance (signal faible, tendance, fiable) · test d'origine.

---

## Tests

### T-001 · Site direct contre conversation Instagram — statut : proposé (en attente de validation)

- **Question** : pour 50 €, quel chemin produit le plus de leads sérieux et le meilleur départ vers l'abonnement ?
- **Hypothèse** : pour des pros qui vivent dans leurs DM, une conversation Instagram génère plus de leads
  qu'un envoi vers le site, mais avec un passage à l'abonnement plus manuel (setting).
- **Cellule A — Site** : pub 01 (voix) → reso-app.fr, carte de fin « Essaie gratuitement ».
  `utm_campaign=t001&utm_content=site_pub01`.
- **Cellule B — Conversation** : même pub, carte de fin « Écris-moi en message » → Instagram Direct
  avec questions préremplies.
- **Budget** : 2 × 2,50 €/jour pendant 10 jours = 50 € (plafond).
- **Mesure commune** : coût par lead qualifié, puis inscriptions, activations, abonnements à J+14.
- **Prérequis** : tracking en place et testé (Pixel, Conversions API, origine conservée), bandeau cookies,
  fiche de suivi des leads DM.
- **Limite connue** : avec 50 €, au mieux une tendance ; aucune conclusion « fiable » attendue.

## Décisions

- **D-006** · 2026-10-06 · Bandeau de consentement cookies à ajouter, au style RESO · validé par Robin.
- **D-005** · 2026-10-06 · L'abonnement RESO passe par Mollie (prélèvement) · confirmé par Robin.
- **D-004** · 2026-10-06 · Point de départ : 0 inscrit, 0 client · constaté par Robin.
- **D-003** · 2026-10-06 · Essai gratuit à 0 €, sans carte bancaire · confirmé par Robin. Durée : 7 jours dans le code.
- **D-002** · 2026-10-06 · Budget de départ : 50 € maximum, toute hausse sur accord après rapport · validé par Robin.
- **D-001** · 2026-10-06 · Objectif : 15 clients payants en 30 jours, sans promesse de résultat ;
  la pub valide le message, l'action directe (DM, terrain, appels) porte le volume · cadré avec Robin.

## Enseignements

_Aucun pour l'instant : aucun test terminé._

## À confirmer

- Prix : 29 € TTC (TVA 20 %, soit 24,17 € HT) ou franchise de TVA ?
- Définitions du tunnel (`definitions.md`) : à valider.
