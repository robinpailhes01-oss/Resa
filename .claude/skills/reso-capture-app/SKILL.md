---
name: reso-capture-app
description: Filmer l'application Reso ou sa landing pour les vidéos — parcours de réservation sur mobile, agenda, emails, page de réservation publique — en vidéo nette 1170×2532 (et images fixes) à partir d'un scénario JSON rejoué par Playwright. À utiliser dès qu'un montage doit « montrer l'app », qu'il faut une capture d'écran animée, un screen recording ou des images de l'interface pour un Reel.
---

# Capturer l'app Reso pour les vidéos

`scripts/capture-app.mjs` rejoue un **scénario** (aller sur une page, cliquer, taper, défiler, attendre) dans Chromium et produit :

- `<name>.mp4` — le parcours filmé, **1170×2532** pour un téléphone (390×844 CSS × 3), 30 i/s, images clés denses (prêt pour HyperFrames) ;
- `<name>-<shot>.png` — une image nette à chaque étape `{ "shot": "…" }` (utilisable en plan fixe avec léger zoom).

Pourquoi un script plutôt qu'un enregistrement d'écran à la main : c'est rejouable (on refait la capture après chaque évolution de l'interface), net, sans notification ni curseur parasite, et toujours sur les données de démonstration.

> Technique : la vidéo native de Playwright et le screencast Chrome sont limités aux pixels CSS (390 px de large, flou en Reel). Le script filme donc « au ralenti » : animations CSS ralenties ×5 (`slow`), défilements et frappes étirés d'autant, captures d'écran en boucle, puis horodatage ramené au temps réel. Une minute de capture pour ~12 s de vidéo : c'est normal.

## 1. Préparer l'app

1. **Jamais de vraies données** : utiliser un compte de démonstration (établissement fictif « Maison Alba », praticiens Camille/Sophie, cliente « Julie Martin »…). `node scripts/recette-app.mjs` crée un tel compte sur une base de test.
2. Lancer l'app en **production** de préférence (`npm run build && npm start`) : pas d'indicateur de dev, pages plus rapides. En `npm run dev`, le script masque la pastille Next « N » mais la première compilation allonge les attentes.
3. Landing seule : aucune base nécessaire. App (`/app/*`, `/r/<slug>`) : `DATABASE_URL` + `npm run db:migrate`.
4. Choisir le mode d'affichage voulu (`RESO_LAUNCH_MODE=prelaunch|live`) : les CTA filmés doivent correspondre à ceux dits dans la vidéo.

## 2. Écrire le scénario

Un fichier JSON par capture, rangé dans `videos/<nn-slug>/captures/`. Modèles testés ou prêts dans `scenarios/` :

| Modèle | Contenu | Prérequis |
| --- | --- | --- |
| `landing-mobile.json` | hero, agenda animé, fonctionnalités (testé) | aucun |
| `reservation-mobile.json` | page publique : prestation → praticien → créneau → coordonnées | base + établissement `maison-alba` |
| `agenda-desktop.json` | connexion puis agenda du jour | base + compte démo (remplir identifiants) |

```json
{
  "name": "reservation-mobile",
  "viewport": "mobile",            // mobile 390×844 | tablet 820×1180 | desktop 1440×900 | {width,height,isMobile,hasTouch}
  "videoScale": 3,                 // défaut 3 → 1170×2532 ; 2 suffit en desktop (2880×1800)
  "slow": 5,                       // facteur de ralenti de capture (plus haut = plus fluide, plus long)
  "trimStart": 0.4,                // secondes coupées au début de la vidéo (page blanche)
  "tail": 800,                     // ms tenues à la fin
  "stills": true, "video": true,
  "steps": [
    { "goto": "/r/maison-alba" },
    { "wait": 1200 },
    { "shot": "prestations" },
    { "click": "a[href*='service=']" },
    { "click": "a[href*='praticien=']", "optional": true },
    { "type": ["input[name='firstName']", "Julie"], "delay": 70 },
    { "scroll": 600, "duration": 1500 },
    { "reveal": true },
    { "login": { "email": "…", "password": "…" } }
  ]
}
```

Étapes disponibles : `goto`, `wait` (ms), `click` (+ `optional`), `hover`, `fill` (instantané), `type` (lettre par lettre, visible), `press` (touche), `scroll` (px, défilement adouci sur `duration` ms), `reveal` (force les apparitions différées de la landing), `login`, `shot` (+ `fullPage`). Chaque étape est suivie d'une petite pause (`pause`, 250 ms par défaut ; `0` pour enchaîner).

Règles pour une capture qui passe bien en vidéo :

- **Un geste = une idée** : une capture de 4–10 s par moment du script, pas un long parcours.
- Laisser respirer : `wait` de 800–1500 ms après chaque changement d'écran, pour que l'œil lise.
- Préférer `type` à `fill` quand la saisie fait partie de l'histoire (« Julie réserve »).
- Défilements lents (≥ 1200 ms pour 600 px) : un défilement rapide devient illisible une fois réduit dans le téléphone du montage.

## 3. Lancer

```bash
node .claude/skills/reso-capture-app/scripts/capture-app.mjs videos/01-concept/captures/reservation-mobile.json \
  --out videos/01-concept/media/app --base http://localhost:3000
```

Puis contrôler : `ffprobe` (taille, durée) et une planche contact
`ffmpeg -i <name>.mp4 -vf "fps=1,scale=180:-1,tile=8x2" -frames:v 1 sheet.png` à relire. Vérifier : pas de pastille de dev, pas d'erreur à l'écran, textes et CTA conformes au mode voulu, aucune donnée réelle.

## 4. Dans le montage

- Mobile → `"frame": "phone"` (téléphone détouré sur le dégradé Reso) ; bureau → `"frame": "window"` avec `"aspect": 1.6` ; plein cadre → `"frame": "full"`.
- `"from"` choisit le point d'entrée dans la capture, `"zoom"` fait un zoom avant sur un détail (`{ "at": 1.2, "scale": 1.6, "origin": "50% 40%" }`).
- Voir `/reso-facecam-app` pour le format complet de `montage.json`.
