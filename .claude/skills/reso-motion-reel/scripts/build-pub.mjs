#!/usr/bin/env node
// Pub « film » Reso en 4K (2160×3840, 9:16) — identité poudrée.
//
// Une suite de plans (images fixes pour l'animatique, vidéos générées ou tournées pour la version
// finale) avec mouvements de caméra, mise au point et recadrages macro ; un plan « téléphone » où
// l'agenda Reso se remplit ; une phrase de marque ; la signature reso® avec logo sonore.
// La composition est dessinée sur une grille 1080×1920 agrandie ×2 : textes et vecteurs restent
// nets en 4K ; les médias doivent être en 4K pour un rendu final net.
//
// Usage : node build-pub.mjs videos/<slug>   (lit <slug>/pub.json ; écrit index.html + brand/)

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHARTE = resolve(HERE, "../../reso-video-charte");
const GSAP = resolve(HERE, "../../reso-facecam-app/scripts/gsap.min.js");
const PROJECT = resolve(process.argv[2] ?? ".");
const P = JSON.parse(readFileSync(join(PROJECT, "pub.json"), "utf8"));
const W = 1080; // grille de dessin
const H = 1920;
const [OW, OH] = P.size ?? [2160, 3840];
const K = OW / W;
const FPS = P.fps ?? 30;
const q = (t) => Math.round(t * FPS) / FPS;
const T = (t) => q(t).toFixed(4);
const esc = (s) =>
  String(s)
    .replace(/ ([?!:;»])/g, " $1")
    .replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const C = { page: "#FBF6EA", ink: "#1F2733", muted: "#5F6672", brand: "#4A6179", soft: "#DCE4EC", softTint: "#EEF2F5", accent: "#B6A6D8", mint: "#9DBBA8", line: "#E7DFD0" };

const shots = P.shots ?? [];
const sting = P.sting ?? { at: shots.length ? shots[shots.length - 1].start + shots[shots.length - 1].dur : 12, dur: 2.6 };
const TOTAL = q(sting.at + sting.dur);

// ─── Assets ─────────────────────────────────────────────────────────────────
const BRAND = join(PROJECT, "brand");
mkdirSync(join(BRAND, "son"), { recursive: true });
for (const f of ["outfit", "manrope", "caveat", "jetbrainsmono"]) copyFileSync(join(CHARTE, `assets/fonts/${f}.woff2`), join(BRAND, `${f}.woff2`));
copyFileSync(join(CHARTE, "assets/logo-poudre-creme.svg"), join(BRAND, "logo-creme.svg"));
copyFileSync(join(CHARTE, "assets/images/coin-ciseaux.png"), join(BRAND, "coin-ciseaux.png"));
copyFileSync(GSAP, join(BRAND, "gsap.min.js"));
execFileSync("node", [join(CHARTE, "scripts/sound-kit.mjs"), join(BRAND, "son"), "--bed", String(Math.ceil(TOTAL) + 1), "--bpm", String(P.bpm ?? 72)], { stdio: "ignore" });
// « brand:fichier » = image de la charte, copiée dans brand/ ; sinon chemin relatif au projet.
function media(src) {
  if (!src.startsWith("brand:")) {
    if (!existsSync(join(PROJECT, src))) throw new Error(`Média introuvable : ${src}`);
    return src;
  }
  const f = src.slice(6);
  copyFileSync(join(CHARTE, "assets/images", f), join(BRAND, f));
  return `brand/${f}`;
}
const isVideo = (s) => /\.(mp4|mov|webm)$/i.test(s);

// Homographie : rectangle w×h → quadrilatère [[x,y]×4] (haut-gauche, haut-droit, bas-droit, bas-gauche),
// exprimée en matrix3d CSS. Sert à incruster l'écran de l'app sur un téléphone filmé (caméra fixe).
function quadMatrix(w, h, quad) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  // mise à l'échelle du rectangle source
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(8)).join(",")})`;
}

// ─── Composition ────────────────────────────────────────────────────────────
const html = [];
const js = [];
const sfx = [];

shots.forEach((s, i) => {
  const id = `sh-${i}`;
  const end = s.start + s.dur;
  const [fx, fy] = s.focus ?? [50, 50];
  const [z0, z1] = s.zoom ?? [1.08, 1.0];
  const [p0, p1] = s.pan ?? [0, 0];
  if (s.type === "phone") {
    // Plan téléphone : décor flouté + téléphone posé sur le socle, agenda qui se remplit.
    const bg = s.src ? null : media(s.bg ?? "brand:outils.webp");
    const bookings = s.bookings ?? [
      ["09:00", "10:00", "Coupe & brushing", "Julie Martin"],
      ["11:00", "12:00", "Soin du visage", "Chloé Bernard"],
      ["13:45", "14:45", "Coupe & brushing", "Inès Moreau"],
      ["16:30", "17:30", "Soin du visage", "Sarah Roux"],
    ];
    const from = 9, to = 18, rowH = 98;
    const y = (hm) => { const [h, m] = hm.split(":").map(Number); return (h - from + m / 60) * rowH; };
    const rows = Array.from({ length: to - from + 1 }, (_, k) => `<div class="ag-row" style="top:${k * rowH}px"><span>${String(from + k).padStart(2, "0")}:00</span></div>`).join("");
    const blocks = bookings.map(([a, b, what, who], k) => `<div class="ag-b ag-b${k % 2}" id="${id}-b${k}" style="top:${y(a) + 3}px;height:${y(b) - y(a) - 6}px"><b>${esc(what)}</b><span>${esc(a)} – ${esc(b)} · ${esc(who)}</span></div>`).join("");
    const agenda = `<div class="ag"><div class="ag-h"><div class="ag-t">Agenda</div><div class="ag-d">${esc(s.date ?? "jeudi 1 octobre")}</div><div class="ag-p">${esc(s.practitioner ?? "Camille Durand")}</div></div><div class="ag-g" style="height:${(to - from) * rowH}px">${rows}${blocks}</div></div>`;
    if (s.src) {
      // Plan filmé/généré (caméra fixe) : l'agenda est incrusté dans le quadrilatère de l'écran.
      const src = media(s.src);
      const sw = 570, sh = 1240; // taille de l'écran HTML avant projection
      const quad = s.screen?.quad ?? [[330, 520], [750, 520], [750, 1430], [330, 1430]];
      html.push(`<div class="shot" id="${id}"><video class="fill clip" id="${id}-v" src="${src}" data-start="${T(s.start)}" data-duration="${T(s.dur)}" data-media-start="${(s.from ?? 0).toFixed(3)}" data-track-index="1" muted playsinline style="object-position:${fx}% ${fy}%"></video><div class="screen-q" id="${id}-q" style="width:${sw}px;height:${sh}px;transform:${quadMatrix(sw, sh, quad)};border-radius:${s.screen?.radius ?? 40}px">${agenda}</div></div>`);
      js.push(`tl.set("#${id}", { opacity: 1 }, ${T(s.start)});`);
      js.push(`tl.set("#${id}", { opacity: 0 }, ${T(s.start + s.dur)});`);
      const on = s.start + (s.screen?.at ?? 1.6);
      js.push(`tl.fromTo("#${id}-q", { opacity: 0 }, { opacity: ${s.screen?.opacity ?? 0.96}, duration: 0.5, ease: "power2.out" }, ${T(on)});`);
      bookings.forEach((_, k) => {
        const at = on + 0.5 + k * 0.42;
        js.push(`tl.fromTo("#${id}-b${k}", { opacity: 0, y: -40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.4)" }, ${T(at)});`);
        sfx.push(["ding", at + 0.08, 0.22]);
      });
      return;
    }
    html.push(`<div class="shot clip" id="${id}" data-start="${T(s.start)}" data-duration="${T(s.dur)}" data-track-index="1"><div class="cam" id="${id}-cam" style="transform-origin:${fx}% ${fy}%"><img class="fill" src="${bg}" alt="" style="object-position:${fx}% ${fy}%;filter:blur(${s.bgBlur ?? 9}px) saturate(.9) brightness(.96)" /></div><div class="phone-wrap"><div class="contact" id="${id}-contact"></div><div class="phone" id="${id}-phone"><div class="notch"></div><div class="screen"><div class="ag"><div class="ag-h"><div class="ag-t">Agenda</div><div class="ag-d">${esc(s.date ?? "jeudi 1 octobre")}</div><div class="ag-p">${esc(s.practitioner ?? "Camille Durand")}</div></div><div class="ag-g" style="height:${(to - from) * rowH}px">${rows}${blocks}</div></div></div></div></div></div>`);
    js.push(`tl.fromTo("#${id}-cam", { scale: ${z0} }, { scale: ${z1}, duration: ${T(s.dur)}, ease: "none" }, ${T(s.start)});`);
    // posé comme par une main : arrive du bas en perspective, se stabilise
    js.push(`tl.fromTo("#${id}-phone", { y: 700, rotationX: 38, rotationY: -12, rotation: -6, scale: 0.92, transformPerspective: 2000 }, { y: 0, rotationX: 8, rotationY: -6, rotation: -2, scale: 1, transformPerspective: 2000, duration: 1.2, ease: "power4.out" }, ${T(s.start + 0.1)});`);
    js.push(`tl.to("#${id}-phone", { rotationX: 4, rotationY: -2, rotation: -1, scale: 1.04, duration: ${T(s.dur - 1.3)}, ease: "sine.inOut" }, ${T(s.start + 1.3)});`);
    js.push(`tl.fromTo("#${id}-contact", { opacity: 0, scaleX: 0.5 }, { opacity: 1, scaleX: 1, duration: 1.1, ease: "power3.out" }, ${T(s.start + 0.3)});`);
    js.push(`tl.fromTo("#${id} .screen", { filter: "brightness(.25)" }, { filter: "brightness(1)", duration: 0.6, ease: "power2.out" }, ${T(s.start + 1.1)});`);
    bookings.forEach((_, k) => {
      const at = s.start + 1.6 + k * 0.42;
      js.push(`tl.fromTo("#${id}-b${k}", { opacity: 0, y: -40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.4)" }, ${T(at)});`);
      sfx.push(["ding", at + 0.08, 0.22]);
    });
    return;
  }
  const src = media(s.src);
  const el = isVideo(src)
    ? `<video class="fill clip" id="${id}-v" src="${src}" data-start="${T(s.start)}" data-duration="${T(s.dur)}" data-media-start="${(s.from ?? 0).toFixed(3)}" data-track-index="1" muted playsinline style="object-position:${fx}% ${fy}%"></video>`
    : `<img class="fill" src="${src}" alt="" style="object-position:${fx}% ${fy}%" />`;
  // Plan image : le conteneur est le clip ; plan vidéo : la vidéo porte le timing (pas d'ancêtre minuté).
  html.push(isVideo(src)
    ? `<div class="shot" id="${id}"><div class="cam" id="${id}-cam" style="transform-origin:${fx}% ${fy}%">${el}</div></div>`
    : `<div class="shot clip" id="${id}" data-start="${T(s.start)}" data-duration="${T(s.dur)}" data-track-index="1"><div class="cam" id="${id}-cam" style="transform-origin:${fx}% ${fy}%">${el}</div></div>`);
  js.push(`tl.fromTo("#${id}-cam", { scale: ${z0}, x: ${p0} }, { scale: ${z1}, x: ${p1}, duration: ${T(s.dur)}, ease: "${s.ease ?? "none"}" }, ${T(s.start)});`);
  if (isVideo(src)) {
    js.push(`tl.set("#${id}", { opacity: 1 }, ${T(s.start)});`);
    js.push(`tl.set("#${id}", { opacity: 0 }, ${T(end)});`);
  }
  if (s.focusPull) js.push(`tl.fromTo("#${id}-cam", { filter: "blur(${s.focusPull[0]}px)" }, { filter: "blur(${s.focusPull[1] ?? 0}px)", duration: ${s.focusPull[2] ?? 1.2}, ease: "power2.out" }, ${T(s.start)});`);
  if (s.fadeIn) js.push(`tl.fromTo("#${id}-cam", { opacity: 0 }, { opacity: 1, duration: ${s.fadeIn}, ease: "power1.out" }, ${T(s.start)});`);
});

// Phrase(s) de marque, montée depuis un masque, sur un voile doux.
(P.headlines ?? []).forEach((h, k) => {
  const id = `hl-${k}`;
  const dur = h.until - h.at;
  const words = (s) => esc(s).split(" ").map((w) => `<span class="m"><span class="mi">${w}</span></span>`).join(" ");
  html.push(`<div class="hl clip" id="${id}" data-start="${T(h.at)}" data-duration="${T(dur)}" data-track-index="3" style="top:${h.top ?? 1180}px"><div class="hl-shade"></div>${h.lines.map((l, j) => `<div class="hl-l" id="${id}-${j}">${words(l)}</div>`).join("")}</div>`);
  h.lines.forEach((_, j) => js.push(`tl.fromTo("#${id}-${j} .mi", { yPercent: 115 }, { yPercent: 0, duration: 1.0, ease: "power4.out", stagger: 0.07 }, ${T(h.at + (h.lineDelays?.[j] ?? j * 0.9))});`));
  js.push(`tl.fromTo("#${id} .hl-shade", { opacity: 0 }, { opacity: 1, duration: 0.8 }, ${T(h.at)});`);
  js.push(`tl.to("#${id} .mi", { yPercent: -115, duration: 0.45, ease: "power3.in", stagger: 0.03 }, ${T(h.until - 0.5)});`);
});

// Signature.
const S0 = sting.at;
html.push(`<div class="sting clip" id="sting" data-start="${T(S0)}" data-duration="${T(sting.dur)}" data-track-index="7"><img class="sting-coin" id="sting-coin" src="brand/coin-ciseaux.png" alt="" /><div class="sting-in"><img id="sting-logo" src="brand/logo-creme.svg" alt="reso" /><div id="sting-line"></div><div id="sting-tag">BEAUTY BUSINESS SIMPLIFIED</div>${sting.cta ? `<div id="sting-cta">${esc(sting.cta)}</div>` : ""}</div></div>`);
js.push(`tl.fromTo("#sting", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.inOut" }, ${T(S0)});`);
js.push(`tl.fromTo("#sting-logo", { clipPath: "inset(0% 100% 0% 0%)", y: 12 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.9, ease: "power3.inOut" }, ${T(S0 + 0.35)});`);
js.push(`tl.fromTo("#sting-line", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out" }, ${T(S0 + 0.95)});`);
js.push(`tl.fromTo("#sting-tag", { opacity: 0, scaleX: 1.22 }, { opacity: 1, scaleX: 1, duration: 1.1, ease: "power3.out" }, ${T(S0 + 1.05)});`);
js.push(`tl.fromTo("#sting-coin", { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" }, ${T(S0 + 0.4)});`);
js.push(`if (document.getElementById("sting-cta")) tl.fromTo("#sting-cta", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, ${T(S0 + 1.4)});`);
sfx.push(["logo", S0 + 0.33, 0.8]);

// Matière : grain, vignettage, noir d'ouverture.
const GRAIN = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .12  0 0 0 0 .1  0 0 0 0 .08  0 0 0 .55 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>');
html.push(`<div id="vignette"></div><div id="grain"></div>${P.frame ? `<div id="frame" style="border-width:${P.frame}px"></div>` : ""}`);
const steps = Math.round(TOTAL * 12);
js.push(`tl.fromTo("#grain", { backgroundPosition: "0px 0px" }, { backgroundPosition: "${steps * 37}px ${steps * 53}px", duration: ${T(TOTAL)}, ease: "steps(${steps})" }, 0);`);

// Audio.
const LEN = { tick: 0.08, ding: 1.2, whoosh: 0.55, paper: 0.4, type: 0.5, logo: 2.6 };
const auto = { version: 1, lanes: [{ target: "volume", points: [{ t: 0, v: 0 }, { t: 1.2, v: 0.9 }, { t: S0, v: 0.9 }, { t: S0 + 0.4, v: 1 }, { t: TOTAL - 0.8, v: 1 }, { t: TOTAL, v: 0 }].map((p) => ({ t: Number(p.t.toFixed(3)), v: p.v })) }] };
const audio = [`<audio id="music" src="${P.music ?? "brand/son/bed.wav"}" data-start="0" data-duration="${T(TOTAL)}" data-track-index="10" data-volume="1" data-automation='${JSON.stringify(auto)}'></audio>`];
sfx.filter(([, at]) => at < TOTAL - 0.05).forEach(([n, at, v], k) => audio.push(`<audio id="sfx-${k}" src="brand/son/${n}.wav" data-start="${T(at)}" data-duration="${T(Math.min(LEN[n], TOTAL - at))}" data-track-index="${11 + (k % 4)}" data-volume="${v}"></audio>`));

const css = `
@font-face { font-family: "Outfit"; src: url("brand/outfit.woff2") format("woff2"); font-weight: 100 900; font-display: block; }
@font-face { font-family: "Manrope"; src: url("brand/manrope.woff2") format("woff2"); font-weight: 200 800; font-display: block; }
@font-face { font-family: "JetBrains Mono"; src: url("brand/jetbrainsmono.woff2") format("woff2"); font-weight: 100 800; font-display: block; }
* { box-sizing: border-box; }
html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #000; font-family: "Manrope", "Outfit", system-ui, sans-serif; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
#s { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform: scale(${K}); transform-origin: 0 0; overflow: hidden; }
.shot { position: absolute; inset: 0; overflow: hidden; }
.shot:not(.clip) { opacity: 0; }
.cam { position: absolute; inset: 0; }
.fill { width: 100%; height: 100%; object-fit: cover; display: block; }
.screen-q { position: absolute; left: 0; top: 0; transform-origin: 0 0; overflow: hidden; background: ${C.page}; opacity: 0; padding-top: 20px; }
.phone-wrap { position: absolute; left: 50%; top: 250px; width: 600px; height: 1300px; margin-left: -300px; }
.phone { position: absolute; inset: 0; border-radius: 70px; background: ${C.ink}; padding: 15px; box-shadow: 0 2px 6px rgba(31,39,51,.14), 0 60px 90px -36px rgba(31,39,51,.65), 0 34px 44px -32px rgba(40,34,24,.5); }
.notch { position: absolute; z-index: 2; top: 32px; left: 50%; width: 130px; height: 36px; margin-left: -65px; border-radius: 20px; background: ${C.ink}; }
.screen { position: absolute; inset: 15px; border-radius: 56px; overflow: hidden; background: ${C.page}; padding-top: 58px; }
.contact { position: absolute; left: 6%; right: 6%; bottom: -54px; height: 84px; border-radius: 50%; background: radial-gradient(ellipse at center, rgba(31,39,51,.5), rgba(31,39,51,0) 70%); filter: blur(8px); }
.ag { position: relative; height: 100%; padding: 26px 28px 0; font-family: "Outfit", sans-serif; color: ${C.ink}; }
.ag-h { display: grid; grid-template-columns: 1fr auto; row-gap: 4px; padding-bottom: 18px; border-bottom: 1px solid ${C.line}; }
.ag-t { font-size: 44px; font-weight: 500; letter-spacing: -0.02em; }
.ag-d { font-family: "Manrope", sans-serif; font-size: 21px; color: ${C.muted}; }
.ag-p { grid-row: 1 / span 2; grid-column: 2; align-self: center; font-family: "Manrope", sans-serif; font-size: 19px; font-weight: 600; background: ${C.soft}; color: ${C.brand}; border-radius: 999px; padding: 8px 16px; }
.ag-g { position: relative; margin-top: 18px; margin-left: 66px; }
.ag-row { position: absolute; left: -66px; right: 0; border-top: 1px dashed ${C.line}; }
.ag-row span { position: absolute; left: 0; top: -11px; font-family: "JetBrains Mono", monospace; font-size: 16px; color: ${C.muted}; background: ${C.page}; padding-right: 6px; }
.ag-b { position: absolute; left: 6px; right: 0; border-radius: 12px; background: ${C.softTint}; border-left: 7px solid ${C.accent}; padding: 12px 16px; display: flex; flex-direction: column; gap: 5px; opacity: 0; box-shadow: 0 12px 24px -16px rgba(31,39,51,.45); }
.ag-b1 { border-left-color: ${C.mint}; background: #F3F1EA; }
.ag-b b { font-size: 24px; font-weight: 500; }
.ag-b span { font-family: "Manrope", sans-serif; font-size: 17px; color: ${C.muted}; }
.hl { position: absolute; left: 90px; right: 90px; }
.hl-shade { position: absolute; left: -200px; right: -200px; top: -260px; bottom: -260px; background: radial-gradient(ellipse at 40% 50%, rgba(31,39,51,.42), rgba(31,39,51,0) 65%); opacity: 0; }
.hl-l { position: relative; font-family: "Outfit", sans-serif; font-weight: 500; font-size: 128px; line-height: 1.02; letter-spacing: -0.04em; color: ${C.page}; text-shadow: 0 10px 40px rgba(31,39,51,.3); }
.m { display: inline-block; overflow: hidden; vertical-align: top; padding: 0.06em 0 0.14em; margin: -0.06em 0 -0.14em; }
.mi { display: inline-block; }
.sting { position: absolute; inset: 0; background: #617990; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.sting-coin { position: absolute; right: 0; bottom: 0; width: 820px; height: auto; -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 22%), linear-gradient(180deg, transparent 0%, #000 20%); -webkit-mask-composite: source-in; mask-image: linear-gradient(90deg, transparent 0%, #000 22%), linear-gradient(180deg, transparent 0%, #000 20%); mask-composite: intersect; }
.sting-in { position: relative; display: flex; flex-direction: column; align-items: center; gap: 34px; margin-top: -380px; }
#sting-logo { width: 540px; height: auto; }
#sting-line { width: 110px; height: 3px; background: ${C.page}; opacity: .9; }
#sting-tag { font-size: 30px; font-weight: 500; color: ${C.page}; letter-spacing: 0.34em; white-space: nowrap; }
#sting-cta { margin-top: 30px; font-family: "JetBrains Mono", monospace; font-size: 26px; color: ${C.page}; opacity: .85; letter-spacing: .06em; }
#vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 90% 75% at 50% 45%, rgba(31,39,51,0) 55%, rgba(31,39,51,.3) 100%); }
#grain { position: absolute; inset: 0; background-image: url("${GRAIN}"); background-size: 240px 240px; opacity: .14; mix-blend-mode: multiply; pointer-events: none; }
#frame { position: absolute; inset: 0; border: 0 solid ${C.page}; pointer-events: none; }
`;
writeFileSync(join(PROJECT, "index.html"), `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${OW}, height=${OH}" />
    <title>${esc(P.title ?? "Reso — pub")}</title>
    <!-- Généré par .claude/skills/reso-motion-reel/scripts/build-pub.mjs — modifier pub.json puis relancer. -->
    <style>${css}</style>
  </head>
  <body>
    <div id="root" data-composition-id="reso-pub" data-start="0" data-width="${OW}" data-height="${OH}" data-duration="${T(TOTAL)}" data-fps="${FPS}">
      <div id="s">
        ${html.join("\n        ")}
      </div>
      ${audio.join("\n      ")}
    </div>
    <script src="brand/gsap.min.js"></script>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${js.join("\n      ")}
      window.__timelines["reso-pub"] = tl;
    </script>
  </body>
</html>
`);
console.log(`✔ ${basename(PROJECT)}/index.html — ${shots.length} plans, ${TOTAL}s, ${OW}×${OH}`);
