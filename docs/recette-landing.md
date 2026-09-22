# Recette de la refonte « SaaS premium » de la landing

22 septembre 2026, branche `claude/landing-refonte-premium`.

## Vérifications exécutées

- `npm run check` : ESLint, TypeScript et les tests Vitest passent.
- `npm run build` : compilation de production réussie.
- `node scripts/screenshots.mjs --docs` (Chromium, serveur de production local) : 320 × 568, 390 × 844, 514 × 1536, 768 × 1024, 1024 × 768, 1440 × 900 et 1920 × 1080 ; aucun défilement horizontal, aucune erreur JavaScript.
- `node scripts/recette-landing.mjs` : un seul `h1` et hiérarchie des titres ; ancres `#produit`, `#fonctionnalites`, `#avis`, `#tarif` ; liens de navigation identiques depuis `/` et `/preinscription` ; le titre d’une section reste sous la barre après un clic sur une ancre ; cinq CTA vers `/preinscription` avec conservation des paramètres UTM ; démonstration de l’agenda terminée à l’état final ; état final immédiat avec `prefers-reduced-motion` ; menu mobile (ouverture, fermeture avec Échap, retour du focus) ; agenda mobile entre 400 et 440 px du haut ; éléments flottants non coupés ; cibles tactiles ≥ 44 px ; préinscription : erreur associée au champ email et focus, confirmation après réponse 202, FAQ et mentions commerciales présentes, lien de retour ; sans JavaScript : contenu essentiel et aperçus visibles, réponses FAQ lisibles, POST natif puis redirection 303 vers `/preinscription?inscription=ok` ; anciennes URL `/?inscription=…` redirigées.
- Emails et stockage de recette : `EMAIL_PROVIDER=console` et base locale ; aucun envoi réel. En production, sans base ou sans fournisseur email configuré, l’API répond 503 et le formulaire affiche une erreur : aucun faux envoi.

## Captures réelles du site

- [Ordinateur, 1440 px](previews/landing-desktop.png)
- [Téléphone, 390 px](previews/landing-mobile.png)
- [Téléphone, 514 px](previews/landing-mobile-514.png)
- [Haut de page mobile](previews/hero-mobile.png)
- [Section Avis](previews/section-avis.png)
- [Section Tarif](previews/section-tarif.png)

## Limites

Vérification locale sous Chromium ; Safari/iOS réels et Firefox non testés. Aucun témoignage réel n’est encore publié : la section Avis affiche le bloc de pré-lancement. Les aperçus sont des interfaces HTML avec des données fictives, pas l’application connectée.
