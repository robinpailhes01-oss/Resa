# Reso — direction de design de la landing page

## Référence retenue — 19 septembre 2026

La référence mobile retenue est l’image `8FF0AF59-4F98-48DD-BA52-D748D6AC7761.jpeg` (514 × 1536), confirmée à droite du comparatif envoyé par le client. La priorité est de reproduire sa composition compacte, particulièrement le premier écran : fond blanc, dégradés bleu pâle et lavande, titres noirs centrés, boutons noirs, symbole violet et aperçu d’agenda entouré de cartes flottantes. Cette direction remplace la palette prune / ivoire du premier cahier des charges.

La cible reste le professionnel de la beauté ou du bien-être, seul ou en petite équipe. L’action principale reste « Me prévenir du lancement ». Le prix prévu est centralisé dans `src/config/offer.ts` : 39 € HT / mois, un établissement, jusqu’à trois praticiens. Aucun témoignage, partenariat ou chiffre d’adoption fictif.

## Composition

- Barre blanche arrondie, limitée à 880 px utiles sur grand écran ; sur téléphone, hauteur de 44 px et largeur de 75 %, logo et menu tactile.
- Accroche en deux lignes sur ordinateur et trois sur téléphone, description courte, prix et CTA visibles au premier écran.
- Arcs elliptiques fins sur les côtés du texte mobile, icônes métier décoratives, halos bleu pâle et lavande derrière l’aperçu. Aucun cercle ne traverse le titre.
- Agenda HTML : trois praticiens sur grand écran, une journée de Camille sur téléphone. Les données sont fictives ; ce n’est pas encore l’application de réservation.
- Trois notifications sur ordinateur ; une notification email à droite du cadre sur téléphone, 50 px sous le haut de l’agenda. Vignettes photographiques de démonstration pour le salon et Camille, générées et optimisées en WebP local.
- Fonctionnalités : trois cartes avec mini-interfaces sur ordinateur, trois lignes empilées sur téléphone.
- Offre unique : panneau lavande en trois colonnes à partir de 1024 px, empilé en dessous. Sur téléphone, trois inclusions courtes et un CTA noir reprennent la maquette ; les détails commerciaux sont lisibles sur la page de préinscription.
- La landing se termine par un pied de page compact avec les deux liens légaux. La FAQ et le formulaire existant sont regroupés sur `/preinscription`, accessible depuis chaque CTA. Les liens du menu reviennent vers les sections de la landing. Les paramètres de campagne sont transmis au formulaire. Les anciennes URL `/?inscription=…` restent compatibles.

## Tokens

| Usage | Valeur |
| --- | --- |
| Fond et cartes | `#FFFFFF` |
| Titres et CTA | `#111116` |
| Accent violet, liens, focus | `#6950E8` |
| Violet au survol | `#5139C5` |
| Lavande | `#DED7FF` / `#F1EDFF` |
| Bleu pâle des halos | `#EAF0FF` |
| Texte secondaire | `#696A80` |
| Bordures décoratives | `#E9EAF2` |
| Bordures des champs | `#9091A7` |
| Rendez-vous pêche | `#FFF0EC` / `#F49C91` |
| Rendez-vous menthe | `#E5F5EE` |

Styles de composition mobile centralisés dans `src/app/globals.css`, limités à moins de 640 px ; aucun zoom global ni capture statique à la place du site. Manrope variable locale, avec titres 800 et texte courant 400–600. Les CTA de la landing mobile ont une hauteur de 40 px pour suivre la référence. Le menu conserve une cible de 44 px et le véritable formulaire ses boutons de 48 px. L’agenda est une illustration HTML compacte : ses éléments ne sont pas des commandes interactives. Le symbole du logo est un SVG local, repris dans la favicon ; le visuel de partage est régénéré par `scripts/og-image.mjs`.

## Mouvement et accessibilité

Les apparitions CSS existantes et les interactions clavier sont conservées. Le mode `prefers-reduced-motion` affiche les éléments sans animation. Sans JavaScript, le contenu reste lisible et le formulaire utilise son POST natif. Les illustrations d’interface sont décoratives et accompagnées d’une description accessible.

## Validation

Voir `docs/recette-maquettes.md` pour les vérifications de cette passe et les captures du site implémenté.
