---
version: 1
name: Reso — éditorial ivoire (Reel 9:16)
unit: the frame — 1080×1920 (rendu 2160×3840)

colors:
  ivory: "#FBF6EA"        # fond principal, très épuré
  ivory-deep: "#F4EDDF"   # dégradé doux du fond
  stone: "#E6DCCB"        # socles pierre (comme la landing)
  card: "#FFFDF8"         # cartes / écrans
  border: "#E7DFD0"
  slate: "#4A6179"        # bleu ardoise : accents, boutons, étapes
  slate-soft: "#617990"   # bleu grisé : panneau poudré (hook, final)
  slate-deep: "#3E5166"
  ink: "#1F2733"          # textes
  muted: "#5F6672"
  success: "#2F7D5B"      # coche / confirmé (vert de l'app)
  success-tint: "#E7F2EC"
  chrome-1: "#F5F3EF"     # touches chrome : dégradés métalliques très doux
  chrome-2: "#C9C6C0"
  chrome-3: "#8E8B86"

fonts:
  display: "Outfit 500, tracking -0.03em (assets/fonts/outfit.woff2)"
  ui: "Manrope 400/600 (assets/fonts/manrope.woff2) — texte des interfaces"
  label: "JetBrains Mono 500, capitales espacées 0.14em (assets/fonts/jetbrainsmono.woff2) — étiquettes « 01 »"
---

# Direction

**Esprit** : publicité produit premium (Apple / Linear) transposée à l'univers beauté éditorial de Reso. Beaucoup d'air, une idée par plan, des interfaces vivantes. Jamais de néon, de violet, de « IA », de robots, d'explosion de notifications.

**Fond** : ivoire `#FBF6EA` avec un dégradé radial très doux vers `#F4EDDF` sur les bords, grain photographique discret (bruit SVG feTurbulence statique, opacité 0.035–0.05, mélange `multiply`). Les interfaces sont posées sur des **socles pierre** (`stone` `#E6DCCB`, rayon 44px) comme sur la landing, avec ombre longue et douce (0 40px 80px rgba(31,39,51,0.12)). Le hook et la carte finale utilisent le **panneau poudré** : aplat bleu grisé `#617990` → `#4A6179`, texte crème.

**Touches chrome** : liseré métallique sur le cadre du téléphone (dégradé `chrome-1 → chrome-2 → chrome-3 → chrome-2`), reflet qui balaie une fois un élément clé (sheen 0.6s). Rien d'autre de brillant.

**Typographie** : titres Outfit 500, encre `#1F2733` sur ivoire (crème sur le panneau), 84–118px, interlignage 1.04, tracking −0.03em, au plus 3 lignes. Étiquettes d'étape en mono : « 01 », « 02 », « 03 » + filet + texte discret (« Collez votre fiche Google »), 26–30px, couleur `slate`. Les textes d'interface reprennent exactement ceux de l'app (Manrope).

**Interfaces** : on reproduit fidèlement les vrais composants Reso (voir `STORYBOARD.md`, chaque frame cite le composant source et ses textes exacts) ou on utilise les vraies captures `assets/*.png`. Cartes `#FFFDF8`, liseré `#E7DFD0`, rayon 16–24px, champs de formulaire hauteur 96px (≈ 48px CSS de l'app ×2), boutons pilule encre `#1F2733` texte blanc. Rien d'inventé : pas de fonctionnalité, pas de logo importé, pas de chiffre qui n'est pas dans l'app de démo.

**Mouvement** : courbes `power3.out` / `expo.out`, aucune `back` / `elastic`. Zooms de caméra précis vers l'élément qui compte (`coordinate-target-zoom`), légère perspective 3D (rotateX/Y ≤ 12°), champs qui se remplissent caractère par caractère, coches qui se posent, curseur fin crème à pointe encre quand il clique. Transitions entre plans : un élément porte la continuité (match cut, zoom à travers un élément, la fenêtre devient téléphone). Accélérer seulement pour montrer la rapidité (remplissage des champs).

**Zones sûres Reels** (1080×1920) : rien d'important au-dessus de y 200 ni au-dessous de y 1560 ; pas de texte dans x 930–1080 sous y 1000. Marges latérales ≥ 72px.

**Données fictives de démo** (cohérentes partout) : Maison Alba · Institut de beauté · 12 rue de l'Aiguillerie, 34000 Montpellier · 04 67 00 00 00 · 4,9 ★ (128 avis) · équipe Camille (esthéticienne) et Inès (prothésiste ongulaire) · cliente Julie Martin · julie.martin@example.com.
