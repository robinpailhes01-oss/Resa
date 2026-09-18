# Recette — étape 1 (landing page pré-lancement)

Environnement : build de production local (`next start`), Chromium 141 (Playwright 1.56), store fichier, emails console. Date : 18 septembre 2026.

## Critères fonctionnels (§17)

| ID | Scénario | Résultat | Preuve |
| --- | --- | --- | --- |
| F01 | Mode initial pré-lancement, aucun lien de connexion ni essai | OK | `tests/offer-config.test.ts`, captures |
| F02 | Prix et praticiens issus de la configuration | OK | `src/config/offer.ts`, `tests/format.test.ts` |
| F03 | Ancres, header sticky, menu mobile clavier (Échap, retour du focus) | OK | `Header.tsx`, capture `menu-390.png` |
| F04 | Trois onglets, bons visuels et légendes, marque Reso partout | OK | captures `apercu-*.png` |
| F05 | FAQ souris/clavier, réponses présentes sans JS | OK | `FaqItem.tsx`, HTML rendu contient les réponses |
| F06 | Email invalide : erreur près du champ, focus, rien stocké | OK | vérification navigateur (`aria-invalid`, `aria-describedby`, focus) ; API 422 |
| F07 | Inscription valide : demande + tâche en base, message générique après 202 | OK | `.data/waitlist.json`, test service |
| F08 | Double clic et doublon : un seul prospect, envois plafonnés | OK | test « doublon », clé d'idempotence, API 202 identique |
| F09 | Panne base : message d'échec, valeurs conservées, pas de faux succès | OK | 503 observé sans store ; test « panne de base » |
| F10 | Panne email : tâche conservée, réessai backoff, alerte | OK | tests « panne email » |
| F11 | GET ne confirme pas ; POST valide une fois ; expiration | OK | curl : statut `pending` après GET, `confirmed` après POST, 2e POST idempotent ; test expiration |
| F12 | Retrait sans compte, statut retiré | OK | test désinscription ; page `/desinscription` |
| F13 | Validation serveur, taille 8 Ko, quotas, honeypot | OK | curl : 422 champ inattendu, 403 origine étrangère, 429 à la 6e tentative, honeypot → 202 sans stockage |
| F14 | Consentement : aucun traceur, formulaire disponible | OK | aucun script tiers ; CSP `connect-src 'self'` |
| F15 | Passage live : build refusé sans URL, textes cohérents | OK (partiel) | test config ; variantes live intégrées, non validées visuellement |

## Matrice visuelle (§18)

Captures dans `tests/screenshots/` (`npm run screenshots`, dossier non versionné) : 320 × 568, 390 × 844, 768 × 1024, 1024 × 768, 1440 × 900, 1920 × 1080. Aucun scroll horizontal détecté. Prix et CTA visibles au premier écran à 390 × 844 et 1440 × 900.

Navigateurs réellement testés : Chromium uniquement (environnement de développement). Safari iOS, Chrome Android, Firefox et Safari macOS restent à tester avant publication.

## Accessibilité (§12)

Vérifié par lecture du code et inspection DOM : un seul H1, lien « Aller au contenu », labels visibles, `aria-describedby` sur les erreurs, `aria-live` sur les statuts, onglets ARIA avec navigation flèches/Début/Fin, focus visible, cibles ≥ 44 px, `prefers-reduced-motion` respecté. **Reste à faire** : test manuel avec VoiceOver ou NVDA, mesure de contraste sur les états réels, zoom 200 % / 400 %.

## Performance (§14)

Aucun script tiers, une seule police WOFF2 (sous-ensemble latin, `font-display: swap`), aperçus en HTML sans image lourde. Lighthouse mobile non exécuté dans cet environnement : à faire sur la préproduction.

## Limites connues

- Limitation de débit en mémoire : par instance serveur. Prévoir un store partagé (Redis) en déploiement multi-instances.
- Pas de dispositif de consentement : aucun traceur n'est chargé, donc non requis pour cette version.
- Textes légaux : gabarits avec bandeau « préproduction » tant que l'identité légale n'est pas renseignée.
