#!/usr/bin/env bash
# Mixage audio de la vidéo 09 : voix off (phrase par phrase), musique et bruitages Reso, sur le rendu muet.
# Prérequis :
#   node ../../.claude/skills/reso-video-charte/scripts/sound-kit.mjs audio --bed 38 --bpm 84
#   media/vo.mp3 : prise voix off retenue (SCRIPT.md)
#   npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4
# Sortie : renders/09-promo-motion-v3.mp4 (−15 LUFS).
set -euo pipefail
cd "$(dirname "$0")"
A=audio
DUR=37.7
TEMPO=1.06   # voix légèrement accélérée (timbre inchangé)

# Voix : phrase = début dans la prise, fin dans la prise, position dans la vidéo (s).
VO=(
  "0.00 2.10 0.25"     # Vos clientes vous cherchent en ligne…
  "2.90 6.00 2.35"     # …et elles veulent réserver, tout de suite !
  "6.00 7.90 5.15"     # Avec Réso, c'est simple.
  "7.90 13.45 7.00"    # Vous avez votre propre page de réservation…
  "13.45 18.30 12.20"  # Vos clientes choisissent leur créneau…
  "18.30 21.95 16.70"  # Et tout arrive directement dans votre agenda.
  "21.95 28.75 20.70"  # Votre tableau de bord vous montre…
  "28.75 34.10 27.40"  # Confirmation, rappel, demande d'avis…
  "34.10 38.43 31.70"  # Essayez Réso gratuitement…
)

# Bruitages : fichier, instant (s), gain.
SFX=(
  "type 1.9 0.4"       # requête tapée
  "whoosh 4.35 0.6"    # zoom à travers la barre
  "logo 4.9 0.6"       # reso® se forme
  "whoosh 6.8 0.35"    # fenêtre « Ma page »
  "tick 11.15 0.6"     # pastille avis
  "tick 14.15 0.7"     # clic sur le créneau
  "ding 15.65 0.5"     # réservation confirmée
  "ding 18.8 0.6"      # rendez-vous dans l'agenda
  "tick 22.7 0.55"     # tuile rendez-vous
  "tick 23.5 0.55"     # tuile revenus
  "tick 24.4 0.55"     # tuile remplissage
  "tick 28.23 0.5"     # confirmation
  "tick 28.98 0.5"     # rappel
  "tick 29.73 0.5"     # avis
  "tick 34.58 0.6"     # clic « Créer ma page »
  "logo 35.15 0.9"     # signature
)

inputs=(-i renders/video.mp4 -i "$A/bed.wav")
filters=""
vmix=""
n=2
for v in "${VO[@]}"; do
  read -r from to at <<<"$v"
  inputs+=(-i media/vo.mp3)
  ms=$(awk "BEGIN{printf \"%d\", $at*1000}")
  filters+="[$n:a]atrim=$from:$to,asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.03,atempo=$TEMPO,afade=t=out:st=$(awk "BEGIN{print ($to-$from)/$TEMPO-0.06}"):d=0.06,adelay=${ms}|${ms}[v$n];"
  vmix+="[v$n]"
  n=$((n + 1))
done
nvo=$(( ${#VO[@]} ))
filters+="${vmix}amix=inputs=$nvo:normalize=0,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-2:LRA=9,asplit=2[voice][key];"

smix=""
for s in "${SFX[@]}"; do
  read -r name at gain <<<"$s"
  inputs+=(-i "$A/$name.wav")
  ms=$(awk "BEGIN{printf \"%d\", $at*1000}")
  filters+="[$n:a]volume=$gain,adelay=${ms}|${ms}[s$n];"
  smix+="[s$n]"
  n=$((n + 1))
done
nsfx=${#SFX[@]}

# Musique : baissée sous la voix (sidechain), remonte sur la signature finale.
filters+="[1:a]atrim=0:$DUR,volume=0.55,afade=t=in:d=0.6,afade=t=out:st=$(awk "BEGIN{print $DUR-2}"):d=2[bedr];"
filters+="[bedr][key]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450[bed];"
filters+="[bed][voice]${smix}amix=inputs=$((nsfx + 2)):normalize=0,atrim=0:$DUR,loudnorm=I=-15:TP=-1.5:LRA=11[a]"

ffmpeg -y -v error "${inputs[@]}" -filter_complex "$filters" -map 0:v -map "[a]" \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart renders/09-promo-motion-v3.mp4
echo "✔ renders/09-promo-motion-v3.mp4"
