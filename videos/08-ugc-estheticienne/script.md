# 08 — UGC « esthéticienne » (9:16, ≈ 22 s)

Vidéo de type UGC : une esthéticienne (personnage virtuel généré avec Higgsfield) parle face caméra depuis sa cabine. Les écrans de l'app sont de **vraies captures** (`videos/_bibliotheque`), jamais une interface générée.

## Cadre (contenu et légal)

- **Présentatrice, pas un faux témoignage.** Elle s'adresse aux esthéticiennes et décrit ce que fait Reso (« vos clientes réservent… »). Elle ne prétend pas utiliser l'app ni avoir obtenu des résultats.
- **Mention permanente « Publicité · image virtuelle »** (`badge` dans `montage.json`). Elle est obligatoire en France pour un contenu commercial montrant un visage généré par IA (loi n° 2023-451 du 9 juin 2023).
- **Promesses conformes au site :** réservation en ligne 24h/24, rappel par email la veille (24 h avant par défaut), demande d'avis Google après le rendez-vous, essai de 7 jours sans carte bancaire (`src/config/offer.ts`).

## Texte dit

> Esthéticiennes… vous décrochez encore en plein soin ? Avec Reso, vos clientes réservent seules, en ligne, même le soir. Ça tombe direct dans votre agenda. La veille, le rappel part par e-mail. Après le soin, la demande d'avis Google. Sept jours pour essayer… sans carte bancaire.

## Montage (`montage.json`, skill `reso-facecam-app`)

| Temps | Plan |
| --- | --- |
| 0–4 s | face caméra, titre « vous décrochez encore en plein soin ? » |
| 4–7,6 s | écran partagé : page de réservation publique |
| 7,6–9,1 s | créneaux, pastille « Nouvelle réservation · 21:47 », elle en bulle |
| 9,1–11 s | écran partagé : agenda |
| 11–14,1 s | emails automatiques, pastille « Rappel envoyé » |
| 14,1–17 s | réglage de la demande d'avis, pastille « Demande d'avis envoyée » |
| 17–20 s | face caméra, appel à l'action |
| 20–22,3 s | signature reso® · essayer gratuitement · lien en bio |

## Génération (Higgsfield, workflow `ugc-website-video` adapté)

1. Créatrice : `soul_2` (3:4, 2k), 2 propositions ; la première retenue, puis passe de réalisme de peau `seedream_v5_pro` → `media/creatrice.png`.
2. Parole : `seedance_2_5`, `omni_reference`, 1080p, 20 s, une seule prise continue, audio généré en français, débit élevé → `media/raw.mp4` (240 crédits ; 12 crédits/s en 1080p).
3. Normalisation 30 i/s et −16 LUFS → `media/face.mp4`, transcription `--model medium`, corrections dans `transcript.json`.

À écouter avant diffusion : la transcription laisse entendre une prononciation approximative de « esthéticiennes », « décrochez » et « bancaire ». Si c'est audible, regénérer la prise (240 crédits) ; les sous-titres affichent de toute façon le bon texte.
