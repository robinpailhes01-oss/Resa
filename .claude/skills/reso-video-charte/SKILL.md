---
name: reso-video-charte
description: Charte vidéo de Reso — couleurs, police Manrope, logo, style des sous-titres, pastilles flottantes, cartes texte, carte de fin, zones sûres Instagram Reels / TikTok / Shorts, ton de voix et règles de contenu (pas de faux chiffres ni faux avis). À utiliser pour toute vidéo ou tout visuel animé Reso, et dès qu'on règle un choix graphique dans un montage HyperFrames.
---

# Charte vidéo Reso

Les vidéos prolongent la landing (`docs/DESIGN.md`) : lumineuses, sobres, centrées sur le produit, avec des dégradés doux lavande / pêche / bleu glacé. Le violet est un accent, jamais un aplat de fond.

## Fichiers

- `assets/fonts/manrope.woff2` — Manrope variable (200–800), licence OFL jointe. Toujours embarquée localement (`@font-face`), jamais par Google Fonts : HyperFrames exige des polices locales pour un rendu déterministe.
- `assets/logo.svg` (symbole violet + « reso » noir) et `assets/logo-white.svg` (sur fond sombre ou vidéo).
- Le générateur `/reso-facecam-app` applique déjà toute cette charte ; ce skill sert de référence quand on crée autre chose ou qu'on ajuste un montage.

## Couleurs

| Rôle | Valeur |
| --- | --- |
| Fond de page / scène | `#FAFAFC` + dégradé mesh (ci-dessous) |
| Surfaces (cartes, pastilles, sous-titres) | `#FFFFFF`, bordure `#E8E8EE` |
| Texte, boutons | `#111116` ; secondaire `#6F707C` |
| Accent (mot actif des sous-titres, kicker, icône) | `#6C4FF8` ; appuyé `#4F36DB` |
| Lavande | `#E9E3FF` / `#F3F0FF` |
| Pêche | `#FFE8DA` / `#F4B28F` |
| Menthe | `#DDF5E8` / `#7FD0A4` |
| Bleu glacé | `#DDEBFF` |

Dégradé de scène (celui du hero, un peu renforcé pour la vidéo) :

```css
background:
  radial-gradient(circle at 16% 22%, rgba(108, 79, 248, 0.26), transparent 38%),
  radial-gradient(circle at 86% 30%, rgba(255, 190, 150, 0.32), transparent 36%),
  radial-gradient(circle at 50% 86%, rgba(130, 170, 255, 0.28), transparent 44%),
  #FAFAFC;
```

Ombres : larges, diffuses, teintées violet (`0 18px 40px -16px rgba(60,40,140,.3)`), jamais noires et dures.

## Typographie (canevas 1080×1920)

| Élément | Taille | Graisse | Interlettrage |
| --- | --- | --- | --- |
| Carte texte (titre plein écran) | 104–120 px | 800 | −0,04 em, interligne 0,98 |
| Bandeau hook (haut d'écran) | 48–54 px | 800 | −0,02 em |
| Sous-titres | 56–64 px | 800 | −0,02 em |
| Kicker / pastille | 28–34 px | 700 | +0,02 em |
| Texte secondaire | 38–44 px | 500 | 0 |

Jamais sous 28 px : sur téléphone, en dessous, c'est illisible.

## Sous-titres

- Pilule blanche (`rgba(255,255,255,.95)`, rayon 26 px, ombre douce), texte `#111116` en Manrope 800 : lisible sur la face caméra comme sur l'app claire.
- **Mot en cours en violet `#6C4FF8`** (effet karaoké), 2 à 4 mots par ligne, une seule ligne, ≤ 24 caractères.
- Mots clés (`emphasis`) : surlignés lavande `#E9E3FF`, texte `#4F36DB`. 1 à 2 par phrase au plus.
- Tics de langage retirés (« euh », « ben »…) ; ponctuation française avec espace insécable avant `? ! :`.
- Position : centre de la ligne à y≈1300 sur la face caméra plein écran, y≈1500 sur les écrans d'app, sur la couture en mode split.

## Zones sûres 9:16 (Reels / TikTok / Shorts)

```
y 0–200     barre du haut (compte, son)            → rien d'important
y 200–1560  zone utile                             → hook, sous-titres, app
y 1560–1920 légende, bouton « suivre »             → rien d'important
x 930–1080 sous y≈1000 : icônes j'aime / commentaire / partage → pas de texte
```

La grille de l'Instagram évolue : en cas de doute, faire une capture d'un Reel publié et la superposer à un `snapshot`.

## Éléments de marque

- **Pastille flottante** (la « float card » de la landing) : carte blanche, icône dans un carré teinté (lavande, pêche, menthe, bleu), titre 34 px + ligne secondaire ; entrée avec léger rebond et rotation −1,5°, dérive lente. Contenus type : « Nouvelle réservation en ligne · Il y a 2 minutes », « Rappel par email envoyé · Julie Martin · demain 09:00 ». Toujours des données fictives.
- **Téléphone** : cadre noir `#111116`, rayons 64/50 px, encoche, ombre violette. **Fenêtre** (captures bureau) : barre à trois points gris, rayon 24 px.
- **Bulle de Ludivine** : cercle 300 px, anneau blanc 10 px, en bas à gauche (hors zone des icônes à droite).
- **Carte de fin** : logo (460 px de large), promesse « Votre agenda. L'esprit libre. », bouton noir avec le CTA du mode en cours, URL en gris.

## Mouvement

- Entrées 0,4–0,6 s, `power3.out` ; changements de layout 0,5 s `power3.inOut`.
- Texte des cartes : apparition mot par mot, flou 6 px → net (comme `BlurWords` sur la landing), 60 ms entre les mots.
- Zooms « punch-in » sur la face caméra : coupe franche ×1,08–1,15 pour relancer l'attention, pas de zoom lent continu.
- Rien ne boucle à l'infini (`repeat: -1` interdit par HyperFrames).

## Ton et contenus

- Vouvoiement, phrases courtes, concret, chaleureux ; on parle du quotidien d'une pro de la beauté (messages le soir, lapins, oublis), pas de jargon « SaaS ».
- Vocabulaire du site : « rendez-vous », « clientes », « praticiens », « lien de réservation », « emails automatiques ».
- Prix, nombre de praticiens, durée d'essai, CTA : **uniquement** depuis `src/config/offer.ts` / `src/content/fr/landing.ts` (mode `prelaunch` → « Me prévenir du lancement » ; mode `live` → « Essayer gratuitement » / « Créer mon compte »).
- Interdits : faux témoignages, faux chiffres (« +40 % de réservations »), logos de partenaires, captures avec de vraies clientes, comparaison nominative dénigrante d'un concurrent.
