---
version: 1
name: Reso — « J'ai 45 secondes » (écran 16:9 ultra dynamique)
unit: the frame — 1920×1080 (rendu 3840×2160)

colors:
  stage: "#617990"        # fond uni bleu poudré (la « couleur unique » de la référence, version Reso)
  stage-light: "#7D93A8"  # haut du dégradé, halo
  stage-deep: "#4A6179"   # bas / coins
  cream: "#FBF6EA"        # texte principal
  cream-dim: "rgba(251,246,234,0.38)"  # mots pas encore dits (karaoké)
  card: "#FFFDF8"
  border: "#E7DFD0"
  ink: "#1F2733"
  muted: "#5F6672"
  slate: "#4A6179"
  alert: "#D65A4A"        # badges rouges de notifications (problème) + bouton café raté
  sticker: "#F3D36B"      # sticker « BIENTÔT » / « PAS ENCORE » (jaune doux, texte encre)
  success: "#2F7D5B"

fonts:
  display: "Outfit 700 (assets/fonts/outfit.woff2), tracking -0.035em, très gras et arrondi comme la référence"
  ui: "Manrope 400/600 — textes des interfaces"
  mono: "JetBrains Mono 500 — compte à rebours"
---

# Direction

**Le principe de la référence, aux couleurs Reso** : un fond uni bleu poudré (dégradé radial léger `#7D93A8` en haut → `#617990` → `#4A6179` aux bords), une typographie crème très grasse, **une seule idée à l'écran à la fois**, des cartes d'interface qui volent, s'empilent et sortent vite. Rythme serré, chaque élément arrive sur le mot de la voix.

**Compte à rebours** (présent dans toutes les frames, identique) : pastille en haut à droite (x≈1690, y≈64, 176×56, rayon 28), fond crème 16 % + liseré crème 30 %, icône chronomètre + texte mono crème « 0:45 ». Valeur affichée = `max(0, 45 − floor(t_global))` au format `0:SS` ; elle décompte en temps réel. Quand elle atteint 0:00 (t ≥ 45 s), la pastille passe en rouge doux `#D65A4A` et affiche « +0:0N » (dépassement, clin d'œil). Chaque frame connaît son début global (`global_start` dans le storyboard) et calcule la valeur à partir de son temps local — déterministe, pas de `Date`.

**Karaoké de mots** : les phrases clés à l'écran sont écrites entières, les mots pas encore dits en `cream-dim`, chaque mot passe en crème plein (+ légère montée 6px) sur son temps de voix. Titres 92–120px, au plus deux lignes, centrés.

**Cartes** : fond `#FFFDF8`, rayon 22px, ombre portée longue `0 30px 80px rgba(31,39,51,0.28)`, légère rotation (±2–6°) quand elles s'empilent, entrées rapides `expo.out` 0.35–0.5s avec léger dépassement d'échelle 1.04→1 (pas de `back`/`elastic`), sorties en 0.25s (glisse + flou). Captures réelles Reso dans des fenêtres (barre à 3 pastilles) ou téléphones (cadre encre, rayons 56/44).

**Stickers** : rectangle jaune doux `#F3D36B`, texte encre Outfit 700 capitales « BIENTÔT » (ou « PAS ENCORE »), rotation −8°, ombre courte, arrivée en tampon (scale 1.6→1 en 0.18s + petite secousse de la carte). C'est le marqueur d'honnêteté : toute fonctionnalité à venir le porte.

**Interdits** : logos de marques tierces (Instagram, Google, ChatGPT…) → icônes génériques + texte ; néons ; violet ; cerveau/robot ; interface inventée pour une fonctionnalité *disponible* (on montre les vraies captures) ; présenter une fonctionnalité à venir sans sticker « BIENTÔT ».
