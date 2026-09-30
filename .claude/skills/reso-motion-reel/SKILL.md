---
name: reso-motion-reel
description: Reels Reso sans visage, en motion design pur dans l'identité poudrée — format « notifications » (des notifications Reso qui s'empilent au-dessus de la nature morte au combiné décroché, balayage, grande phrase de marque, signature reso®), musique et bruitages du kit sonore. À utiliser pour un Reel / TikTok court sans tournage, pour adapter une vidéo de référence (tendance « notifications qui s'empilent », « phone on table ») à la marque, ou pour décliner rapidement plusieurs variantes de messages.
---

# Reels motion Reso (sans visage)

Formats de 12 à 20 s entièrement générés en HTML (HyperFrames), dans l'identité « nature morte poudrée » (`/reso-video-charte`) : décor de marque, typographie Outfit, étiquettes [00x] en JetBrains Mono, annotations Caveat, cadre crème, grain, signature reso® avec logo sonore. Aucun tournage nécessaire.

## Format « notifications » — `scripts/build-notifs.mjs`

Adapté d'une référence « notifications qui s'empilent au-dessus d'un téléphone posé » :

1. **Mise au point** sur la nature morte (flou → net), lente avancée de caméra.
2. **Notifications Reso** (verre crème, icône bleu nuit reso) qui s'empilent au-dessus du combiné, chacune avec un « ding » ; rythme qui s'accélère.
3. **Balayage** vers la droite, avec souffle.
4. **Bascule de mise au point** : le décor se floute et s'assombrit, une ou deux grandes phrases montent de leur masque (étiquette tapée, annotation manuscrite soulignée).
5. **Signature reso®** + CTA, logo sonore.

```bash
mkdir -p videos/03-notifications
cp .claude/skills/reso-motion-reel/templates/notifs.example.json videos/03-notifications/reel.json   # puis éditer
node .claude/skills/reso-motion-reel/scripts/build-notifs.mjs videos/03-notifications
npx hyperframes lint videos/03-notifications
npx hyperframes snapshot videos/03-notifications --at 1.5,3.2,6,8.5,12,14.5   # relire la planche contact
npx hyperframes render videos/03-notifications --quality delivery --output videos/03-notifications/renders/brut.mp4
# sans voix, remonter le son au standard des réseaux (−15 LUFS) :
ffmpeg -i …/brut.mp4 -c:v copy -af "loudnorm=I=-15:TP=-1.5:LRA=9" -c:a aac -b:a 192k …/03-notifications-v1.mp4
```

Dans un conteneur où le Chrome de HyperFrames ne démarre pas : `HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.

### `reel.json`

| Champ | Rôle |
| --- | --- |
| `background.src` | image de décor : nom d'un fichier de `reso-video-charte/assets/images/` (défaut `nature-morte.webp`, le combiné décroché) ou chemin dans le projet ; **jamais une image avec du texte incrusté** |
| `background.focusX / focusY` | cadrage de l'image en % (le combiné doit être sous la pile de notifications) |
| `background.blur`, `textBlur` | flou du décor pendant les notifications (défaut 2 px) et sous les phrases (défaut 11 px) |
| `notifications[]` | `{ title, text, when? }` — 4 à 6, données fictives cohérentes avec l'établissement de démo (Julie Martin, Chloé Bernard…) ; `when` défaut « maintenant » |
| `notificationsStart`, `notificationGaps[]`, `holdAfterNotifications` | rythme (défaut : 1,1 s puis écarts 1,0 → 0,55 s ; 1,1 s de pause avant le balayage) |
| `stackBottom` | position (px) du bas de la pile (défaut 1180) |
| `headlines[]` | `{ kicker, lines[], script?, duration? }` — phrases de marque en minuscules (reprendre celles du site : « vos rendez-vous, sans décrocher. ») |
| `cta` | ligne mono sous la signature (ex. « essayer gratuitement · lien en bio ») |
| `stingDuration`, `frame`, `fps` | durée de la signature (2,4 s), cadre crème (26 px), images par seconde (30) |

Règles de contenu : pas de faux avis ni de chiffres inventés dans les notifications (« Demande d'avis envoyée » oui, « ★★★★★ Super salon ! » non) ; promesses et CTA conformes à `src/config/offer.ts` et au site.

## Idées de variantes (même moteur)

- « Pendant que vous êtes au bac » : notifications nocturnes (`when`: « 23:14 », « 06:52 ») → « vos clientes réservent la nuit. vous, vous dormez. »
- Rappels : « Rappel envoyé » ×5 → « zéro lapin. enfin presque. »
- Avis : « Demande d'avis envoyée » ×4 → « vos avis, sur votre fiche google. »
- Série numérotée [001], [002]… dans l'étiquette pour relier les épisodes.

## Format « pub » 4K — `scripts/build-pub.mjs`

Film de 15 s en 2160×3840 (grille de dessin 1080×1920 agrandie ×2 : textes et vecteurs nets en 4K). Référence : `videos/04-pub-4k/` (`pub.json`, découpage et prompts dans `plans.md`).

1. **Animatique** avec les visuels fixes de la charte (`"src": "brand:nature-morte.webp"`) pour valider rythme, typographie et son.
2. **Plans finaux** générés (Higgsfield, Kling 3.0 mode `4k`, 9:16, image de départ = visuel de marque) ou tournés, déposés dans `media/`, puis `"src": "media/plan-a.mp4", "from": 0.4` dans `pub.json`.

`pub.json` : `size` ([2160, 3840]), `bpm`, `shots[]` (`src`, `start`, `dur`, `focus` [x %, y %], `zoom` [début, fin], `pan` [x début, x fin], `focusPull` [flou px départ, arrivée, durée], `fadeIn`), un plan `{"type": "phone"}` (téléphone 3D posé sur le décor `bg`, agenda qui se remplit ; ou, avec `src` vidéo à caméra fixe, agenda incrusté dans `screen.quad` = 4 coins de l'écran en px de la grille 1080×1920, `screen.at`, `screen.radius`), `headlines[]` (`at`, `until`, `lines`, `lineDelays`, `top`), `sting` (`at`, `dur`, `cta`), `music` (piste sous licence, sinon kit synthétisé).

Rendu 4K : long (≈ 10 min pour 15 s sans GPU) ; toujours relire une planche contact avant. Puis `loudnorm=I=-15` sur le son (pas de voix).
