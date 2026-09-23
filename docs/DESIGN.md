# Reso — direction de design de la landing page

## Direction retenue — 23 septembre 2026

Landing de pré-lancement au niveau d’un SaaS mature : lumineuse, sobre, centrée sur le produit, dans l’esprit d’Apple et d’une page produit soignée. Plus colorée que la version précédente grâce à des dégradés doux (lavande, bleu glacé, pêche), mais toujours très épurée : la couleur structure la page et met le produit en valeur. Le fond beige, les aplats prune, les cercles concentriques et les icônes flottantes sont retirés. L’agenda, cœur du produit, est visible dès le premier écran.

La cible reste le professionnel de la beauté, seul ou en petite équipe. L’action principale est « Me prévenir du lancement ». Le prix et la limite de praticiens sont centralisés dans `src/config/offer.ts` (39 € HT / mois, un établissement, jusqu’à trois praticiens) et tous les textes dans `src/content/fr/landing.ts`. Aucun témoignage, chiffre, note, logo ou partenariat fictif.

## Composition

1. **Navigation** (`src/components/landing/Header.tsx`) : barre qui se transforme au scroll. En haut de page, elle occupe toute la largeur sur fond transparent ; après 8 px, elle devient une capsule flottante blanche translucide avec flou (`backdrop-filter`), bordure très fine et ombre douce ; en défilant vers le bas au-delà de 160 px, elle se resserre sur le logo et le CTA (les liens réapparaissent dès que l’on remonte). Le lien de la section visible est souligné (`aria-current="location"`). Même largeur que le contenu (1120 px), logo à gauche, liens Produit / Fonctionnalités / Avis / Tarif, CTA noir à droite, menu tactile sur téléphone. Les ancres portent une marge (`--nav-offset`) : aucun titre de section ne passe sous la barre.
2. **Premier écran** : dégradé mesh très doux (lavande à gauche, pêche à droite, bleu glacé en bas, centre blanc) et deux halos en simples dégradés radiaux, sans filtre de flou. Badge, titre en deux lignes (42 → 76 px, graisse 700, interligne 0,98), description, CTA noir avec légère profondeur, bouton secondaire blanc, ligne de réassurance. La fenêtre blanche de l’agenda sort du dégradé, qui se fond vers le fond de page (bordure fine, coins de 24 px, ombre diffuse, inclinaison de 3° à partir de 1024 px). Sur téléphone, l’agenda commence vers 480 px et les boutons sont pleine largeur.
3. **Cartes flottantes** (`src/components/landing/FloatCard.tsx`) : « Nouvelle réservation en ligne » et « Rappel par email envoyé » devant l’agenda, puis une pastille par bloc produit. Fond blanc, bordure légère, ombre fine, icône colorée, rotation de 1 à 2°, dérive très lente de 5 px. Aucun texte manuscrit.
4. **Aperçu de l’agenda** (`src/components/previews/AgendaPreview.tsx`) : HTML/CSS uniquement, données fictives (Maison Alba, Camille et ses clientes). Trois praticiens à partir de 576 px de largeur de cadre, la journée de Camille seule en dessous et dans la vue rapprochée. Rendez-vous lavande, pêche et menthe avec barre colorée, grille fine, textes de 11 px minimum, photo du salon et portrait fictif de Camille.
5. **Fonctionnalités** : un grand bloc éditorial sur fond lavande → bleu glacé (label, titre, texte, journée de Camille qui dépasse du conteneur, pastille « 3 rendez-vous aujourd’hui »), puis deux cartes « spotlight » (`src/components/ui/SpotlightCard.tsx`) : un halo lavande suit le pointeur sur la carte survolée. Réservation en ligne (halo pêche) et emails (chips Confirmation / Rappel / Demande d’avis, email de confirmation, halo bleu glacé).
6. **Comment ça marche** (`src/components/landing/HowItWorks.tsx`, ancre `#etapes`) : trois étapes numérotées 01 → 03 reliées par un trait fin (Configurez votre espace, Partagez votre lien, Retrouvez vos rendez-vous), sur fond de page.
7. **Avis** : section dédiée avant le tarif, sur un dégradé violet profond → bleu, texte blanc, grande citation abstraite. Tant que `src/content/fr/testimonials.ts` est vide, le bloc de pré-lancement s’affiche ; dès qu’un témoignage autorisé est ajouté (citation, prénom, établissement, activité, photo facultative), des cartes le remplacent automatiquement.
8. **Tarif** : grande carte horizontale sur fond lavande / bleu / pêche très doux, pastille « Tout inclus » ; à gauche label, titre, prix, périmètre ; à droite quatre inclusions et le CTA. Précisions de transparence en dessous.
9. **Pied de page** léger : logo, liens de sections et liens légaux. La FAQ et le formulaire de préinscription vivent sur `/preinscription`, ouverte par tous les CTA avec les paramètres de campagne.

## Tokens

| Usage | Valeur |
| --- | --- |
| Fond général | `#FAFAFC` |
| Surfaces | `#FFFFFF` |
| Noir : titres et boutons principaux | `#111116` |
| Gris texte | `#6F707C` |
| Violet principal (sélection, icône, lien, détail d’agenda) | `#6C4FF8` |
| Violet profond (section Avis) | `#4F36DB` |
| Lavande | `#E9E3FF` (très claire `#F3F0FF`) |
| Bleu glacé | `#DDEBFF` |
| Pêche très clair | `#FFE8DA` / barre `#F4B28F` |
| Vert menthe très clair | `#DDF5E8` / barre `#7FD0A4` |
| Bordures | `#E8E8EE` |

Rayons : sections 28–32 px, cartes 24–28 px, boutons 14 px, pastilles en capsule. Dégradé mesh du hero :

```css
background:
  radial-gradient(circle at 16% 24%, rgba(108, 79, 248, 0.2), transparent 34%),
  radial-gradient(circle at 84% 26%, rgba(255, 190, 150, 0.24), transparent 32%),
  radial-gradient(circle at 55% 82%, rgba(130, 170, 255, 0.2), transparent 40%),
  #fafafc;
```

Manrope variable locale ; titres en 700, interlettrage −0,03 à −0,04 em (`.display` 42 → 76 px, `.heading-2` 28 → 42 px). Ombres larges et très diffuses, jamais noires et dures (`--shadow-card`, `--shadow-lift`, `--shadow-window`, `--shadow-float`) ; bordures à faible opacité. Le logo final (symbole violet + mot « reso ») est conservé.

## Mouvement

CSS et IntersectionObserver uniquement, aucune bibliothèque. Activé par `html.js` ; sans JavaScript tout est visible.

- Apparition des sections au scroll : 16 px, 650 ms (450 ms sur téléphone), décalage de 80 ms entre cartes.
- Cartes flottantes : dérive très lente de 5 px (7 s, aller-retour), rotation fixe de 1 à 2°.
- Arrivée du premier écran : 12 px, 600 ms. Le titre et la description apparaissent mot par mot (`src/components/ui/BlurWords.tsx`) : flou de 6 px vers net, 10 px vers le haut, 560 ms par mot, 45 ms entre les mots du titre et 22 ms entre ceux de la description. Les titres de section (`SectionHeading`) utilisent le même flou à l’apparition (`.reveal-blur`).
- Navigation : transition de 320 ms entre les trois états (pleine largeur, capsule, capsule compacte), calculée dans `requestAnimationFrame`.
- Cartes spotlight : halo radial de 360 px qui suit le pointeur (`--sx`/`--sy`), fondu de 400 ms ; sans pointeur fin (tactile) rien ne se passe.
- Démonstration unique de l’agenda (`.demo-stage`), jouée quand il devient visible : le rendez-vous de Julie Martin apparaît et se pose dans la grille (650 ms), puis la carte « Rappel par email envoyé » apparaît (500 ms). Rien ne boucle.
- Petit sursaut de l’enveloppe de la carte email à l’apparition.
- Boutons soulevés de 2 px, cartes de 3 px, ombre légèrement renforcée au survol.
- `prefers-reduced-motion: reduce` : état final immédiat, aucune transition, aucune dérive, pas d’inclinaison de la fenêtre, mots nets sans flou, navigation sans transition, halo spotlight désactivé.

Inspirations : les motifs « Morphing Scroll Navbar », « Text Blur Reveal », « Soft Blur In », « Spotlight Card » et « How It Works Steps » publiés sur 21st.dev ont servi de référence ; ils ont été réécrits en CSS et React natifs (aucune dépendance ajoutée, aucun code de bibliothèque tierce).

## Accessibilité

Un seul `h1`, titres hiérarchisés, contrastes AA, focus visible, navigation clavier, menu refermable avec Échap avec retour du focus, aperçus décoratifs décrits par un `aria-label` mentionnant leur caractère fictif, formulaire de préinscription fonctionnel sans JavaScript (POST natif puis redirection sur la même origine).

## Validation

Voir `docs/recette-landing.md` pour les vérifications et les captures réelles du site dans `docs/previews/`.
