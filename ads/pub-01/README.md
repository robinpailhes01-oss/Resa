# Pub 01 : « Tes RDV par DM ? »

Vidéo motion design 9:16 (1080×1920, 30 i/s, 27 s), réalisée avec les vrais écrans RESO (page de réservation et agenda de la démo).

- `reso-pub-01.mp4` : la vidéo finale
- `index.html` : l'animation (timeline `T`, fonction `seek(t)`)
- `sound.py` : la bande son, synthétisée (reprend la timeline `T`)
- `render.mjs` : rendu image par image puis export MP4
- `captures/` : captures des pages démo (serveur local, données fictives)

## Cible

Des pros de la beauté indépendants :
- qui gèrent encore leurs rendez-vous par DM, SMS ou téléphone ;
- ou qui paient un logiciel de réservation qu'ils trouvent trop cher.

## Découpage

| Temps | Scène | Texte | Son |
|---|---|---|---|
| 0–2,7 s | **Hook** : écran verrouillé à 22:14, les DM s'empilent, le téléphone vibre | Tu prends encore tes RDV par DM ? | vibrations, pops, montée de tension, impact |
| 2,7–5,5 s | Le logiciel trop cher : compteur 49 → 99 €/mois, barré | Ou alors tu paies un logiciel trop cher. | ticks, scratch |
| 5,5–7,3 s | Révélation : logo reso avec reflet chromé | Il y a plus simple. | whoosh, scintillement, la musique démarre |
| 7,3–14 s | Téléphone en 3D : vraie page de réservation → créneau → « C'est réservé ! » | Ton lien de réservation. / Ta cliente choisit. / Elle réserve seule. Même à 23h. | taps, carillon de validation |
| 14–18,7 s | Agenda : le rendez-vous tombe dans le créneau, puis confirmation, rappel, avis | Ton agenda se remplit seul. | impact sourd, 3 carillons |
| 18,7–22,6 s | Prix : rouleaux 99 → 29 € | Tout ça pour 29 € par mois, TTC · Sans engagement · Même prix pour toute l'équipe | musique filtrée, impact |
| 22,6–27 s | Carte de fin | Tes rendez-vous, sans décrocher. · 7 jours gratuits · sans carte bancaire · Essaie gratuitement · reso-app.fr | clic, accord final |

## Texte de la pub dans Meta

- **Texte principal** : Encore un DM pour demander tes dispos ? 📩
  Avec RESO, tes clientes réservent seules depuis ton lien, 24h/24. Confirmation, rappel la veille et demande d'avis Google partent tout seuls.
  29 €/mois TTC, sans engagement, même prix pour toute l'équipe.
  👉 7 jours gratuits, sans carte bancaire.
- **Titre** : Tes rendez-vous, sans décrocher
- **Description** : 7 jours gratuits · sans carte bancaire
- **Bouton** : S'inscrire
- **URL** : `https://www.reso-app.fr/?utm_source=meta&utm_medium=paid&utm_campaign=acq_v1&utm_content=pub01_dm`

## Re-générer

```bash
npm ci && RESO_LAUNCH_MODE=live npx next dev   # pour refaire les captures (http://localhost:3000/demo…)
pip install numpy
python3 ads/pub-01/sound.py /tmp/sound.wav
cd ads/pub-01 && node render.mjs /tmp/sound.wav reso-pub-01.mp4
```
