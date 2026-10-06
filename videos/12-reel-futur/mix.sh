#!/usr/bin/env bash
# Mixage du Reel 12 v2 « J'ai 45 secondes » : voix André (narrateur) + Céline (réplique), musique et bruitages.
# Prérequis :
#   node ../../.claude/skills/reso-video-charte/scripts/sound-kit.mjs audio --bed 68 --bpm 100
#   ./make-sfx.sh (audio/riser.wav, audio/impact.wav)
#   media/vo/*.wav : répliques retouchées (pauses raccourcies, André +12 %, voir SCRIPT.md)
#   npx hyperframes render --quality high --resolution landscape-4k --output renders/video.mp4
# Sortie : renders/12-reel-futur.mp4 (−14 LUFS).
set -euo pipefail
cd "$(dirname "$0")"
A=audio
DUR=67.2

# Voix : réplique, position dans la vidéo (s).
VO=(
  "l1 0.15"   # Ok ! J'ai 45 secondes…
  "l2 6.00"   # Soyons honnêtes…
  "l3 15.70"  # Avec Réso…
  "n0 24.60"  # Mais ce n'est pas tout.
  "n1 26.50"  # Et ça… ce n'est que le début.
  "n2 28.50"  # Bientôt, votre page… Google… IA
  "n3 36.30"  # Un agent IA… community manager
  "n4 45.20"  # Une cliente qui n'est pas revenue…
  "n5 50.90"  # Bon… j'ai dépassé. Essayez Réso…
  "l7 61.10"  # (Céline) Attends… t'as vraiment annoncé ChatGPT ?
  "l8 64.20"  # Bientôt ! Mais avoue que ça donne envie.
)

# Bruitages : fichier, instant (s), gain. (recalés après construction des scènes)
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
  "riser 25.75 0.8"    # coupure → « ce n'est que le début »
  "impact 28.00 0.9"   # rallumage
  "impact 32.36 0.7"   # BIENTÔT SEO
  "impact 35.24 0.7"   # BIENTÔT GEO
  "whoosh 38.00 0.45"  # photos qui volent
  "tick 40.80 0.35"    # publications programmées
  "tick 41.20 0.35"
  "tick 41.60 0.35"
  "tick 42.00 0.35"
  "impact 44.20 0.75"  # BIENTÔT agent
  "tick 49.00 0.4"     # message de relance envoyé
  "ding 49.80 0.45"    # Julie a réservé
  "impact 50.28 0.7"   # BIENTÔT relance
  "buzz 51.36 0.45"    # chrono qui tremble
  "tick 56.10 0.4"     # 7 jours offerts
  "tick 56.80 0.4"     # sans carte bancaire
  "paper 58.90 0.45"   # 39 € HT/mois
  "tick 60.00 0.45"    # clic Créer ma page
  "tick 61.24 0.35"    # bulle Céline
  "paper 64.48 0.5"    # BIENTÔT (réponse)
  "logo 65.56 0.7"     # signature
)

inputs=(-i renders/video.mp4 -i "$A/bed.wav")
filters=""; vmix=""; n=2
for v in "${VO[@]}"; do
  read -r file at <<<"$v"
  inputs+=(-i "media/vo/$file.wav")
  ms=$(awk "BEGIN{printf \"%d\", $at*1000}")
  filters+="[$n:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[v$n];"
  vmix+="[v$n]"; n=$((n + 1))
done
filters+="${vmix}amix=inputs=${#VO[@]}:normalize=0,loudnorm=I=-16:TP=-2:LRA=9,asplit=2[voice][key];"
smix=""
for s in "${SFX[@]}"; do
  read -r name at gain <<<"$s"
  inputs+=(-i "$A/$name.wav")
  ms=$(awk "BEGIN{printf \"%d\", $at*1000}")
  filters+="[$n:a]aformat=channel_layouts=stereo,volume=$gain,adelay=${ms}|${ms}[s$n];"
  smix+="[s$n]"; n=$((n + 1))
done
# Musique : coupée pendant la bascule (25.8 → 28.0 s), baissée sous la voix, fondu final.
filters+="[1:a]atrim=0:$DUR,volume='if(between(t,25.8,28.0),0.05,0.45)':eval=frame,afade=t=in:d=0.2,afade=t=out:st=$(awk "BEGIN{print $DUR-1.5}"):d=1.5[bedr];"
filters+="[bedr][key]sidechaincompress=threshold=0.03:ratio=7:attack=25:release=350[bed];"
filters+="[bed][voice]${smix}amix=inputs=$((${#SFX[@]} + 2)):normalize=0,atrim=0:$DUR,loudnorm=I=-14:TP=-1.5:LRA=10[a]"
ffmpeg -y -v error "${inputs[@]}" -filter_complex "$filters" -map 0:v -map "[a]" \
  -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart renders/12-reel-futur.mp4
echo "✔ renders/12-reel-futur.mp4"
