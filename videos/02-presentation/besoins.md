# 02 — Présentation : ce qu'il faut pour la version parfaite

La v1 (`renders/02-presentation-v1.mp4`, 67 s) est montée à partir de la prise unique de Ludivine (2 min 04 → 65 s de voix + 2,5 s de carte de fin). Elle montre la vraie app, filmée sur l'établissement fictif « Maison Alba ». Cette liste regroupe ce qui manque, par ordre d'impact.

## 1. Captures d'écran et enregistrements (priorité haute)

| # | Élément | Pourquoi | Qui / comment |
| --- | --- | --- | --- |
| 1 | **Import depuis Google en action** : coller le lien de la fiche → adresse, horaires et photos qui se remplissent | C'est l'argument n° 1 de la vidéo (« tu ajoutes le lien… Reso récupère tout ») ; aujourd'hui on montre seulement le résultat (page publique) avec des pastilles | Fournir une clé `GOOGLE_PLACES_API_KEY` de test (je filme alors l'étape d'inscription automatiquement), **ou** un enregistrement d'écran du téléphone pendant une vraie inscription |
| 2 | **Une vraie fiche Google avec photos** (salon partenaire qui accepte d'apparaître, ou salon de Ludivine) | La page de réservation de démo n'a pas de photos : l'écran est un peu vide | Accord écrit de l'établissement, puis je relance la capture |
| 3 | **La demande d'avis reçue par la cliente** (email sur un téléphone) puis **l'écran Google « Laisser un avis »** | Rend concret « le client laisse un avis directement sur Google », qui est aujourd'hui illustré par une pastille | Capture d'écran d'un vrai email de test reçu sur iPhone + capture de l'écran d'avis Google de la fiche utilisée au point 2 |
| 4 | **Emails de confirmation et de rappel tels que reçus** (boîte mail du téléphone) | Plus parlant que la carte texte « Confirmation. Rappel. » | Je peux générer les emails à partir des gabarits de l'app ; une capture réelle sur téléphone reste plus crédible |
| 5 | **Notification « nouvelle réservation »** reçue par la pro (email ou écran du téléphone verrouillé) | Illustre « tout apparaît directement dans ton agenda » | Capture d'écran réelle d'un compte de test |

## 2. Tournage complémentaire de Ludivine (priorité haute)

- **Hook plus direct**, 3 prises (≤ 2 s avant le problème). Aujourd'hui la vidéo ouvre sur l'énumération des métiers (3,4 s). Propositions :
  - « Tu paies ton logiciel de rendez-vous trop cher. »
  - « Coiffeuse, esthéticienne : arrête de payer une commission sur tes rendez-vous. »
  - « Voilà combien tu paies vraiment pour tes réservations en ligne. »
- **Micro-cravate** au lieu du micro à main : le micro cache la bouche et la main bouge dans tous les plans face caméra.
- **Plans d'illustration (B-roll)**, 3–5 s chacun, sans parler : Ludivine au salon (mains, fauteuil, bac), le téléphone posé qui s'allume sur une notification, elle qui montre l'écran à la caméra, un sourire de fin. Ils remplacent les jump cuts les plus visibles.
- **Phrase du prix** à refaire : « 39 € **HT** par mois » (la carte affiche « 39 € HT / mois », conformément à `src/config/offer.ts` ; l'oral dit « 39 € par mois »).
- Une **fin** plus nette : « Essaie gratuitement pendant 7 jours, le lien est dans ma bio », regard caméra, 2 s de silence après.

## 3. Décisions à prendre

1. **Tutoiement ou vouvoiement ?** La vidéo tutoie (choix de Ludivine), le site et la charte vouvoient. Les textes à l'écran suivent la vidéo (« tu »), sauf la promesse de marque sur la carte de fin (« Votre agenda. L'esprit libre. »). À trancher pour toutes les vidéos.
2. **Mode de publication** : la vidéo parle d'essai gratuit de 7 jours et affiche « Essayer gratuitement ». Elle ne doit sortir qu'une fois le site en mode `live` (`RESO_LAUNCH_MODE=live`, `RESO_TRIAL_DAYS=7`), sinon le lien en bio mène à une liste d'attente.
3. **« Sans engagement, sans commission »** : à confirmer (conditions de l'abonnement, CGV) avant publication.
4. **Musique** : un fond discret sans paroles. Soit vous choisissez une piste libre de droits (ou la bibliothèque sonore Instagram au moment de publier), soit je la cherche via HeyGen (connexion au CLI `heygen` nécessaire).
5. **Lien en bio** : l'URL exacte et le compte Instagram / TikTok de publication.

## 4. Ce que je peux faire ensuite sans rien attendre

- Image de couverture du Reel (une image de Ludivine + titre).
- Version 4:5 pour le fil Instagram, ou 16:9 pour YouTube / le site.
- Version courte de 30 s (accroche → réservation client → prix → lien).
- Relecture de vos corrections de sous-titres, puis nouveau rendu en quelques minutes (`montage.json` → `build-montage.mjs`).
