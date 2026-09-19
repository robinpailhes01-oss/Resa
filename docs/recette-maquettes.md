# Recette de la refonte d’après la référence mobile

19 septembre 2026. Cette passe complète la proposition `codex/reso-landing-mockups` à partir de `d5fc113`. Référence confirmée par le client : image mobile 514 × 1536, à droite de son comparatif.

## Résultat visuel

À 514 px de largeur, l’aperçu commence à **409 px** du haut, mesure **370 × 449 px** et reprend le cadre de la référence (environ 370 × 447 px). Le bandeau fait 44 px de haut. Le titre conserve ses trois lignes ; les deux CTA sont rapprochés ; la carte email flotte à droite du cadre. Les vignettes photographiques remplacent les aplats. La section fonctionnalités et l’offre sont compactes, avec un pied de page sur une ligne.

À 390 × 844, l’agenda complet est visible dans le premier écran. À 320 px, les textes peuvent revenir à la ligne ; les contrôles conservent leurs cibles tactiles. La version ordinateur garde sa mise en page large.

## Parcours

Les CTA ouvrent `/preinscription`, qui rassemble le formulaire existant, les détails commerciaux et la FAQ. Les paramètres UTM sont conservés. Les anciennes URL `/?inscription=…` redirigent vers la nouvelle page. Le POST natif renvoie vers cette page avec son état de confirmation ou d’erreur.

## Vérifications exécutées

- `npm run check` : ESLint, TypeScript et les 34 tests existants passent.
- `npm run build` : compilation de production réussie.
- Captures Chromium 141 : 320 × 568, 390 × 844, **514 × 1536**, 768 × 1024, 1024 × 768, 1440 × 900 et 1920 × 1080 ; aucun défilement horizontal.
- Menu mobile : ouverture, fermeture avec Échap et retour du focus.
- CTA vers la préinscription, paramètres de campagne transmis jusqu’au POST ; navigation vers les sections de l’accueil depuis la préinscription.
- Email invalide : message associé au champ et focus correct.
- Soumission valide : réponse 202, confirmation affichée. Store temporaire et emails console, aucun email réel envoyé.
- Sans JavaScript, sur l’origine locale canonique `http://localhost:3000` : CTA, formulaire POST natif, redirection 303 et confirmation vérifiés ; réponses FAQ lisibles.
- Compatibilité des anciennes URL de résultat : redirection 307 vérifiée.
- Photos chargées, FAQ fonctionnelle, pages légales accessibles ; aucune erreur JavaScript pendant le parcours.
- Captures avec mouvement réduit pour stabiliser les apparitions hors écran.

## Captures réelles du site

- [Haut de page, même largeur que la référence](previews/hero-mobile.png)
- [Page complète, même largeur que la référence](previews/landing-reference-514.png)
- [Téléphone, 390 px](previews/landing-mobile.png)
- [Ordinateur, 1440 px](previews/landing-desktop.png)

## Limites

Vérification locale sous Chromium. Safari/iOS réels, Firefox et le fournisseur email de production n’ont pas été testés. Cette refonte porte sur la landing de pré-lancement ; les vues d’agenda présentent des données fictives.
