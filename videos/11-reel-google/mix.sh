#!/usr/bin/env bash
# Mixage du Reel 11 (une variante de hook) : voix off « Céline », musique discrète et bruitages Reso.
# Usage : ./mix.sh a|b|c   (attend renders/video-<v>.mp4, rendu muet de la variante)
# Prérequis : node ../../.claude/skills/reso-video-charte/scripts/sound-kit.mjs audio --bed 21 --bpm 88
# Sortie : renders/11-reel-google-<v>.mp4 (−14 LUFS, cible Reels / Meta Ads).
set -euo pipefail
cd "$(dirname "$0")"
V=${1:?variante a, b ou c}
HOOK=media/hook-$V.mp3
[ "$V" = c ] && HOOK=media/hook-c2.mp3
A=audio
DUR=20.0
TEMPO=1.08   # voix légèrement accélérée (timbre inchangé)

# Voix : fichier, position dans la vidéo (s).
VO=(
  "$HOOK 0.10"
  "media/vo-1.mp3 3.90"    # Collez simplement le lien de votre fiche Google.
  "media/vo-2.mp3 7.80"    # Ajoutez vos prestations et vos disponibilités.
  "media/vo-3.mp3 11.35"   # Et votre page de réservation est prête à être partagée.
  "media/vo-cta.mp3 16.40" # Essayez Réso gratuitement pendant sept jours. Sans carte bancaire.
)

# Bruitages : fichier, instant (s), gain.
SFX=(
  "whoosh 3.30 0.35"   # zoom à travers le champ
  "tick 4.85 0.5"      # Rechercher
  "tick 5.60 0.45"     # fiche choisie
  "paper 5.95 0.35"    # fiche importée
  "tick 8.50 0.4"      # coches
  "tick 8.82 0.4"
  "tick 9.14 0.4"
  "tick 9.56 0.45"     # Ajouter les prestations cochées
  "tick 13.08 0.4"     # taps du parcours cliente
  "tick 13.50 0.4"
  "tick 13.92 0.4"
  "ding 14.10 0.45"    # rendez-vous confirmé
  "ding 15.50 0.6"     # nouveau rendez-vous
  "logo 17.50 0.7"     # signature
)

inputs=(-i "renders/video-$V.mp4" -i "$A/bed.wav")
filters=""; vmix=""; n=2
for v in "${VO[@]}"; do
  read -r file at <<<"$v"
  inputs+=(-i "$file")
  ms=$(awk "BEGIN{printf \"%d\", $at*1000}")
  filters+="[$n:a]aresample=48000,atempo=$TEMPO,adelay=${ms}|${ms}[v$n];"
  vmix+="[v$n]"; n=$((n + 1))
done
filters+="${vmix}amix=inputs=${#VO[@]}:normalize=0,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-2:LRA=9,asplit=2[voice][key];"
smix=""
for s in "${SFX[@]}"; do
  read -r name at gain <<<"$s"
  inputs+=(-i "$A/$name.wav")
  ms=$(awk "BEGIN{printf \"%d\", $at*1000}")
  filters+="[$n:a]volume=$gain,adelay=${ms}|${ms}[s$n];"
  smix+="[s$n]"; n=$((n + 1))
done
# Musique très discrète, baissée sous la voix, remonte légèrement sur la signature.
filters+="[1:a]atrim=0:$DUR,volume=0.42,afade=t=in:d=0.3,afade=t=out:st=$(awk "BEGIN{print $DUR-1.2}"):d=1.2[bedr];"
filters+="[bedr][key]sidechaincompress=threshold=0.03:ratio=7:attack=30:release=400[bed];"
filters+="[bed][voice]${smix}amix=inputs=$((${#SFX[@]} + 2)):normalize=0,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=10[a]"
ffmpeg -y -v error "${inputs[@]}" -filter_complex "$filters" -map 0:v -map "[a]" \
  -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart "renders/11-reel-google-$V.mp4"
echo "✔ renders/11-reel-google-$V.mp4"
