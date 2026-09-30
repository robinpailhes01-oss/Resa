# 06 — Pub 15 s « sans reso / avec reso » (4K, 9:16)

**Concept.** Même barbier, même client, même mardi, mais deux journées différentes. À gauche, sans Reso, le téléphone interrompt la coupe (appel, message, appels manqués) et le client attend. À droite, avec Reso, le barbier ne lève pas les yeux : les réservations et les rappels arrivent seuls. L'écran partagé s'ouvre sur la version « avec », la coupe se termine et le client sourit dans le miroir. Chute : « même métier. pas la même journée. », puis la signature reso®.

**Livrable.** 2160×3840, 30 i/s, ≈ 15 s, son à −15 LUFS. Montage : `pub.json` → `build-pub.mjs` (plan `type: "split"`). Les interruptions et les notifications sont composées en HTML, jamais générées par l'IA.

## Découpage

| Temps | Plan | Son |
| --- | --- | --- |
| 0,0–1,8 | **Accroche** : macro de la tondeuse qui remonte la tempe, particules dans la lumière | vibration à 1,1 s |
| 1,8–9,2 | **Écran partagé** : les deux moitiés glissent depuis les bords, trait crème au centre, étiquettes « sans reso » / « avec reso ». Gauche : appel entrant, message « Vous avez de la place samedi ? », 2 appels manqués ; le barbier pose la tondeuse et décroche. Droite : 2 réservations, un rappel et une demande d'avis Reso, le barbier continue. | sonnerie et vibrations à gauche, « ding » feutré à droite |
| 9,2–10,6 | **Ouverture** : la moitié gauche se referme, la version « avec » prend tout le cadre | souffle |
| 10,6–12,7 | **Miroir** : coupe terminée, le client sourit, le barbier passe le blaireau. « même métier. pas la même journée. » | |
| 12,7–15,1 | **Signature** reso® · essayer gratuitement · lien en bio | logo sonore |

Données fictives uniquement. Les notifications reprennent ce que Reso fait vraiment : réservation en ligne, rappel par email et demande d'avis Google après le rendez-vous. Pas de « nouvel avis ★★★★★ » : Reso envoie la demande, il ne reçoit pas les avis, et la charte interdit les faux avis. Reso ne répond pas aux appels ni aux messages : le message est « vos clients réservent seuls », pas « Reso répond à votre place ».

## Génération (Higgsfield)

1. **Images de départ** (GPT Image 2.5, 4K, avec l'image `ref-1` en référence pour garder les mêmes personnages) : `depart-salon.png` (barbier et client centrés, téléphone sur le comptoir), `depart-macro.png`, `depart-miroir.png`.
2. **Plans** (Kling 3.0, mode `4k`, 9:16, son `off`, image de départ) :
   - `plan-accroche.mp4` (5 s, depuis `depart-macro`) : macro, la tondeuse remonte la tempe.
   - `plan-sans.mp4` (10 s, depuis `depart-salon`, caméra fixe) : le téléphone s'allume, le barbier pose la tondeuse, décroche ; le client s'impatiente.
   - `plan-avec.mp4` (10 s, depuis `depart-salon`, caméra fixe) : il coupe sans s'arrêter, le téléphone s'allume doucement, il ne le regarde pas.
   - `plan-miroir.mp4` (5 s, depuis `depart-miroir`) : le client découvre sa coupe et sourit.

Coût : ≈ 13 crédits d'images et 180 crédits de vidéo. Même image de départ pour « sans » et « avec » : l'écran partagé montre le même instant dans deux versions de la journée.

Recadrage : chaque moitié montre le centre de sa vidéo (540 px de large sur 1080). Barbier et client doivent donc être centrés dans l'image de départ.

## Musique

Pour la diffusion : une piste sous licence, calme, qui se pose à l'ouverture sur « avec ». Le kit synthétisé sert de maquette.
