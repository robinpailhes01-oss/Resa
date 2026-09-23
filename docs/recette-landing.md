# Recette de la refonte « SaaS premium » de la landing

22 septembre 2026, branche `claude/landing-refonte-premium`.

## Vérifications exécutées

- `npm run check` : ESLint, TypeScript et les tests Vitest passent.
- `npm run build` : compilation de production réussie.
- `node scripts/screenshots.mjs --docs` (Chromium, serveur de production local) : 320 × 568, 390 × 844, 514 × 1536, 768 × 1024, 1024 × 768, 1440 × 900 et 1920 × 1080, plus 375 et 430 px ; aucun défilement horizontal, aucune erreur JavaScript.
- `node scripts/recette-landing.mjs` (35 contrôles) : un seul `h1` et hiérarchie des titres ; ancres `#produit`, `#fonctionnalites`, `#tarif`, `#avis`, `#faq` ; liens de navigation identiques depuis `/` et `/preinscription` ; le titre d’une section reste sous la barre après un clic sur une ancre ; cinq CTA vers `/preinscription` avec conservation des paramètres UTM ; démonstration de l’agenda terminée à l’état final ; état final immédiat avec `prefers-reduced-motion` ; menu mobile (ouverture, fermeture avec Échap, retour du focus) ; agenda mobile entre 400 et 500 px du haut (492 px à 390 px de large) ; éléments flottants non coupés ; cibles tactiles ≥ 44 px ; préinscription : erreur associée au champ email et focus, confirmation après réponse 202, FAQ et mentions commerciales présentes, lien de retour ; sans JavaScript : contenu essentiel et aperçus visibles, réponses FAQ lisibles, POST natif puis redirection 303 vers `/preinscription?inscription=ok` ; anciennes URL `/?inscription=…` redirigées.
- Emails et stockage de recette : `EMAIL_PROVIDER=console` et base locale ; aucun envoi réel. En production, sans base ou sans fournisseur email configuré, l’API répond 503 et le formulaire affiche une erreur : aucun faux envoi.

- Navigation « morphing » (capture manuelle Chromium 1440 px) : `is-floating` après 8 px de scroll, `is-compact` en descendant au-delà de 160 px, liens restaurés en remontant, lien actif `aria-current="location"` sur la section visible ; le titre Tarif reste sous la barre après un clic sur l’ancre (`navBottom` 72 px, `titleTop` 229 px).

## Parcours établissement en mode live

`node scripts/recette-parcours.mjs` (serveur construit et lancé avec `RESO_LAUNCH_MODE=live`, base locale, emails console), 20 contrôles : landing avec « Créer mon compte » et lien Connexion, inscription, lien de vérification d’email valide, création de l’établissement, prestations, équipe, horaires, lien public et conditions de réservation, réservation par une cliente sur téléphone avec conditions affichées, emails de confirmation et de notification, bandeau « Période de lancement » (paiement non activé) sur le tableau de bord, fiche du rendez-vous, mot de passe oublié, réinitialisation puis reconnexion ; aucune erreur JavaScript. Captures dans `tests/screenshots/parcours/` (non versionnées).

Correctif issu de cette recette : la configuration commerciale est désormais figée au build dans les deux bundles (clé `env` de `next.config.ts`), sinon le mode live provoquait une erreur d’hydratation sur la landing.

## Captures réelles du site

- [Ordinateur, 1440 px](previews/landing-desktop.png)
- [Téléphone, 390 px](previews/landing-mobile.png)
- [Téléphone, 514 px](previews/landing-mobile-514.png)
- [Haut de page mobile](previews/hero-mobile.png)
- [Section Avis](previews/section-avis.png)
- [Section Tarif](previews/section-tarif.png)

## Limites

Vérification locale sous Chromium ; Safari/iOS réels et Firefox non testés. Aucun témoignage réel n’est encore publié : la section Avis affiche le bloc de pré-lancement. Les aperçus sont des interfaces HTML avec des données fictives, pas l’application connectée.
