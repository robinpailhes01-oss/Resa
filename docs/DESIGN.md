# Reso — direction de design de la landing page

## Référence retenue — 19 septembre 2026

La demande actuelle est de rapprocher le site des dernières maquettes Reso sur ordinateur et téléphone : fond blanc, dégradés bleu pâle et lavande, titres noirs centrés, boutons noirs, symbole violet et aperçu d’agenda entouré de cartes flottantes. Cette direction remplace la palette prune / ivoire du premier cahier des charges.

La cible reste le professionnel de la beauté ou du bien-être, seul ou en petite équipe. L’action principale reste « Me prévenir du lancement ». Le prix prévu est centralisé dans `src/config/offer.ts` : 39 € HT / mois, un établissement, jusqu’à trois praticiens. Aucun témoignage, partenariat ou chiffre d’adoption fictif.

## Composition

- Barre blanche arrondie, limitée à 880 px utiles sur grand écran ; logo et menu tactile sur téléphone.
- Accroche en deux lignes sur ordinateur et trois sur téléphone, description courte, prix et CTA visibles au premier écran.
- Arcs fins et icônes métier décoratives. Halos diffus derrière l’aperçu.
- Agenda HTML : trois praticiens sur grand écran, une journée de Camille sur téléphone. Les données sont fictives ; ce n’est pas encore l’application de réservation.
- Trois notifications sur ordinateur ; une notification sur téléphone, hors des créneaux.
- Fonctionnalités : trois cartes avec mini-interfaces sur ordinateur, trois lignes empilées sur téléphone.
- Offre unique : panneau lavande en trois colonnes à partir de 1024 px, empilé en dessous. Les mentions commerciales restent lisibles sous le panneau.
- FAQ et formulaire de préinscription conservés dans la continuité du design. Les boutons renvoient au vrai formulaire existant.

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

Manrope variable locale, avec titres 800 et texte courant 400–600. Les CTA ont une hauteur minimale de 48 px, le bouton de menu et les actions compactes de 44 px. Le symbole du logo est un SVG local, repris dans la favicon ; le visuel de partage est régénéré par `scripts/og-image.mjs`.

## Mouvement et accessibilité

Les apparitions CSS existantes et les interactions clavier sont conservées. Le mode `prefers-reduced-motion` affiche les éléments sans animation. Sans JavaScript, le contenu reste lisible et le formulaire utilise son POST natif. Les illustrations d’interface sont décoratives et accompagnées d’une description accessible.

## Validation

Voir `docs/recette-maquettes.md` pour les vérifications de cette passe et les captures du site implémenté.
