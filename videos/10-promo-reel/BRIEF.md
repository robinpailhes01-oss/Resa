---
workflow: product-launch-video
flow: automation
storyboard: yes
message: "Vos clientes réservent en ligne, toutes seules — Reso s'occupe du reste."
destination: youtube
aspect: 1920x1080
language: fr
audience: "Professionnels indépendants de la beauté en France (coiffure, barbier, esthétique, onglerie)"
length: 30s
angle: promo
---

## Intent

Promo motion design de ~30 s pour Reso, **au même niveau de qualité** que la vidéo de référence
(promo « Scalyx » faite en motion design codé) : cartes d'interface flottantes en perspective 3D,
mouvements de caméra, profondeur de champ, titres courts révélés mot par mot, micro-animations
(barre de recherche qui se tape, graphiques, connexions), bouton final. Sans voix off ; musique + sound design.
Ton premium, calme, précis. Aux couleurs Reso (charte poudrée : bleu poudré, crème, encre, touche lavande),
pas le violet sombre de la référence.

## Assets

- media/reference.mp4 — vidéo de référence (écran filmé), pour le style uniquement, ne pas réutiliser.
- ../_bibliotheque/media/app/*.png — vraies captures de l'app Reso (page publique, créneaux, agenda, emails, dashboard).
- ../../.claude/skills/reso-video-charte/assets/ — logo reso® (SVG), polices Outfit / Manrope / JetBrains Mono, visuels de marque.

## Customizations

- Format 16:9 comme la référence (peut être filmé sur un écran pour un Reel).
- Storyboard + esquisses validés avant la construction.
- Signature reso® « Beauty business simplified » en fin.

## Notes

- Aucun faux chiffre, faux avis ni témoignage (la référence affiche « ≈20 prospects » et un avis client : à remplacer par l'offre réelle).
- Offre réelle : essai 7 jours sans carte bancaire, puis abonnement mensuel sans engagement (prix depuis src/config/offer.ts).
- Reso ne répond pas aux appels : le message est « vos clientes réservent seules ».
- Fonctions réelles montrables : page de réservation publique, choix du créneau, agenda, confirmation, rappel email, demande d'avis Google.
