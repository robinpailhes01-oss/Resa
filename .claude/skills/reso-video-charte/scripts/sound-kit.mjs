#!/usr/bin/env node
// Kit sonore Reso, synthétisé (libre de droits, déterministe) :
//   bed.wav     musique d'ambiance jazz lo-fi (piano électrique, basse, batterie feutrée, vinyle)
//   logo.wav    logo sonore (3 notes, timbre piano électrique + cloche douce)
//   tick.wav    clic net (réservation qui se pose, pastille)
//   ding.wav    notification douce (deux notes)
//   whoosh.wav  souffle de transition
//   paper.wav   froissement de papier (titre qui entre)
//   type.wav    8 frappes de machine à écrire (étiquettes [01])
//   ring.wav    sonnerie de téléphone générique (interruption, pubs « avec / sans »)
//   buzz.wav    vibration de téléphone sur un comptoir
//
// Usage : node sound-kit.mjs <dossier> [--bed <secondes>] [--bpm 78]
// Les fichiers sont normalisés avec ffmpeg (musique à −24 LUFS, jouée à 50 % sous la voix, bruitages crête −6 dBFS) :
// dans la composition, la musique est placée vers −30 LUFS sous la voix (−16 LUFS) et remonte sur la signature.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? Number(args[i + 1]) : d;
};
const OUT = resolve(args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--")) ?? ".");
const BED = opt("bed", 30);
const BPM = opt("bpm", 78);
const SR = 48000;
mkdirSync(OUT, { recursive: true });

// PRNG déterministe (mulberry32).
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const TAU = Math.PI * 2;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

function writeWav(name, data) {
  const n = data.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  let peak = 1e-9;
  for (const v of data) peak = Math.max(peak, Math.abs(v));
  const g = peak > 0.98 ? 0.98 / peak : 1;
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.tanh(data[i] * g) * 32767), 44 + i * 2);
  const raw = join(OUT, `.${name}.raw.wav`);
  writeFileSync(raw, buf);
  return raw;
}
function finalize(name, data, filter) {
  const raw = writeWav(name, data);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af", filter, "-ar", "48000", "-ac", "2", join(OUT, `${name}.wav`)]);
  rmSync(raw);
}

// Filtre passe-bas à un pôle (en place).
function lowpass(x, fc) {
  const a = Math.exp((-TAU * fc) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    y = (1 - a) * x[i] + a * y;
    x[i] = y;
  }
  return x;
}
// Filtre passe-bande (état variable), fréquence éventuellement variable.
function bandpass(x, fcAt, q = 1.2) {
  let lp = 0,
    bp = 0;
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const f = 2 * Math.sin((Math.PI * Math.min(fcAt(i / SR), SR / 6)) / SR);
    const hp = x[i] - lp - bp / q;
    bp += f * hp;
    lp += f * bp;
    out[i] = bp;
  }
  return out;
}

// Voix de piano électrique (tine) : fondamentale + harmoniques, attaque de cloche, trémolo.
function ep(buf, t0, midi, dur, vel = 0.22) {
  const f = mtof(midi);
  const i0 = Math.floor(t0 * SR);
  const len = Math.floor((dur + 1.6) * SR);
  for (let k = 0; k < len && i0 + k < buf.length; k++) {
    const t = k / SR;
    const rel = t > dur ? Math.exp(-(t - dur) / 0.35) : 1;
    const env = Math.min(1, t / 0.004) * Math.exp(-t / 2.2) * rel;
    const trem = 1 + 0.12 * Math.sin(TAU * 4.6 * t);
    const v =
      Math.sin(TAU * f * t) +
      0.3 * Math.sin(TAU * 2 * f * t) * Math.exp(-t / 0.7) +
      0.1 * Math.sin(TAU * 3 * f * t) * Math.exp(-t / 0.25) +
      0.16 * Math.sin(TAU * 7.1 * f * t) * Math.exp(-t / 0.035);
    buf[i0 + k] += vel * env * trem * v;
  }
}

// ─── Musique d'ambiance ─────────────────────────────────────────────────────
{
  const n = Math.floor((BED + 2) * SR);
  const mus = new Float32Array(n);
  const drums = new Float32Array(n);
  const R = rng(7);
  const beat = 60 / BPM;
  const swing = 0.6; // croche swinguée
  // Fmaj9 – Em7 – Dm9 – Cmaj7 (voicings resserrés, voix conduites)
  const prog = [
    { root: 41, chord: [57, 60, 64, 67] },
    { root: 40, chord: [55, 59, 62, 64] },
    { root: 38, chord: [53, 57, 60, 64] },
    { root: 36, chord: [52, 55, 59, 62] },
  ];
  const bars = Math.ceil(BED / (4 * beat)) + 1;
  for (let b = 0; b < bars; b++) {
    const { root, chord } = prog[b % prog.length];
    const t = b * 4 * beat;
    // accords : temps 1 et « et » du 2 (légère arpégiation)
    for (const [at, vel, len] of [
      [0, 0.2, 1.6 * beat],
      [1 + swing, 0.13, 1.2 * beat],
    ])
      chord.forEach((m, j) => ep(mus, t + at * beat + j * 0.012, m, len, vel * (j === 0 ? 1 : 0.85)));
    // mélodie discrète une mesure sur deux
    if (b % 2 === 1) ep(mus, t + 3 * beat, chord[3] + 12, 0.8 * beat, 0.07);
    // basse
    for (const [at, m] of [
      [0, root],
      [2, root + 7],
      [3 + swing, root + 12],
    ]) {
      const i0 = Math.floor((t + at * beat) * SR);
      const f = mtof(m - 12 + 12);
      for (let k = 0; k < 0.9 * SR && i0 + k < n; k++) {
        const tt = k / SR;
        mus[i0 + k] += 0.3 * Math.min(1, tt / 0.01) * Math.exp(-tt / 0.45) * (Math.sin(TAU * f * tt) + 0.25 * Math.sin(TAU * 2 * f * tt));
      }
    }
    // batterie : grosse caisse 1 et 3, caisse claire douce 2 et 4, charleston swingué
    for (let q = 0; q < 4; q++) {
      const tb = t + q * beat;
      const ib = Math.floor(tb * SR);
      if (q === 0 || q === 2)
        for (let k = 0; k < 0.3 * SR && ib + k < n; k++) {
          const tt = k / SR;
          const f = 48 + 70 * Math.exp(-tt / 0.03);
          drums[ib + k] += 0.55 * Math.exp(-tt / 0.16) * Math.sin(TAU * f * tt);
        }
      if (q === 1 || q === 3)
        for (let k = 0; k < 0.18 * SR && ib + k < n; k++) {
          const tt = k / SR;
          drums[ib + k] += 0.09 * Math.exp(-tt / 0.07) * (R() * 2 - 1);
        }
      for (const off of [0, swing]) {
        const ih = Math.floor((tb + off * beat) * SR);
        const amp = off ? 0.03 : 0.045;
        let prev = 0;
        for (let k = 0; k < 0.05 * SR && ih + k < n; k++) {
          const w = R() * 2 - 1;
          drums[ih + k] += amp * Math.exp(-(k / SR) / 0.012) * (w - prev);
          prev = w;
        }
      }
    }
  }
  lowpass(drums, 6000);
  // vinyle : souffle + craquements épars
  for (let i = 0; i < n; i++) {
    mus[i] += drums[i] + 0.004 * (R() * 2 - 1);
    if (R() < 0.00018) {
      const amp = 0.06 + 0.12 * R();
      for (let k = 0; k < 40 && i + k < n; k++) mus[i + k] += amp * Math.exp(-k / 6) * (R() * 2 - 1);
    }
  }
  lowpass(mus, 5200); // couleur lo-fi
  finalize("bed", mus.subarray(0, Math.floor(BED * SR)), `afade=t=in:d=1.2,afade=t=out:st=${Math.max(BED - 2.5, 0)}:d=2.5,loudnorm=I=-24:TP=-6:LRA=7`);
}

// ─── Logo sonore : sol – do – mi, la dernière tenue ────────────────────────
{
  const n = Math.floor(2.6 * SR);
  const x = new Float32Array(n);
  [
    [0, 67, 0.3],
    [0.13, 72, 0.3],
    [0.26, 76, 1.2],
  ].forEach(([t, m, d]) => {
    ep(x, t, m, d, 0.35);
    ep(x, t, m + 12, d, 0.06);
  });
  lowpass(x, 9000);
  finalize("logo", x, "afade=t=out:st=1.8:d=0.8,loudnorm=I=-20:TP=-6");
}

// ─── Bruitages ──────────────────────────────────────────────────────────────
const R = rng(42);
{
  const x = new Float32Array(Math.floor(0.08 * SR));
  for (let k = 0; k < x.length; k++) {
    const t = k / SR;
    x[k] = 0.8 * Math.exp(-t / 0.012) * Math.sin(TAU * 2100 * t) + 0.3 * Math.exp(-t / 0.003) * (R() * 2 - 1);
  }
  finalize("tick", x, "volume=0.7");
}
{
  const x = new Float32Array(Math.floor(1.2 * SR));
  [
    [0, 88],
    [0.09, 95],
  ].forEach(([t0, m]) => {
    const f = mtof(m);
    const i0 = Math.floor(t0 * SR);
    for (let k = 0; i0 + k < x.length; k++) {
      const t = k / SR;
      x[i0 + k] += 0.4 * Math.min(1, t / 0.002) * Math.exp(-t / 0.35) * (Math.sin(TAU * f * t) + 0.2 * Math.sin(TAU * 2.76 * f * t) * Math.exp(-t / 0.08));
    }
  });
  finalize("ding", x, "volume=0.7");
}
{
  const d = 0.55;
  const noise = new Float32Array(Math.floor(d * SR)).map(() => R() * 2 - 1);
  const y = bandpass(noise, (t) => 350 + 2600 * Math.sin((Math.PI * Math.min(t, d)) / d) ** 2, 1.6);
  for (let k = 0; k < y.length; k++) y[k] *= 0.9 * Math.sin((Math.PI * k) / y.length) ** 1.5;
  finalize("whoosh", y, "volume=0.8");
}
{
  const d = 0.4;
  const noise = new Float32Array(Math.floor(d * SR)).map(() => R() * 2 - 1);
  const y = bandpass(noise, () => 3200, 0.8);
  let g = 0;
  for (let k = 0; k < y.length; k++) {
    if (k % 480 === 0) g = 0.3 + 0.7 * R();
    y[k] *= g * Math.sin((Math.PI * k) / y.length);
  }
  finalize("paper", y, "volume=0.6");
}
{
  const x = new Float32Array(Math.floor(0.5 * SR));
  for (let c = 0; c < 8; c++) {
    const i0 = Math.floor((c * 0.048 + (R() - 0.5) * 0.008) * SR);
    const amp = 0.5 + 0.4 * R();
    for (let k = 0; k < 0.02 * SR && i0 + k < x.length; k++) {
      const t = k / SR;
      x[i0 + k] += amp * Math.exp(-t / 0.004) * ((R() * 2 - 1) * 0.6 + 0.4 * Math.sin(TAU * 1800 * t));
    }
  }
  finalize("type", bandpass(x, () => 2400, 0.9), "volume=0.7");
}
{
  // Sonnerie de téléphone générique (trille à deux tons, deux salves) — l'interruption.
  const d = 1.6;
  const x = new Float32Array(Math.floor(d * SR));
  for (const t0 of [0, 0.8]) {
    const i0 = Math.floor(t0 * SR);
    for (let k = 0; k < 0.55 * SR && i0 + k < x.length; k++) {
      const t = k / SR;
      const f = Math.floor(t * 24) % 2 ? 1320 : 1660;
      const env = Math.min(1, t / 0.01) * Math.min(1, (0.55 - t) / 0.03);
      x[i0 + k] += 0.35 * env * (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t));
    }
  }
  finalize("ring", bandpass(x, () => 1500, 0.7), "volume=0.6");
}
{
  // Vibration de téléphone sur le comptoir (deux impulsions).
  const d = 0.9;
  const x = new Float32Array(Math.floor(d * SR));
  for (const t0 of [0, 0.48]) {
    const i0 = Math.floor(t0 * SR);
    for (let k = 0; k < 0.34 * SR && i0 + k < x.length; k++) {
      const t = k / SR;
      const env = Math.min(1, t / 0.02) * Math.min(1, (0.34 - t) / 0.04);
      x[i0 + k] += 0.6 * env * (Math.sign(Math.sin(TAU * 172 * t)) * 0.5 + 0.3 * (R() * 2 - 1));
    }
  }
  finalize("buzz", lowpass(x, 900), "volume=0.7");
}
console.log(`✔ kit sonore dans ${OUT} : bed.wav (${BED}s, ${BPM} bpm), logo, tick, ding, whoosh, paper, type, ring, buzz`);
