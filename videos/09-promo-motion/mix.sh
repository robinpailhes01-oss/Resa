#!/usr/bin/env bash
# Mixage audio de la vidéo 09 : voix off (phrase par phrase), musique et bruitages Reso, sur le rendu muet.
# Prérequis :
#   node ../../.claude/skills/reso-video-charte/scripts/sound-kit.mjs audio --bed 38 --bpm 84
#   media/vo.mp3 : prise voix off retenue (SCRIPT.md)
#   npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4
# Sortie : renders/09-promo-motion-v2.mp4 (−15 LUFS).
set -euo pipefail
cd "$(dirname "$0")"
A=audio
DUR=37.3

# Voix : phrase = début dans la prise, fin dans la prise, position dans la vidéo (s).
VO=(
  "0.00 3.90 0.30"     # Vos clientes vous cherchent en ligne… tout de suite !
  "3.90 5.77 4.74"     # Avec Réso, c'est simple.
  "5.77 10.71 6.96"    # Vous avez votre propre page de réservation…
  "10.71 14.69 12.01"  # Vos clientes choisissent leur créneau…
  "14.69 17.14 16.55"  # Et tout arrive directement dans votre agenda.
  "17.14 22.79 20.62"  # Votre tableau de bord vous montre…
  "22.79 27.09 26.92"  # Confirmation, rappel, demande d'avis…
  "27.09 31.00 31.30"  # Essayez Réso gratuitement…
)

# Bruitages : fichier, instant (s), gain.
SFX=(
  "type 1.9 0.4"       # requête tapée
  "whoosh 4.35 0.6"    # zoom à travers la barre
  "logo 4.9 0.6"       # reso® se forme
  "whoosh 6.6 0.35"    # fenêtre « Ma page »
  "tick 10.9 0.6"      # pastille avis
  "tick 13.95 0.7"     # clic sur le créneau
  "ding 15.45 0.5"     # réservation confirmée
  "ding 18.6 0.6"      # rendez-vous dans l'agenda
  "tick 22.6 0.55"     # tuile rendez-vous
  "tick 23.4 0.55"     # tuile revenus
  "tick 24.3 0.55"     # tuile remplissage
  "tick 27.85 0.5"     # confirmation
  "tick 28.6 0.5"      # rappel
  "tick 29.35 0.5"     # avis
  "tick 34.18 0.6"     # clic « Créer ma page »
  "logo 34.75 0.9"     # signature
)

inputs=(-i renders/video.mp4 -i "$A/bed.wav")
filters=""
vmix=""
n=2
for v in "${VO[@]}"; do
  read -r from to at <<<"$v"
  inputs+=(-i media/vo.mp3)
  ms=$(awk "BEGIN{printf \"%d\", $at*1000}")
  filters+="[$n:a]atrim=$from:$to,asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.03,afade=t=out:st=$(awk "BEGIN{print $to-$from-0.06}"):d=0.06,adelay=${ms}|${ms}[v$n];"
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
  -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart renders/09-promo-motion-v2.mp4
echo "✔ renders/09-promo-motion-v2.mp4"
