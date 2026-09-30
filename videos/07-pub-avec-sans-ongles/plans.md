# 07 — Pub 15 s « sans reso / avec reso », prothésiste ongulaire (4K, 9:16)

Déclinaison de `06-pub-avec-sans` (même structure, même moteur) pour l'onglerie.

**Concept.** Même prothésiste, même cliente, même instant, mais deux journées différentes. À gauche, sans Reso, le téléphone interrompt la pose : appel entrant, message « Tu aurais un créneau jeudi ? », 2 appels manqués. Elle pose le pinceau et décroche, et la cliente attend, vernis frais. À droite, avec Reso, elle continue de poser le vernis lavande pendant que les notifications arrivent : 2 réservations, un rappel, une demande d'avis. L'écran partagé s'ouvre sur la version « avec ». La cliente admire ses ongles et sourit. Chute : « même métier. pas la même journée. », puis la signature reso®.

## Découpage

| Temps | Plan | Son |
| --- | --- | --- |
| 0,0–1,8 | **Accroche** : macro du pinceau qui pose le gel lavande, reflet qui glisse | vibration à 1,1 s |
| 1,8–9,2 | **Écran partagé** « sans reso » / « avec reso » ; notifications placées entre le visage et les mains (`eventsTop: 600`) pour garder visible le moment où elle décroche | sonnerie et vibrations à gauche, « ding » à droite |
| 9,2–10,6 | **Ouverture** : la version « avec » prend tout le cadre | souffle |
| 10,6–12,7 | **Final** : la cliente admire ses ongles lavande et sourit, la prothésiste sourit derrière. « même métier. pas la même journée. » | |
| 12,7–15,1 | **Signature** reso® · essayer gratuitement · lien en bio | logo sonore |

Données fictives. Les notifications reprennent uniquement ce que fait Reso (réservation en ligne, rappel par email, demande d'avis Google). Pas de faux avis.

## Génération (Higgsfield)

- **Images de départ** (GPT Image 2.5, 4K, avec `ref-1` en référence) : `depart-salon.png` (prothésiste face caméra, mains de la cliente au centre, téléphone sur la table), `depart-macro.png`, `depart-final.png`.
- **Plans** (Kling 3.0, `4k`, 9:16, son `off`) : `plan-accroche` (5 s), `plan-sans` (10 s, caméra fixe : elle s'arrête, pose le pinceau, décroche), `plan-avec` (10 s, caméra fixe : elle continue, le téléphone s'allume), `plan-final` (5 s).

Coût : ≈ 13 crédits d'images et 180 crédits de vidéo.
