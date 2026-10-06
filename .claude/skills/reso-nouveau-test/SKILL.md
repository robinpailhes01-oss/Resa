---
name: reso-nouveau-test
description: Conception d'un nouveau test publicitaire RESO (fiche T-XXX). À utiliser quand Robin veut tester une idée (nouvel angle, hook, destination site/Instagram/formulaire, budget, page d'arrivée) : formule l'hypothèse, limite les variables, vérifie budget et tracking, prépare la check-list de lancement, puis inscrit le test dans le journal en statut « proposé ».
---

# Nouveau test RESO

## 1. Contexte

Lire `ads/pilotage/regles.md`, `definitions.md`, `budget.md`, `journal.md`
(enseignements existants : ne pas retester ce qui est déjà tranché, s'appuyer sur ce qui a marché).

## 2. Challenger l'idée

Avant de concevoir, répondre en 3 lignes :
- Quelle question précise le test tranche-t-il ?
- Le budget disponible permet-il d'obtenir au moins un **signal** ? (seuils `regles.md` §3)
- Existe-t-il un test plus simple ou moins cher qui répond à la même question ?
Si l'idée disperse le budget (plus de 2 cellules sous 100 €, plusieurs variables à la fois), le dire et proposer mieux.

## 3. Rédiger la fiche

```
### T-XXX · <titre> — statut : proposé
- Question :
- Hypothèse : (avec ce qui la rendrait fausse)
- Variable testée : (une seule)
- Cellules : A … / B …  (nom Meta = utm_content)
- Objectif Meta et événement d'optimisation : … (et pourquoi, vu le volume attendu)
- Budget : X €/jour × N jours = total (≤ restant de budget.md)
- Mesure principale : … · mesures secondaires : …
- Données minimales avant conclusion : …
- Prérequis : tracking, créatives, pages, fiche de suivi des leads…
- Critère d'arrêt anticipé : (ex. 0 clic après 1 500 impressions sur une cellule)
```

## 4. Check-list avant lancement (Robin coche, l'équipe vérifie)

- [ ] Limite de dépenses du compte Meta = plafond validé
- [ ] Jeu de données / Pixel reçoit `PageView` (Tester les événements) et les événements serveur
- [ ] Une inscription de test remonte avec la bonne `utm_campaign` / `utm_content`
- [ ] Liens de chaque pub avec UTM uniques ; noms Meta = `utm_content`
- [ ] Créatives vérifiées sur mobile (texte lisible sans le son, zones sûres Reels)
- [ ] Pour une cellule conversation : questions préremplies, réponse type, fiche de suivi des leads
- [ ] Robin a validé : budget, dates, créatives, textes

## 5. Inscrire et demander l'accord

Ajouter la fiche dans `journal.md` (section Tests, en haut), statut « proposé ».
Présenter à Robin : la fiche en clair, le coût, ce qu'on saura à la fin, et la question « je lance la préparation ? ».
Au « oui » : statut « validé » et décision `D-XXX`.
