# 05 — Pub 15 s « pendant que vous travaillez » (4K, 9:16)

**Concept.** Trois professionnelles et professionnels de la beauté, absorbés par leur geste (barbier, prothésiste ongulaire, esthéticienne). Aucun ne touche son téléphone, pourtant les notifications Reso tombent en haut de l'écran : réservations, rappel, demande d'avis. Chute : « vous travaillez. reso s'occupe du reste. », puis la signature reso® (Beauty business simplified), comme sur les précédentes.

**Livrable.** 2160×3840, 30 i/s, 15,0 s, son à −15 LUFS. Montage : `pub.json` → `build-pub.mjs` (skill `reso-motion-reel`). Les notifications sont composées en HTML (nettes en 4K, textes exacts) et ne sont **jamais générées par l'IA**.

## Découpage

| Temps | Plan | Notifications (ding) |
| --- | --- | --- |
| 0,0–3,6 | **A — Barbier** : dégradé à la tondeuse, gros plan nuque/tempe, mise au point qui se fait | 1,2 Karim Benali · 2,7 Thomas Petit |
| 3,6–7,0 | **B — Prothésiste ongulaire** : pinceau de vernis lavande, macro | 4,3 Chloé Bernard · 5,5 rappel Inès Moreau |
| 7,0–10,2 | **C — Esthéticienne** : soin du visage ; au premier plan, un téléphone retourné sur le comptoir s'illumine | 7,6 Sarah Roux · 8,5 demande d'avis · 9,2 Emma Lefèvre (le rythme accélère) |
| 10,2–12,6 | **D — Ralenti** : la prothésiste lève les yeux, sourit, reprend son geste | balayage des notifications, « vous travaillez. reso s'occupe du reste. » |
| 12,6–15,0 | **Signature** reso® · essayer gratuitement · lien en bio | logo sonore |

Données fictives uniquement (aucun vrai client, aucun faux avis). Les notifications reprennent les fonctions réelles de l'offre (réservation en ligne, rappel par email, demande d'avis par email). Pas d'acompte ni de SMS : ils ne font pas partie de l'offre.

## Plans à générer (Higgsfield, Kling 3.0, mode `4k`, 9:16, 5 s, son `off`)

Coût : 30 crédits par plan de 5 s. Soit 120 crédits pour 4 plans, ≈ 240 avec un second essai par plan.
Le **haut du cadre (≈ 40 %) doit rester calme** (mur, flou) : c'est là que tombent les notifications.

Direction commune (à ajouter à chaque prompt) :
> Luxury beauty commercial, powder-blue walls, cream stone and warm cream tones, soft natural window light, shallow depth of field, Kodak Portra film look, subtle grain, calm and elegant. Upper third of the frame is soft out-of-focus wall. No text, no logos, no phone screens visible.

**A — barbier**
> Close-up of a barber's hands doing a precise skin fade with cordless clippers on a man's temple and neck, slow controlled movement, tiny hair particles catching the window light, the client calm with eyes closed, cream barber cape. Slow push-in, 85mm macro. Barbershop with powder-blue wall softly out of focus.

**B — prothésiste ongulaire**
> Extreme macro of a nail technician applying lavender gel polish with a fine brush on a client's nail, the client's hand resting on a folded cream towel, glossy polish catching soft light, lavender polish bottle out of focus. Very slow lateral dolly, 100mm macro lens.

**C — esthéticienne**
> An esthetician in a cream uniform gently applies a facial mask with a soft brush to a relaxed client lying down, a white towel wrapped around the client's hair. In the soft foreground on a cream stone counter, a smartphone lies face down and its edge softly glows twice. Locked-off camera, slow and serene.

**D — ralenti sourire**
> Slow motion, medium close-up: the nail technician looks up from her work toward the window, a small relaxed smile, then returns to her gesture. Powder-blue wall, warm window light, shallow depth of field, 120 fps feel.

Prévoir des personnes de profils variés (âge, origine, genre).

## Ensuite

1. Télécharger les 4 vidéos dans `videos/05-pub-metiers/media/` (`plan-a.mp4`…`plan-d.mp4`).
2. Dans `pub.json`, remplacer chaque `src` par `"media/plan-x.mp4"` (+ `"from": 0.3` pour sauter le démarrage), supprimer les `label` (étiquettes d'animatique), ajuster `focus`.
3. `node .claude/skills/reso-motion-reel/scripts/build-pub.mjs videos/05-pub-metiers`, puis snapshot, rendu `--quality delivery`, `loudnorm=I=-15`.

## Musique

Pour la diffusion : une piste sous licence (neo-soul / jazz feutré, 76–80 bpm, montée à ~10 s). Le kit synthétisé sert de maquette.
