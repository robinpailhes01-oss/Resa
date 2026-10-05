#!/usr/bin/env bash
# Mixage du Reel 12 « J'ai 45 secondes » : voix André (narrateur) + Céline (réplique), musique et bruitages Reso.
# Prérequis :
#   node ../../.claude/skills/reso-video-charte/scripts/sound-kit.mjs audio --bed 60 --bpm 100
#   media/vo/l1..l8.wav : répliques retouchées (pauses raccourcies, André +12 %, voir SCRIPT.md)
#   npx hyperframes render --quality high --resolution landscape-4k --output renders/video.mp4
# Sortie : renders/12-reel-futur.mp4 (−14 LUFS).
set -euo pipefail
cd "$(dirname "$0")"
A=audio
DUR=59.5

# Voix : réplique, position dans la vidéo (s).
VO=(
  "l1 0.15"   # Ok ! J'ai 45 secondes…
  "l2 6.00"   # Soyons honnêtes…
  "l3 15.70"  # Avec Réso…
  "l4 24.60"  # Mais ce n'est pas tout ! Bientôt…
  "l5 36.50"  # Et même… un café
  "l6 42.00"  # Mais en attendant, essayez Réso…
  "l7 53.40"  # (Céline) Attends… t'as vraiment annoncé ChatGPT ?
  "l8 56.50"  # Bientôt ! Mais avoue que ça donne envie.
)

# Bruitages : fichier, instant (s), gain.
SFX=(
  "buzz 4.72 0.45"     # appel entrant
  "tick 8.03 0.4"      # carte SMS
  "tick 8.60 0.4"      # carte Insta
  "tick 9.82 0.4"      # agenda papier
  "whoosh 11.58 0.5"   # ça part dans tous les sens
  "ding 19.04 0.45"    # réservé à 22:47
  "tick 21.06 0.45"    # rendez-vous dans l'agenda
  "tick 21.96 0.4"     # rappel la veille
  "tick 23.22 0.4"     # demande d'avis
  "paper 29.96 0.5"    # BIENTÔT (SEO)
  "paper 32.63 0.5"    # BIENTÔT (GEO)
  "paper 35.08 0.5"    # BIENTÔT (agents)
  "tick 35.50 0.35"    # Programmer
  "tick 38.60 0.45"    # clic cafetière
  "buzz 38.85 0.3"     # échec
  "paper 41.10 0.55"   # PAS ENCORE
  "tick 45.06 0.4"     # 7 jours offerts
  "tick 45.67 0.4"     # sans carte bancaire
  "paper 49.46 0.45"   # 39 € HT/mois
  "tick 52.00 0.45"    # clic Créer ma page
  "tick 53.50 0.35"    # bulle Céline
  "paper 56.55 0.5"    # BIENTÔT (réponse)
  "logo 57.90 0.7"     # signature
)

inputs=(-i renders/video.mp4 -i "$A/bed.wav")
filters=""; vmix=""; n=2
for v in "${VO[@]}"; do
  read -r file at <<<"$v"
  inputs+=(-i "media/vo/$file.wav")
  ms=$(awk "BEGIN{printf \"%d\", $at*1000}")
  filters+="[$n:a]aresample=48000,adelay=${ms}|${ms}[v$n];"
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
filters+="[1:a]atrim=0:$DUR,volume=0.45,afade=t=in:d=0.2,afade=t=out:st=$(awk "BEGIN{print $DUR-1.5}"):d=1.5[bedr];"
filters+="[bedr][key]sidechaincompress=threshold=0.03:ratio=7:attack=25:release=350[bed];"
filters+="[bed][voice]${smix}amix=inputs=$((${#SFX[@]} + 2)):normalize=0,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=10[a]"
ffmpeg -y -v error "${inputs[@]}" -filter_complex "$filters" -map 0:v -map "[a]" \
  -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart renders/12-reel-futur.mp4
echo "✔ renders/12-reel-futur.mp4"
