---
name: reso-video
description: Point d'entrée de toute vidéo Reso — Reels, TikTok, Shorts, vidéo d'explication, démo produit, montage face caméra avec l'app, sous-titres, carte de fin. À lire en premier dès qu'on parle de vidéo, réel, montage, tournage, sous-titres, rushs, HyperFrames ou « montrer l'app en vidéo » pour Reso. Oriente vers le bon skill (script, capture de l'app, montage face caméra + app, charte) et fixe les conventions de dossier, de format et de qualité.
---

# Vidéos Reso — point d'entrée

Toutes les vidéos Reso sont montées avec **HyperFrames** (vidéo = page HTML + GSAP, rendue en MP4). Les skills officiels HyperFrames sont installés dans ce dépôt (`.claude/skills/hyperframes*`, `media-use`, `talking-head-recut`, `embedded-captions`) ; les skills `reso-*` ajoutent par-dessus la marque, les formats et les méthodes de l'équipe.

## Quel skill pour quoi

| Besoin | Skill |
| --- | --- |
| Écrire le script, trouver le hook, préparer le tournage de Ludivine | `/reso-script-reel` |
| Filmer l'app ou la landing (parcours de réservation, agenda…) en vidéo nette | `/reso-capture-app` |
| **Ludivine face caméra + l'app en fond, en bulle ou en plein écran, sous-titres** | `/reso-facecam-app` |
| Couleurs, police, sous-titres, zones sûres Reels, ton, règles de contenu | `/reso-video-charte` |
| Juste des sous-titres « cinéma » sur un rush sans rien d'autre | `/embedded-captions` (officiel) |
| Cartes graphiques sur une interview longue (16:9, podcast) | `/talking-head-recut` (officiel) |
| Vidéo sans visage (motion design seul) | `/hyperframes` (officiel, routeur) |

En cas de doute : une vidéo où Ludivine parle et où l'on voit l'app → `/reso-facecam-app`.

## Chaîne de production (vue d'ensemble)

1. **Script** (`/reso-script-reel`) → `videos/<nn-slug>/script.md` : hook, texte dit, plan de montage (quel écran à quel moment), liste des captures.
2. **Tournage** : Ludivine filme en 9:16 d'après le brief de tournage ; les rushs vont dans `videos/<nn-slug>/media/rushes/`.
3. **Captures de l'app** (`/reso-capture-app`) → `videos/<nn-slug>/media/app/*.mp4|png`.
4. **Dérushage + transcription** (`/reso-facecam-app` étapes 2-3) → `media/face.mp4` + `transcript.json`.
5. **Plan de montage** `montage.json` → `build-montage.mjs` génère `index.html`.
6. **Contrôle** : `npx hyperframes lint`, `snapshot`, planche contact relue image par image.
7. **Validation humaine** de la prévisualisation, puis **rendu** `npx hyperframes render --quality delivery`.

## Conventions

- Un dossier par vidéo : `videos/<nn-slug>/` (ex. `videos/01-concept/`), numéroté dans l'ordre de publication.
- Versionné dans git : `script.md`, `montage.json`, `transcript.json`, scénarios de capture. **Jamais** les médias lourds : `videos/*/media/`, `videos/*/brand/`, `videos/*/renders/`, `*.mp4` sont ignorés (voir `.gitignore`). Les rushs se partagent par Google Drive.
- Format par défaut : **9:16, 1080×1920, 30 i/s**, son AAC. Durée cible 30–60 s pour un Reel.
- Rendu final : `videos/<nn-slug>/renders/<nn-slug>-v<n>.mp4` ; on garde les versions.
- Outils requis : Node 22+, `ffmpeg`/`ffprobe` (`apt-get install -y ffmpeg` dans un conteneur neuf), Chromium (préinstallé), `npx hyperframes` (téléchargé à la volée). Vérifier avec `npx hyperframes doctor`.
- Les montants, le mode de lancement et les CTA viennent de `src/config/offer.ts` et `src/content/fr/landing.ts` : on les relit au moment d'écrire le script, on n'invente jamais un prix, un chiffre, un avis ou un logo client (règle du site, `docs/DESIGN.md`).
- Aucune donnée réelle de cliente à l'écran : captures sur l'établissement de démonstration (données fictives type « Maison Alba », « Julie Martin »).

## Règles de qualité (toutes vidéos)

- Le **hook** tient dans les 2 premières secondes, à l'oral **et** à l'écran (bandeau titre).
- Sous-titres toujours présents (80 % des Reels sont vus sans le son), relus mot à mot (noms propres : « Reso », « Ludivine »).
- Un changement visuel toutes les 2–4 s (layout, zoom, capture, pastille) — jamais plus de 5 s sur le même plan fixe.
- Rien d'important dans les zones couvertes par l'interface Instagram/TikTok (voir `/reso-video-charte`).
- Fin sur la carte Reso + un seul appel à l'action.
- Avant de présenter une vidéo : `lint` à 0 erreur, planche contact relue, son vérifié (voix audible, musique à −20 dB sous la voix environ), durée conforme.
