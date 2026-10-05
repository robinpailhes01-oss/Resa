#!/usr/bin/env bash
# Bruitages propres au Reel 12 v2 (en plus du kit sonore Reso) : montée et impact grave.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p audio
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.5*sin(2*PI*(180*t+900*t*t/2/0.85))*pow(t/0.85,2)+0.25*(random(0)*2-1)*pow(t/0.85,3)':s=48000:d=0.85" \
  -af "highpass=f=150,lowpass=f=6000,afade=t=out:st=0.8:d=0.05,loudnorm=I=-20,alimiter=limit=0.5" -ac 2 audio/riser.wav
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.9*sin(2*PI*(52*t-20*t*t))*exp(-5*t)+0.5*(random(0)*2-1)*exp(-30*t)':s=48000:d=0.9" \
  -af "lowpass=f=2500,alimiter=limit=0.5" -ac 2 audio/impact.wav
echo "✔ audio/riser.wav, audio/impact.wav"
