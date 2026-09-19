# Recette de la refonte d'après les maquettes

19 septembre 2026. Base de travail : `645deb7`. La configuration commerciale et les routes de préinscription existantes sont conservées.

## Vérifications exécutées

- `npm run check` : ESLint et TypeScript passent ; les 34 tests existants passent.
- `npm run build` : compilation de production réussie.
- Captures Chromium 141 à 320 × 568, 390 × 844, 768 × 1024, 1024 × 768, 1440 × 900 et 1920 × 1080 : aucun défilement horizontal.
- Prix et CTA visibles au premier écran sur téléphone et ordinateur ; contrôle visuel du logo, des couleurs, de l'agenda et du tarif.
- Menu mobile : ouverture, fermeture avec Échap et retour du focus au bouton.
- CTA principal vers la section de préinscription.
- Email invalide : message associé au champ et focus correct.
- Soumission valide depuis le navigateur : réponse 202 et confirmation affichée. Store fichier temporaire et emails console, aucun email réel envoyé.
- Ouverture de la FAQ ; aucune erreur JavaScript détectée pendant le parcours.
- Sans JavaScript : titre et réponses FAQ lisibles, formulaire POST natif présent.
- Captures complètes avec réduction de mouvement activée pour stabiliser toutes les apparitions.

## Captures du site implémenté

[Ordinateur, 1440 px](previews/landing-desktop.png) · [Téléphone, 390 px](previews/landing-mobile.png)

## Limites de cette vérification

Les essais de cette passe sont locaux sous Chromium. Safari/iOS réels, Firefox et l'envoi via le fournisseur email de production n'ont pas été testés. La mesure Lighthouse et les données de performance terrain restent à effectuer sur l'hébergement retenu. Le site reste en pré-lancement ; cette refonte ne développe pas l'application de réservation.
