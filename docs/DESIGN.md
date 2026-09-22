# Reso — direction de design de la landing page

## Direction retenue — 22 septembre 2026

Landing de pré-lancement au niveau d’un SaaS mature : lumineuse, sobre, centrée sur le produit, dans l’esprit d’Apple et de Linear. Le fond beige, les aplats prune, les cercles concentriques et les icônes flottantes de la version précédente sont retirés. L’agenda, cœur du produit, est visible dès le premier écran.

La cible reste le professionnel de la beauté, seul ou en petite équipe. L’action principale est « Me prévenir du lancement ». Le prix et la limite de praticiens sont centralisés dans `src/config/offer.ts` (39 € HT / mois, un établissement, jusqu’à trois praticiens) et tous les textes dans `src/content/fr/landing.ts`. Aucun témoignage, chiffre, note, logo ou partenariat fictif.

## Composition

1. **Navigation** : barre blanche fine et flottante (48 px sur téléphone, 56 px au-delà), même largeur que le contenu (1120 px), logo à gauche, liens Produit / Fonctionnalités / Avis / Tarif, CTA noir à droite, menu tactile sur téléphone. Ombre très douce après le scroll. Les ancres portent une marge (`--nav-offset`) : aucun titre de section ne passe sous la barre.
2. **Premier écran** : badge discret, titre en deux lignes, description, CTA noir, lien « Découvrir Reso », ligne de réassurance, puis la fenêtre blanche de l’agenda (bordure fine, ombre profonde et diffuse, inclinaison de 3° à partir de 1024 px). Sur téléphone, l’agenda commence à 440 px du haut et occupe le premier écran de 390 × 844 ; le lien secondaire remplace le second bouton.
3. **Décoration** : un halo lavande et bleu très pâle derrière l’agenda, le centre du hero reste blanc. Deux éléments flottants seulement : la carte « Rappel par email envoyé » et, sur grand écran, une pastille « Nouvelle réservation en ligne ».
4. **Aperçu de l’agenda** (`src/components/previews/AgendaPreview.tsx`) : HTML/CSS uniquement, données fictives (Maison Alba, Camille et ses clientes). Trois praticiens à partir de 576 px de largeur de cadre, la journée de Camille seule en dessous. Rendez-vous lavande, pêche et menthe avec barre colorée, grille fine, textes de 11 px minimum, photo du salon et portrait fictif de Camille.
5. **Fonctionnalités** : un grand bloc éditorial (titre, texte, vue rapprochée de l’agenda) puis deux cartes : réservation en ligne et email de confirmation, chacune avec une interface lisible.
6. **Avis** : section dédiée avant le tarif. Tant que `src/content/fr/testimonials.ts` est vide, un bloc de pré-lancement s’affiche ; dès qu’un témoignage autorisé est ajouté (citation, prénom, établissement, activité, photo facultative), des cartes le remplacent automatiquement.
7. **Tarif** : une carte compacte et centrée (label, titre, prix, périmètre, trois inclusions, CTA), précisions discrètes en dessous. Plus de trois colonnes séparées par des traits.
8. **Pied de page** léger : logo, liens de sections et liens légaux. La FAQ et le formulaire de préinscription vivent sur `/preinscription`, ouverte par tous les CTA avec les paramètres de campagne.

## Tokens

| Usage | Valeur |
| --- | --- |
| Fond principal | `#FAFAFC` |
| Surfaces | `#FFFFFF` |
| Titres et boutons principaux | `#17171B` |
| Texte secondaire | `#686873` |
| Accent Reso (sélection, icône, lien, détail d’agenda) | `#7557E8` |
| Lavande très claire | `#F3F0FF` (rendez-vous : `#E6E0FF`) |
| Bordures | `#EAEAEE` |
| Rendez-vous pêche | `#FFF0E6` / barre `#F4B28F` |
| Rendez-vous menthe | `#E6F6EC` / barre `#7FD0A4` |

Manrope variable locale ; titres en 700, interlettrage −0,03 em, tailles contenues (`.display` 34 → 60 px, `.heading-2` 28 → 42 px). Ombres extrêmement légères (`--shadow-card`, `--shadow-lift`, `--shadow-window`, `--shadow-float`) ; la hiérarchie repose sur les bordures fines, les surfaces et l’espace blanc. Le logo final (symbole violet + mot « reso ») est conservé.

## Mouvement

CSS et IntersectionObserver uniquement, aucune bibliothèque. Activé par `html.js` ; sans JavaScript tout est visible.

- Apparition des sections au scroll : 12 px, 550 ms (450 ms sur téléphone), décalage de 80 ms entre cartes.
- Arrivée du premier écran : 12 px, 600 ms.
- Démonstration unique de l’agenda (`.demo-stage`), jouée quand il devient visible : le rendez-vous de Julie Martin apparaît et se pose dans la grille (650 ms), puis la carte « Rappel par email envoyé » apparaît (500 ms). Rien ne boucle.
- Petit sursaut de l’enveloppe de la carte email à l’apparition.
- Boutons soulevés de 2 px, cartes de 3 px, ombre légèrement renforcée au survol.
- `prefers-reduced-motion: reduce` : état final immédiat, aucune transition, pas d’inclinaison de la fenêtre.

## Accessibilité

Un seul `h1`, titres hiérarchisés, contrastes AA, focus visible, navigation clavier, menu refermable avec Échap avec retour du focus, aperçus décoratifs décrits par un `aria-label` mentionnant leur caractère fictif, formulaire de préinscription fonctionnel sans JavaScript (POST natif puis redirection sur la même origine).

## Validation

Voir `docs/recette-landing.md` pour les vérifications et les captures réelles du site dans `docs/previews/`.
