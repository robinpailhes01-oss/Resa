# Reso — direction de design (étape 1, landing)

Brief auto-rédigé à partir du cahier des charges v1.0, des maquettes Ritméa fournies et de la demande « épuré comme Planity, ultra qualitatif, scroll léger ». À valider par la porteuse du projet.

## Brief

- **Personne** : l'esthéticienne indépendante ou la gérante d'un institut de 1 à 3 praticiennes. Ses demandes arrivent par Instagram, SMS et téléphone, souvent pendant un soin.
- **Douleur** : les allers-retours pour caler un créneau, les rappels faits à la main, et les abonnements qui s'empilent (agenda, SMS, caisse) avec des prix illisibles.
- **Promesse** : les rendez-vous se prennent seuls, les emails partent seuls, pour un seul prix connu d'avance.
- **Preuve autorisée** : le prix (39 € HT / mois), l'absence de commission, la limite claire (3 praticiens). Aucun chiffre inventé, aucun témoignage (cahier des charges §12).
- **Travail de la page** : une seule action, « Être informé du lancement ».
- **Niveau d'assets** : C. Aucune photo ; les aperçus produit sont reconstruits en HTML. Page portée par la typographie, l'espace et les aperçus.
- **Se positionner contre** : le catalogue Planity Pro (caisse, TPE, SMS, marketing, dix menus) et ses chiffres de marketplace. Reso vend une chose, à un prix.

## Archétypes et direction

- **Soignant + Souverain** : douceur des matières et ordre absolu. Type sans-serif humaniste, palette chaude et mate, mouvement lent et sûr.
- **Direction nommée** : *la retenue d'un institut haut de gamme (ivoire mat, prune, lumière abricot) + la discipline typographique de Planity Pro / Linear*.
- **Signature** : l'agenda qui se remplit de lui-même à l'arrivée sur la page, et qui déborde du cadre à droite sur grand écran. C'est la promesse rendue visible, pas une décoration.

## Tokens (inchangés, cahier des charges §3)

- Couleurs : prune `#493344` (dominante, texte fort, CTA), ivoire `#FAF7F2` (surface), blanc (cartes), lilas `#DDD5E5` et abricot `#EAB99A` (touches), encre `#27242A`, gris `#655B66`.
- Type : Manrope seule, graisses 400 à 800 (variable). Chasse resserrée sur les titres (-0,02 em), corps 18/28.
- Espacement : base 4 px, sections 96 à 128 px.
- Rayons : 10 boutons, 8 champs, 16 cartes. Ombres : une seule, sous les aperçus.
- Mouvement : 500 à 700 ms pour l'arrivée du premier écran, 400 à 500 ms pour les apparitions au scroll, 150 à 200 ms pour les micro-interactions. Courbe `cubic-bezier(0.16, 1, 0.3, 1)`.

## Système de mouvement (CSS uniquement, sans bibliothèque)

1. **Arrivée** : libellé → titre ligne par ligne (masque) → texte → prix → boutons, décalés de 70 ms. Le cadre agenda arrive en parallèle, puis ses rendez-vous se posent un à un, la pastille « Rappel par email programmé » en dernier.
2. **Scroll** : une apparition par bloc (16 px, 500 ms), cadencée pour les colonnes et étapes. Les sections FAQ et pied de page n'en ont pas.
3. **Micro-interactions** : flèche des boutons qui glisse de 3 px au survol, pression à 0,98, soulignement des onglets qui se déplace, réponses de FAQ qui se déplient.
4. **Réduction de mouvement** : tout est statique et complet dès le premier rendu. Sans JavaScript, idem.

Écarts assumés par rapport au cahier des charges §11 : distance d'apparition 16 px (au lieu de 12) et durées d'arrivée jusqu'à 700 ms (au lieu de 220). Pas de parallaxe, pas de défilement capturé, pas d'animation du prix.

## Ce qui est bloqué volontairement

Grille de trois cartes à icônes sous le hero ; carrousel ; compteurs ; dégradé bleu-violet ; ombres portées partout ; curseur personnalisé ; libellés en capitales au-dessus de chaque section.
