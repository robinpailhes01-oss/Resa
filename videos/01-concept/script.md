# 01 — Le concept Reso, expliqué par Ludivine

- **Format** : Reel Instagram / TikTok / Short, 9:16, cible **45 s** (maximum 55 s)
- **Pour qui** : une esthéticienne ou une coiffeuse indépendante (seule ou avec 1–2 collègues) qui gère ses rendez-vous par messages, téléphone et agenda papier
- **Moment de vie** : le soir, après sa journée, elle répond encore aux demandes de rendez-vous
- **Idée unique** : avec Reso, vos clientes réservent toutes seules et l'agenda se tient à jour sans vous
- **Preuve dans l'app** : page de réservation sur téléphone (la cliente choisit prestation + créneau), agenda du jour, email de rappel
- **CTA** : mode actuel `prelaunch` (`src/config/offer.ts`) → **« Me prévenir du lancement »**, lien en bio. À basculer sur « Essayer gratuitement » si la vidéo sort après le passage en `live`.
- **Face caméra** : Ludivine
- **Faits vérifiés dans `src/config/offer.ts` au 25/09/2026** : 39 € HT / mois, un établissement, jusqu'à 3 praticiens. À revérifier le jour du montage.
- **Statut** : brouillon — à valider avant tournage

## Hooks proposés

1. **Situation** — « Il est 22 h et vous êtes encore en train de répondre à vos clientes pour caler des rendez-vous ? » ← **recommandé** : la cible s'y reconnaît immédiatement, fonctionne sans le son grâce au bandeau.
2. **Contre-intuitif** — « Arrêtez de répondre aux messages de vos clientes. » (plus fort, mais demande une explication immédiate ; bon pour une 2e version A/B)
3. **Démonstration immédiate** — « Pendant que je vous parle, une cliente vient de réserver chez moi. » + pastille « Nouvelle réservation » (à garder pour une vidéo où l'app est déjà en service réel)

## Script (≈ 110 mots, ~45 s)

| # | Texte dit par Ludivine | Durée | Plan (`layout`) | Écran / élément |
| --- | --- | --- | --- | --- |
| 1 | « Il est 22 h et vous êtes encore en train de répondre à vos clientes pour caler des rendez-vous ? » | 3 s | `face` + bandeau « 22 h, encore sur vos messages ? » | — |
| 2 | « Un “t'as une dispo jeudi ?” sur Insta, un appel en plein soin, et une cliente qui oublie son rendez-vous… » | 5 s | `face`, zoom 1,12 à « un appel » | pastilles « Message · T'as une dispo jeudi ? » puis « Appel manqué » |
| 3 | « Moi, c'est Ludivine, et avec Reso, tout ça, c'est fini. » | 3 s | `face` zoom 1,0 | bandeau « Ludivine · Reso » |
| 4 | « Vous partagez votre lien de réservation, et vos clientes choisissent elles-mêmes leur prestation et leur créneau. » | 6 s | `app` (bulle) | capture `reservation-mobile` : prestation → créneau |
| 5 | « Même à minuit, même le dimanche. » | 2 s | `app-only` zoom sur les créneaux | pastille « Réservation en ligne · 24h/24 » |
| 6 | « Le rendez-vous arrive directement dans votre agenda. Et si vous êtes plusieurs, chacun a le sien. » | 6 s | `split` | capture `agenda-desktop` (ou agenda de la landing) + pastille « Nouvelle réservation · Il y a 2 minutes » |
| 7 | « La veille, votre cliente reçoit un rappel. Après sa visite, une demande d'avis. Et vous, vous n'avez rien fait. » | 7 s | `card` « Confirmation, rappel, avis. » (sous-titres masqués) puis `cutout` si détourage | pastille « Rappel par email envoyé · Julie Martin · demain 09:00 » |
| 8 | « Une seule offre, trente-neuf euros hors taxe par mois, jusqu'à trois praticiens. » | 5 s | `card` kicker « Une offre simple », texte « 39 € HT / mois », sous-titre « Un établissement · jusqu'à 3 praticiens » | — |
| 9 | « On lance très bientôt : inscrivez-vous pour être prévenue, le lien est dans ma bio. » | 5 s | `face` | bandeau « Lien en bio » |
| — | (carte de fin) | 2,5 s | `endCard` | « Votre agenda. L'esprit libre. » · « Me prévenir du lancement » · URL du site |

Remarque : les phrases 7 et 8 peuvent être raccourcies si la lecture dépasse 50 s (supprimer « Et vous, vous n'avez rien fait »).

## Captures à réaliser (`/reso-capture-app`)

Sur un compte de démonstration (établissement fictif « Maison Alba », praticiennes Camille et Sophie, cliente « Julie Martin »), app en mode `prelaunch`, build de production.

| Nom | Scénario | Contenu | Durée utile |
| --- | --- | --- | --- |
| `reservation-mobile` | `captures/reservation-mobile.json` | page `/r/maison-alba` : choix d'une prestation → praticienne → créneau → prénom/nom tapés | 8 s |
| `agenda-desktop` | `captures/agenda-desktop.json` | agenda du jour avec 3–4 rendez-vous, défilement lent | 7 s |
| `landing-mobile` | `captures/landing-mobile.json` | secours sans base de données : agenda animé et email de la landing | 10 s |

## Tournage

- Lieu : l'institut ou le salon de Ludivine (crédibilité), à défaut mur uni clair ; fond uni si on veut le plan détouré (#7).
- Une prise par ligne du script, **3 versions du hook** (#1) et 2 du CTA (#9).
- Brief complet : `.claude/skills/reso-script-reel/references/brief-tournage.md`.

## Montage

`/reso-facecam-app` → `videos/01-concept/montage.json` après dérushage et transcription (les temps du tableau sont indicatifs ; les `start` réels se calent sur `transcript.json`).

## Légende de publication (brouillon)

Vos clientes réservent toutes seules, 24h/24, et les rappels partent sans vous. Reso arrive bientôt : inscrivez-vous pour être prévenue du lancement (lien en bio).
#coiffure #estheticienne #institutdebeaute #prothesiste #agendaenligne #reservationenligne
