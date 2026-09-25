---
name: reso-script-reel
description: Écrire le script d'un Reel / TikTok / vidéo d'explication Reso et préparer le tournage — hook des 2 premières secondes, structure problème → solution → preuve dans l'app → appel à l'action, texte à dire par Ludivine, plan de montage (quel écran de l'app à quel moment), liste des captures, brief de tournage face caméra. À utiliser avant toute nouvelle vidéo, pour trouver des idées de hooks, ou pour réécrire un script trop long.
---

# Script et tournage d'une vidéo Reso

Livrable : `videos/<nn-slug>/script.md` (modèle : `references/script-template.md`), validé par l'équipe **avant** le tournage. Il sert ensuite à Ludivine (texte), à `/reso-capture-app` (captures) et à `/reso-facecam-app` (plan de montage).

## 1. Cadrer (5 questions, réponses dans l'en-tête du script)

1. **Pour qui ?** La cible Reso : pro de la beauté seule ou en petite équipe (coiffure, esthétique, onglerie, barbier…). Choisir *une* personne précise par vidéo.
2. **Quel moment de sa vie ?** (le soir à répondre aux DM, un lapin, une cliente qui oublie, l'agenda papier raturé…)
3. **Une seule idée** retenue à la fin. Si on en a deux, on fait deux vidéos.
4. **Quelle preuve dans l'app ?** L'écran précis qui rend l'idée évidente (page de réservation, agenda, email de rappel…).
5. **Quel appel à l'action ?** Celui du mode en cours dans `src/config/offer.ts` (`prelaunch` : liste d'attente « Me prévenir du lancement » ; `live` : essai / création de compte). Un seul.

Relire `src/config/offer.ts` et `src/content/fr/landing.ts` pour les faits (prix, limites, mode, promesses) : ne rien affirmer que le produit ne fait pas aujourd'hui, pas de chiffre inventé, pas d'avis fictif.

## 2. Structure (30–60 s, ~130 mots/min à l'oral)

| Temps | Bloc | Contenu | Plan |
| --- | --- | --- | --- |
| 0–2 s | **Hook** | une phrase qui arrête le pouce : situation vécue, question, contre-intuition | `face` + bandeau titre |
| 2–10 s | Problème | 2–3 détails concrets du quotidien | `face`, zoom de relance |
| 10–35 s | Solution montrée | une action = un écran de l'app, commentée | `app`, `split`, `cutout`, pastilles |
| 35–45 s | Récap / offre | la promesse + l'offre (depuis `offer.ts`) | `card` |
| 45–50 s | CTA | face caméra, simple, une seule action | `face` puis carte de fin |

Écrire **pour l'oreille** : phrases de 6 à 12 mots, vouvoiement, mots du quotidien (« vos clientes réservent toutes seules »), pas de jargon (« SaaS », « workflow », « no-show » → « lapin »). Lire le script à voix haute chrono en main ; couper tout ce qui dépasse.

## 3. Hooks

Toujours en proposer **3 très différents** et en recommander un. Familles qui marchent pour Reso :

- **Situation** : « 22 h. Vous êtes encore sur Instagram à caler les rendez-vous de demain. »
- **Question** : « Combien de rendez-vous vous avez perdus parce que vous n'avez pas répondu assez vite ? »
- **Contre-intuitif** : « Arrêtez de répondre aux messages de vos clientes. »
- **Avant / après** : l'agenda papier raturé → l'agenda Reso (visuel fort, peu de mots).
- **Démonstration immédiate** : « Regardez : une cliente vient de réserver pendant que je vous parle. » (pastille « Nouvelle réservation »).

Le hook doit être lisible **sans le son** (bandeau titre) et compris en 2 s.

## 4. Plan de montage et captures

Dans le script, en face de chaque phrase : le layout prévu (`face`, `app`, `split`, `cutout`, `card`), l'écran de l'app, les pastilles éventuelles. En déduire la **liste des captures** (un scénario `/reso-capture-app` par ligne, 4–10 s chacune, données fictives).

## 5. Brief de tournage

Joindre `references/brief-tournage.md` (à envoyer à Ludivine tel quel) et y préciser : lieu, tenue, nombre de prises, date de livraison des rushs. Points non négociables : vertical 9:16 en 1080p minimum (4K si possible), 30 i/s, **micro-cravate** ou micro proche, visage dans le tiers haut, lumière face à elle, 2 s de silence avant et après chaque prise.

## 6. Checklist avant de valider le script

- [ ] Hook ≤ 2 s, lisible sans le son.
- [ ] Une seule idée, un seul CTA, conforme au mode de `offer.ts`.
- [ ] Chaque fonctionnalité citée existe dans l'app aujourd'hui (voir `README.md`).
- [ ] Aucun chiffre, avis ou logo inventé ; prix identique à `offer.ts`.
- [ ] Durée lue à voix haute ≤ durée cible.
- [ ] Liste des captures complète, plan de montage en face de chaque phrase.

La première vidéo (le concept, par Ludivine) est rédigée dans `videos/01-concept/script.md` : s'en servir d'exemple.
