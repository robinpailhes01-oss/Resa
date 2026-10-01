#!/usr/bin/env bash
# Mixage audio de la vidéo 09 (kit sonore Reso, sans voix) sur le rendu muet.
# Prérequis : node ../../.claude/skills/reso-video-charte/scripts/sound-kit.mjs audio --bed 31 --bpm 84
#             npx hyperframes render --skill=product-launch-video --quality high --output renders/video.mp4
# Sortie : renders/09-promo-motion-v1.mp4 (−15 LUFS).
set -euo pipefail
cd "$(dirname "$0")"
A=audio

# Bruitages : fichier, instant (s), gain.
SFX=(
  "type 1.9 0.55"      # requête tapée dans la barre de recherche
  "whoosh 4.35 0.7"    # zoom à travers la barre
  "logo 5.0 0.9"       # reso® se forme
  "whoosh 6.85 0.45"
  "paper 7.2 0.5"      # « On crée votre page… »
  "whoosh 11.35 0.45"
  "tick 13.45 0.9"     # clic sur 10:30
  "ding 14.95 0.7"     # réservation confirmée
  "whoosh 15.85 0.45"
  "ding 18.25 0.8"     # le rendez-vous tombe dans l'agenda
  "whoosh 19.85 0.45"
  "tick 21.33 0.7"     # confirmation
  "tick 22.08 0.7"     # rappel
  "tick 22.83 0.7"     # avis
  "whoosh 24.35 0.45"
  "tick 27.38 0.9"     # clic « Créer ma page »
  "logo 27.95 1.0"     # signature
)

inputs=(-i renders/video.mp4 -i "$A/bed.wav")
filters="[1:a]atrim=0:30,volume=0.9,afade=t=in:d=0.6,afade=t=out:st=28.2:d=1.8[bed];"
mix="[bed]"
n=2
for s in "${SFX[@]}"; do
  read -r name at gain <<<"$s"
  inputs+=(-i "$A/$name.wav")
  ms=$(awk "BEGIN{printf \"%d\", $at*1000}")
  filters+="[$n:a]volume=$gain,adelay=${ms}|${ms}[s$n];"
  mix+="[s$n]"
  n=$((n + 1))
done
count=$((n - 1))
filters+="${mix}amix=inputs=$count:normalize=0,atrim=0:30,loudnorm=I=-15:TP=-1.5:LRA=11[a]"

ffmpeg -y -v error "${inputs[@]}" -filter_complex "$filters" -map 0:v -map "[a]" \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart renders/09-promo-motion-v1.mp4
echo "✔ renders/09-promo-motion-v1.mp4"
