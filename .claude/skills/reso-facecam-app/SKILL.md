---
name: reso-facecam-app
description: Monter une vidéo Reso où Ludivine (ou une autre personne) parle face caméra pendant que l'app est montrée en fond, en plein écran, en écran partagé ou avec Ludivine en bulle — sous-titres karaoké, bandeau hook, pastilles flottantes, cartes texte, zooms, carte de fin — en 9:16 avec HyperFrames. Couvre dérushage, transcription française, plan de montage (montage.json), génération, contrôle et rendu. À utiliser pour tout Reel / TikTok / Short « face caméra + démo produit » ou vidéo d'explication du concept.
---

# Face caméra + app (9:16)

Le montage type : Ludivine explique le concept face caméra ; selon le moment, l'app apparaît **derrière elle, à côté, ou en plein écran avec Ludivine en bulle** ; les sous-titres suivent chaque mot. Tout est décrit dans un fichier `montage.json`, que `scripts/build-montage.mjs` transforme en composition HyperFrames (`index.html`). On ne réécrit pas le HTML à la main : on modifie `montage.json` et on régénère.

Prérequis : lire `/reso-video` (conventions) ; `ffmpeg`, Node 22+, `npx hyperframes doctor` au vert. Le script et les rushs viennent de `/reso-script-reel`, les captures de `/reso-capture-app`.

## Les layouts

| `layout` | À l'écran | Quand |
| --- | --- | --- |
| `face` | Ludivine plein écran (option `zoom` : 1,08–1,15 en coupe franche) | hook, émotion, problème, appel à l'action |
| `app` | l'app en grand (téléphone / fenêtre / plein cadre) sur le dégradé Reso, **Ludivine en bulle** en bas à gauche | démonstration pendant qu'elle commente |
| `app-only` | l'app seule, sans bulle | geste à voir en détail, plan court |
| `split` | app en haut (54 %), Ludivine en bas | explication qui dure, « regardez » |
| `cutout` | **Ludivine détourée devant l'app** (l'app en fond, penchée) | effet « elle présente l'écran derrière elle » ; nécessite `face.cutout` |
| `card` | carte texte plein écran (kicker, titre mot par mot, sous-titre), Ludivine en bulle | idée clé, prix, liste de bénéfices |
| carte de fin | logo, promesse, CTA, URL (`endCard`, ajoutée après la voix) | toujours |

La voix de Ludivine joue en continu du début à la fin : les layouts ne changent que l'image.

## Étapes

### 1. Dossier de travail

```bash
mkdir -p videos/01-concept/media/{rushes,app} videos/01-concept/captures
```

Rushs dans `media/rushes/`, captures d'app dans `media/app/` (voir `/reso-capture-app`).

### 2. Dérushage → `media/face.mp4`

a. Assembler les prises retenues (même réglage caméra) et normaliser : 1080×1920, 30 i/s, images clés denses (sinon HyperFrames fige l'image à la recherche), son normalisé à −16 LUFS.

```bash
cd videos/01-concept
# une seule prise :
ffmpeg -i media/rushes/prise-03.mov \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" \
  -c:v libx264 -crf 18 -g 30 -keyint_min 30 -pix_fmt yuv420p \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k -movflags +faststart media/raw.mp4
# plusieurs prises : les normaliser chacune, puis
# printf "file '%s'\n" media/p1.mp4 media/p2.mp4 > list.txt && ffmpeg -f concat -safe 0 -i list.txt -c copy media/raw.mp4
```

Vérifier la rotation (vidéos iPhone) et que le visage est bien dans le tiers haut.

b. Transcrire le brut **en français** (jamais un modèle `.en`, qui traduirait en anglais) :

```bash
npx hyperframes transcribe media/raw.mp4 --model small --language fr -d media/raw-tr
```

c. Couper les silences, les faux départs et les prises ratées à partir de la transcription (script officiel `media-use`) :

```bash
node ../../.claude/skills/media-use/scripts/transcript-cut.mjs \
  --input media/raw.mp4 --transcript media/raw-tr/transcript.json \
  --cut-silence 0.45 --remove-fillers "euh,heu,hum,ben,bah" \
  --remove "12.40-15.10,31.00-33.20" --plan        # relire le plan, puis sans --plan :
node ../../.claude/skills/media-use/scripts/transcript-cut.mjs … --out media/face.mp4
```

Les plages `--remove` (secondes) retirent les phrases ratées repérées en lisant la transcription. Un Reel est rythmé : silence max ~0,45 s entre deux phrases. Ré-encoder ensuite `media/face.mp4` avec les options de l'étape a (`-g 30`) si la coupe a été faite en `--copy`.

### 3. Transcription finale → `transcript.json`

Retranscrire la vidéo **coupée** (les horodatages doivent correspondre à `face.mp4`) :

```bash
npx hyperframes transcribe media/face.mp4 --model small --language fr -d .
```

Puis relire `transcript.json` (tableau `[{ text, start, end }]`) et corriger le texte **sans toucher aux temps** : « Reso » (souvent entendu « réso », « rézo »), « Ludivine », « 24h/24 », prix, ponctuation. Les corrections récurrentes peuvent aussi aller dans `captions.replace`. Si la qualité est mauvaise (bruit, musique), réessayer avec `--model medium`.

### 4. Plan de montage → `montage.json`

Partir de `templates/montage.example.json`. Pour placer les coupes, lire la transcription avec ses temps et caler chaque `start` **sur le début d'un mot** (un changement de plan sur un mot fort est plus propre qu'en plein milieu).

```jsonc
{
  "id": "01-concept",
  "title": "Reso — le concept",
  "fps": 30,
  "face": {
    "src": "media/face.mp4",
    "focusY": 32,              // % de hauteur où est le visage (cadre de la bulle et du split)
    "bubbleCrop": 0.62,        // part de la largeur gardée dans la bulle (plus petit = visage plus gros)
    "splitFocusY": 36,         // cadrage vertical en écran partagé (défaut = focusY) : visage + bouche visibles
    "cutout": "media/face-cutout.webm"   // optionnel, pour le layout cutout
  },
  "transcript": "transcript.json",
  "captions": {
    "enabled": true, "maxWords": 4, "maxChars": 24,
    "emphasis": ["agenda", "automatiquement"],       // mots surlignés (1–2 par phrase max)
    "replace": { "réso": "Reso" },                    // corrections d'affichage
    "drop": ["euh", "heu", "hum", "ben", "bah"]       // tics masqués
  },
  "music": { "src": "media/music.mp3", "volume": 0.07, "from": 0 },   // optionnel
  "segments": [
    { "start": 0, "layout": "face", "title": "Vos soirées à répondre aux messages ?" , "titleDuration": 2.5 },
    { "start": 2.4, "layout": "face", "zoom": 1.12 },
    { "start": 5.1, "layout": "app",
      "app": { "src": "media/app/reservation-mobile.mp4", "frame": "phone", "from": 0.5,
               "zoom": { "at": 2.0, "scale": 1.5, "origin": "50% 60%" } },
      "chips": [ { "at": 1.5, "icon": "calendar", "title": "Nouvelle réservation", "text": "Il y a 2 minutes" } ] },
    { "start": 11.8, "layout": "split", "app": { "src": "media/app/agenda-desktop.mp4", "frame": "window", "aspect": 1.6 } },
    { "start": 16.2, "layout": "card", "captions": false,
      "card": { "kicker": "Emails automatiques", "text": "Confirmation, rappel, avis.", "sub": "Envoyés tout seuls, au bon moment." } },
    { "start": 24.0, "layout": "face" }
  ],
  "endCard": { "duration": 2.5, "line": "Votre agenda. L’esprit libre.", "cta": "Me prévenir du lancement", "url": "reso-app.fr" }
}
```

Référence des champs :

- Segment : `start` (s, dans `face.mp4`), `layout`, puis selon le cas `app`, `card`, `title` (+ `titleDuration`), `chips`, `zoom` (face), `captions: false` (masque les sous-titres du segment, par ex. sur une carte qui dit déjà la phrase). Un segment dure jusqu'au `start` suivant ; le dernier jusqu'à la fin de la voix.
- `app` : `src` (mp4/webm ou png/jpg/webp ; une image reçoit un zoom lent sauf `kenBurns: false`), `frame` (`phone` | `window` | `full`), `aspect` (largeur/hauteur de la capture : 390/844 par défaut en phone, 1,6 en window), `from` (s d'entrée dans la capture), `position` (`object-position`, défaut haut de l'écran), `zoom`, `box` ({x,y,w,h} pour forcer l'emplacement).
- `chips` : `at` (s depuis le début du segment), `duration` (2,4 s), `icon` (`calendar`, `mail`, `check`, `bell`, `link`, `star`, `clock`, `message`, `phone`), `title`, `text`, `tint` (0–3), `pos` ({x,y}).
- La capture doit durer au moins autant que son segment (sinon dernière image figée) : `ffprobe` en cas de doute.
- Les CTA, prix et promesses viennent de `src/config/offer.ts` / `src/content/fr/landing.ts` (voir `/reso-video-charte`).

**Rythme** (Reel de 30–60 s) : un changement visuel toutes les 2–4 s ; alterner face ↔ app ; `face` + `title` sur les 2 premières secondes ; jamais deux cartes texte à la suite ; zooms de relance sur les longues phrases face caméra ; revenir en `face` pour l'appel à l'action (la confiance passe par le visage).

### 5. Générer, vérifier, prévisualiser

```bash
S=.claude/skills/reso-facecam-app/scripts
node $S/build-montage.mjs videos/01-concept --plan   # découpage + sous-titres, sans rien écrire
node $S/build-montage.mjs videos/01-concept          # → index.html + brand/
npx hyperframes lint videos/01-concept               # 0 erreur exigée
npx hyperframes snapshot videos/01-concept --at 1,4,8,12,16,20   # un instant par segment
```

Relire `videos/01-concept/snapshots/contact-sheet.jpg` **image par image** : visage bien cadré dans la bulle et le split (sinon ajuster `focusY` / `bubbleCrop`), sous-titres lisibles et hors zones Instagram, rien de coupé, pastilles qui ne masquent pas l'info de l'app, textes justes.

Avertissements de lint attendus et sans gravité : `nested_structure_needs_subcomposition` (cartes, pastilles, carte de fin) et `timeline_track_too_dense` (nombreux sous-titres). Toute **erreur** doit être corrigée.

Faire valider par l'équipe : `npx hyperframes preview videos/01-concept --background` (Studio, lecture avec le son) — ou un rendu `--quality draft` à envoyer.

### 6. Rendu

Seulement après validation :

```bash
npx hyperframes render videos/01-concept --quality delivery --output videos/01-concept/renders/01-concept-v1.mp4
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of compact videos/01-concept/renders/01-concept-v1.mp4
```

Vérifier : durée = voix + carte de fin, 1080×1920, une piste audio, écouter le début et la fin. Sous Linux sans GPU le rendu est lent (≈ 1–3 min pour 30 s en draft) : c'est normal.

## Options

- **Ludivine détourée** (`cutout`) : `npx hyperframes remove-background media/face.mp4 -o media/face-cutout.webm --quality best` (long sur CPU : lancer en arrière-plan), puis `face.cutout`. Fonctionne mieux sur fond uni et bien éclairé.
- **Musique** : fond discret sans paroles (`npx hyperframes media-use resolve --type bgm --intent "soft upbeat lofi, warm, no vocals" --project videos/01-concept`), `volume` 0,05–0,08. Pour un vrai ducking, voir `/hyperframes-audio`.
- **Retouches fines** (position d'un élément, effet non prévu) : ajouter l'option dans `build-montage.mjs` plutôt qu'éditer `index.html`, qui est écrasé à chaque génération. Contrat HyperFrames : `/hyperframes-core` (un seul timeline GSAP en pause, pas de `left/top` animés, vidéos muettes + `<audio>` séparé, pas de `Math.random`).
- **Autres formats** (4:5 feed, 16:9 YouTube) : le générateur est calé sur 9:16. Pour un autre format, adapter la géométrie en tête de `build-montage.mjs` (`W`, `H`, `LAYOUTS`, `shotBox`) ou partir de `/talking-head-recut`.
