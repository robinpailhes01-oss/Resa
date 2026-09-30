# 04 — Pub 15 s « sans décrocher » (4K, 9:16)

**Concept.** Une nature morte de salon, silencieuse et lumineuse. Le combiné est décroché : plus besoin de répondre, les rendez-vous arrivent seuls dans l'agenda Reso. Chute : « vos rendez-vous, sans décrocher. » puis la signature reso® — Beauty business simplified.

**Livrable.** 2160×3840, 30 i/s, 15,0 s, son à −15 LUFS. Montage et typographie : `pub.json` → `build-pub.mjs` (skill `reso-motion-reel`).

## Découpage

| Temps | Plan | Image | Son |
| --- | --- | --- | --- |
| 0,0–4,2 | **A — Ouverture** : lente avancée macro dans la nature morte, mise au point qui se fait | chrome, flacon, vernis lavande, combiné crème décroché, mur poudré, lumière de fenêtre | ambiance feutrée, début de musique |
| 4,2–8,6 | **B — Le téléphone** : une main pose un smartphone sur le socle ; l'écran s'allume sur l'agenda Reso, 4 rendez-vous se posent | l'interface est composée par-dessus (HTML net en 4K) | « ding » feutré à chaque rendez-vous |
| 8,6–9,9 | **C — Macro ciseaux** : reflet qui glisse sur les lames | « vos rendez-vous, » | |
| 9,9–11,2 | **D — Macro vernis / coupelle chrome** : bascule de mise au point | « sans décrocher. » | |
| 11,2–12,6 | **E — Macro combiné décroché** | phrase maintenue | |
| 12,6–15,0 | **Signature** reso® / Beauty business simplified / essayer gratuitement · lien en bio | | logo sonore |

## Plans à générer (Higgsfield, Kling 3.0, mode `4k`, 9:16, 5 s, son `off`)

Coût : 30 crédits par plan de 5 s. Prévoir 2 essais par plan, soit ≈ 300 crédits pour les 5 plans.
Image de départ (`start_image`) : les visuels de marque, pour garder exactement le décor et la lumière.

**A — ouverture** (départ : `nature-morte.webp`)
> Slow cinematic push-in dolly, macro 100mm lens, very shallow depth of field. A still life on cream stone plinths against a powder-blue wall: frosted glass pump bottle, rolled white towel, chrome cup with combs and brushes, chrome tray with scissors, lavender nail polish, and an off-hook cream retro telephone handset in the foreground. Soft morning window light slowly sweeping across the wall, tiny dust particles in the light. Calm, elegant, luxury beauty commercial, Kodak Portra film look, subtle grain. No people, no text, no logo.

**B — le téléphone** (départ : `outils.webp`)
> Locked-off static camera, macro, shallow depth of field. A woman's manicured hand with nude nails gently places a modern smartphone face up on a cream stone plinth in front of a powder-blue wall, next to a chrome tray, scissors and lavender nail polish, then withdraws. The phone screen stays softly lit, plain cream, no interface. Soft daylight, luxury beauty commercial, film grain. No text, no logo.
> *(L'écran doit rester vierge : l'agenda Reso y est incrusté au montage. Caméra fixe obligatoire pour que l'incrustation tienne.)*

**C — macro ciseaux** (départ : `ciseaux.webp`)
> Extreme macro slow lateral dolly along polished steel salon scissors resting on a cream stone plinth, a highlight glint travelling along the blades, a folded white towel softly out of focus, powder-blue wall. Luxury beauty commercial, shallow depth of field, film grain. No text.

**D — macro vernis** (départ : `outils.webp`)
> Extreme macro slow rack focus from a chrome bowl with cotton pads to a lavender nail polish bottle, soft light shimmering on chrome, powder-blue background, cream stone plinth. Luxury beauty commercial, film grain. No text.

**E — macro combiné** (départ : `nature-morte.webp`)
> Extreme macro slow push-in on an off-hook cream retro telephone handset resting on a powder-blue surface, coiled cord, soft window light, very shallow depth of field, calm and still. Luxury beauty commercial, film grain. No text.

Ensuite : télécharger les 5 vidéos dans `videos/04-pub-4k/media/`, remplacer dans `pub.json` les `src` des plans (`"src": "media/plan-a.mp4", "from": 0.5`) et, pour B, régler l'incrustation de l'écran, puis régénérer et rendre.

## Musique

Pour la version diffusée, une piste sous licence : jazz/soul feutré, 70–80 bpm, avec une montée à ~8,5 s (arrivée de la phrase). Le kit sonore synthétisé sert de maquette.
