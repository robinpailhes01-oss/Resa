#!/usr/bin/env node
// Reel motion « notifications » (sans visage) — identité poudrée Reso.
//
// Une nature morte de marque (mise au point, lente avancée de caméra), des notifications Reso
// qui s'empilent avec un « ding », un balayage, une grande phrase de marque révélée ligne par
// ligne, puis la signature reso® avec logo sonore. Musique et bruitages du kit sonore Reso.
//
// Usage : node build-notifs.mjs videos/<slug>        (lit <slug>/reel.json, écrit index.html + brand/)
// Format de reel.json : ../templates/notifs.example.json et ../SKILL.md.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHARTE = resolve(HERE, "../../reso-video-charte");
const GSAP = resolve(HERE, "../../reso-facecam-app/scripts/gsap.min.js");
const projectArg = process.argv[2];
if (!projectArg) {
  console.error("Usage : node build-notifs.mjs videos/<slug>");
  process.exit(1);
}
const PROJECT = resolve(projectArg);
const R = JSON.parse(readFileSync(join(PROJECT, "reel.json"), "utf8"));
const W = 1080;
const H = 1920;
const FPS = R.fps ?? 30;
const q = (t) => Math.round(t * FPS) / FPS;
const T = (t) => q(t).toFixed(4);
const esc = (s) =>
  String(s)
    .replace(/ ([?!:;»])/g, " $1")
    .replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const C = { page: "#FBF6EA", ink: "#1F2733", muted: "#5F6672", brand: "#4A6179", wall: "#6B8093", accent: "#B6A6D8", line: "#E7DFD0" };

// ─── Timing ─────────────────────────────────────────────────────────────────
const notifs = R.notifications ?? [];
const nStart = R.notificationsStart ?? 1.1;
const gaps = R.notificationGaps ?? [1.0, 0.9, 0.75, 0.65, 0.6, 0.55];
const nAt = [];
notifs.forEach((_, k) => nAt.push(k === 0 ? nStart : nAt[k - 1] + (gaps[k - 1] ?? 0.55)));
const lastN = nAt.length ? nAt[nAt.length - 1] : nStart;
const swipeAt = lastN + (R.holdAfterNotifications ?? 1.1);
const lines = R.headlines ?? [];
const lineStarts = [];
let t = swipeAt + 0.7;
for (const l of lines) {
  lineStarts.push(t);
  t += l.duration ?? 3.2;
}
const STING_AT = t;
const STING_DUR = R.stingDuration ?? 2.4;
const TOTAL = q(STING_AT + STING_DUR);

// ─── Assets ─────────────────────────────────────────────────────────────────
const BRAND = join(PROJECT, "brand");
mkdirSync(join(BRAND, "son"), { recursive: true });
for (const f of ["outfit", "manrope", "caveat", "jetbrainsmono"]) copyFileSync(join(CHARTE, `assets/fonts/${f}.woff2`), join(BRAND, `${f}.woff2`));
copyFileSync(join(CHARTE, "assets/logo-poudre-creme.svg"), join(BRAND, "logo-creme.svg"));
copyFileSync(join(CHARTE, "assets/images/coin-ciseaux.png"), join(BRAND, "coin-ciseaux.png"));
copyFileSync(GSAP, join(BRAND, "gsap.min.js"));
const bgSrc = R.background?.src ?? "nature-morte.webp";
const bgLocal = existsSync(join(PROJECT, bgSrc)) ? join(PROJECT, bgSrc) : join(CHARTE, "assets/images", bgSrc);
copyFileSync(bgLocal, join(BRAND, "fond" + bgSrc.slice(bgSrc.lastIndexOf("."))));
const BG = "brand/fond" + bgSrc.slice(bgSrc.lastIndexOf("."));
execFileSync("node", [join(CHARTE, "scripts/sound-kit.mjs"), join(BRAND, "son"), "--bed", String(Math.ceil(TOTAL) + 1)], { stdio: "ignore" });

// ─── Composition ────────────────────────────────────────────────────────────
const html = [];
const js = [];
const sfx = [];
const bg = R.background ?? {};
// Fond : image en « cover » ancrée (focusX/focusY en %), mise au point puis avancée lente.
html.push(`<div id="bg"><img id="bg-img" src="${BG}" alt="" style="object-position:${bg.focusX ?? 12}% ${bg.focusY ?? 60}%" /></div>`);
js.push(`tl.fromTo("#bg-img", { scale: 1.12, filter: "blur(16px) saturate(.92)" }, { scale: 1.02, filter: "blur(${bg.blur ?? 2}px) saturate(.92)", duration: 1.1, ease: "power2.out" }, 0);`);
js.push(`tl.to("#bg-img", { scale: 1.1, duration: ${T(TOTAL - 1.1)}, ease: "none" }, 1.1);`);
// Assombrissement doux quand la phrase arrive (lisibilité du texte crème).
html.push(`<div id="shade"></div>`);
js.push(`tl.fromTo("#shade", { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.inOut" }, ${T(swipeAt + 0.2)});`);
// Bascule de mise au point : le décor se floute pour laisser la place au texte.
js.push(`tl.to("#bg-img", { filter: "blur(${bg.textBlur ?? 11}px) saturate(.9)", duration: 0.9, ease: "power2.inOut" }, ${T(swipeAt + 0.15)});`);

// Notifications : la pile s'élève au-dessus du combiné (la plus récente en bas).
const NH = 150;
const NG = 18;
const baseY = R.stackBottom ?? 1180;
html.push(`<div id="stack">`);
notifs.forEach((n, k) => {
  html.push(
    `<div class="nt" id="nt-${k}"><div class="nt-ico"><img src="brand/logo-creme.svg" alt="" /></div><div class="nt-body"><div class="nt-top"><b>${esc(n.title)}</b><span>${esc(n.when ?? "maintenant")}</span></div><div class="nt-text">${esc(n.text)}</div></div></div>`,
  );
});
html.push(`</div>`);
notifs.forEach((_, k) => {
  const at = nAt[k];
  // la nouvelle notification se pose en bas…
  js.push(`tl.fromTo("#nt-${k}", { opacity: 0, y: ${baseY - NH + 60}, scale: 0.9, filter: "blur(8px)" }, { opacity: 1, y: ${baseY - NH}, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "back.out(1.5)" }, ${T(at)});`);
  // …et les précédentes remontent d'un cran.
  for (let j = 0; j < k; j++) js.push(`tl.to("#nt-${j}", { y: ${baseY - NH - (k - j) * (NH + NG)}, duration: 0.5, ease: "power3.out" }, ${T(at)});`);
  sfx.push(["ding", at + 0.02, 0.32]);
});
// Balayage : les notifications partent vers la droite, en cascade.
notifs.forEach((_, k) => {
  const at = swipeAt + (notifs.length - 1 - k) * 0.05;
  js.push(`tl.to("#nt-${k}", { x: 1250, rotation: 6, opacity: 0.6, filter: "blur(6px)", duration: 0.55, ease: "power3.in" }, ${T(at)});`);
});
if (notifs.length) sfx.push(["whoosh", swipeAt, 0.5]);

// Phrases de marque, révélées ligne par ligne depuis un masque.
lines.forEach((l, k) => {
  const at = lineStarts[k];
  const dur = l.duration ?? 3.2;
  const words = (s) => esc(s).split(" ").map((w) => `<span class="m"><span class="mi">${w}</span></span>`).join(" ");
  html.push(
    `<div class="hl clip" id="hl-${k}" data-start="${T(at)}" data-duration="${T(dur)}" data-track-index="3">${l.kicker ? `<div class="hl-k" id="hl-${k}-k">${[...esc(l.kicker)].map((c) => (c === " " ? " " : `<span class="ch">${c}</span>`)).join("")}</div>` : ""}${l.lines.map((ln, j) => `<div class="hl-l" id="hl-${k}-${j}">${words(ln)}</div>`).join("")}${l.script ? `<div class="hl-s" id="hl-${k}-s">${esc(l.script)}<svg viewBox="0 0 300 24" preserveAspectRatio="none"><path id="hl-${k}-sw" d="M4 16 C 80 6, 180 4, 296 12" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></div>` : ""}</div>`,
  );
  if (l.kicker) {
    js.push(`document.querySelectorAll("#hl-${k}-k .ch").forEach(function(el,i){ tl.set(el, { opacity: 1 }, ${T(at + 0.05)} + i * 0.03); });`);
    sfx.push(["type", at + 0.05, 0.35]);
  }
  l.lines.forEach((_, j) => js.push(`tl.fromTo("#hl-${k}-${j} .mi", { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.06 }, ${T(at + 0.25 + j * 0.28)});`));
  if (l.script) {
    js.push(`tl.fromTo("#hl-${k}-s", { opacity: 0, rotation: -8, y: 10 }, { opacity: 1, rotation: -5, y: 0, duration: 0.5, ease: "power2.out" }, ${T(at + 0.9)});`);
    js.push(`(function(){var el=document.getElementById("hl-${k}-sw");if(el){var L=el.getTotalLength();tl.set(el,{strokeDasharray:L,strokeDashoffset:L},${T(at + 1.05)});tl.to(el,{strokeDashoffset:0,duration:0.5,ease:"power2.inOut"},${T(at + 1.05)});}})();`);
  }
  // sortie : les mots redescendent dans leur masque
  js.push(`tl.to("#hl-${k} .mi", { yPercent: -115, duration: 0.45, ease: "power3.in", stagger: 0.03 }, ${T(at + dur - 0.5)});`);
  sfx.push(["paper", at + 0.2, 0.25]);
});

// Signature reso®.
html.push(
  `<div class="sting clip" id="sting" data-start="${T(STING_AT)}" data-duration="${T(STING_DUR)}" data-track-index="7"><img class="sting-coin" id="sting-coin" src="brand/coin-ciseaux.png" alt="" /><div class="sting-in"><img id="sting-logo" src="brand/logo-creme.svg" alt="reso" /><div id="sting-line"></div><div id="sting-tag">BEAUTY BUSINESS SIMPLIFIED</div>${R.cta ? `<div id="sting-cta">${esc(R.cta)}</div>` : ""}</div></div>`,
);
js.push(`tl.fromTo("#sting", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "power3.inOut" }, ${T(STING_AT)});`);
js.push(`tl.fromTo("#sting-logo", { clipPath: "inset(0% 100% 0% 0%)", y: 12 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.9, ease: "power3.inOut" }, ${T(STING_AT + 0.35)});`);
js.push(`tl.fromTo("#sting-line", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out" }, ${T(STING_AT + 0.95)});`);
js.push(`tl.fromTo("#sting-tag", { opacity: 0, scaleX: 1.22 }, { opacity: 1, scaleX: 1, duration: 1.1, ease: "power3.out" }, ${T(STING_AT + 1.05)});`);
js.push(`tl.fromTo("#sting-coin", { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" }, ${T(STING_AT + 0.4)});`);
js.push(`if (document.getElementById("sting-cta")) tl.fromTo("#sting-cta", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, ${T(STING_AT + 1.4)});`);
sfx.push(["whoosh", STING_AT - 0.15, 0.35], ["logo", STING_AT + 0.33, 0.8]);

// Matière : grain animé, vignettage, cadre crème.
const GRAIN = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .12  0 0 0 0 .1  0 0 0 0 .08  0 0 0 .55 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>');
html.push(`<div id="vignette"></div><div id="grain"></div><div id="frame"></div>`);
const steps = Math.round(TOTAL * 12);
js.push(`tl.fromTo("#grain", { backgroundPosition: "0px 0px" }, { backgroundPosition: "${steps * 37}px ${steps * 53}px", duration: ${T(TOTAL)}, ease: "steps(${steps})" }, 0);`);

// Audio.
const LEN = { tick: 0.08, ding: 1.2, whoosh: 0.55, paper: 0.4, type: 0.5, logo: 2.6 };
const music = { version: 1, lanes: [{ target: "volume", points: [{ t: 0, v: 0 }, { t: 1, v: 0.9 }, { t: STING_AT, v: 0.9 }, { t: STING_AT + 0.4, v: 1 }, { t: TOTAL - 0.7, v: 1 }, { t: TOTAL, v: 0 }].map((p) => ({ t: Number(p.t.toFixed(3)), v: p.v })) }] };
const audio = [`<audio id="music" src="brand/son/bed.wav" data-start="0" data-duration="${T(TOTAL)}" data-track-index="10" data-volume="1" data-automation='${JSON.stringify(music)}'></audio>`];
sfx
  .filter(([, at]) => at >= 0 && at < TOTAL - 0.05)
  .forEach(([name, at, vol], k) => audio.push(`<audio id="sfx-${k}" src="brand/son/${name}.wav" data-start="${T(at)}" data-duration="${T(Math.min(LEN[name], TOTAL - at))}" data-track-index="${11 + (k % 4)}" data-volume="${vol}"></audio>`));

const css = `
@font-face { font-family: "Outfit"; src: url("brand/outfit.woff2") format("woff2"); font-weight: 100 900; font-display: block; }
@font-face { font-family: "Manrope"; src: url("brand/manrope.woff2") format("woff2"); font-weight: 200 800; font-display: block; }
@font-face { font-family: "Caveat"; src: url("brand/caveat.woff2") format("woff2"); font-weight: 400 700; font-display: block; }
@font-face { font-family: "JetBrains Mono"; src: url("brand/jetbrainsmono.woff2") format("woff2"); font-weight: 100 800; font-display: block; }
* { box-sizing: border-box; }
html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: ${C.wall}; font-family: "Manrope", "Outfit", system-ui, sans-serif; color: ${C.ink}; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${C.wall}; }
#bg { position: absolute; inset: 0; overflow: hidden; }
#bg-img { width: 100%; height: 100%; object-fit: cover; display: block; transform-origin: 30% 70%; }
#shade { position: absolute; inset: 0; opacity: 0; background: linear-gradient(180deg, rgba(31,39,51,.42) 0%, rgba(31,39,51,.32) 50%, rgba(31,39,51,.36) 100%); }
#stack { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; }
.nt { position: absolute; left: 70px; top: 0; width: 940px; height: ${NH}px; display: flex; gap: 24px; align-items: center; padding: 22px 28px; border-radius: 34px; opacity: 0;
  background: rgba(251,246,234,.8); -webkit-backdrop-filter: blur(24px) saturate(1.2); backdrop-filter: blur(24px) saturate(1.2);
  box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 26px 50px -24px rgba(31,39,51,.55); }
.nt-ico { width: 82px; height: 82px; border-radius: 20px; background: ${C.ink}; display: flex; align-items: center; justify-content: center; flex: none; }
.nt-ico img { width: 64px; height: auto; }
.nt-body { flex: 1; min-width: 0; }
.nt-top { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
.nt-top b { font-family: "Outfit", sans-serif; font-weight: 600; font-size: 33px; color: ${C.ink}; letter-spacing: -0.01em; }
.nt-top span { font-size: 24px; color: ${C.muted}; white-space: nowrap; }
.nt-text { font-size: 29px; line-height: 1.25; color: #3A4250; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hl { position: absolute; left: 96px; right: 96px; top: 520px; }
.hl-k { font-family: "JetBrains Mono", monospace; font-size: 30px; letter-spacing: .06em; color: ${C.page}; opacity: .85; margin-bottom: 26px; }
.ch { opacity: 0; }
.hl-l { font-family: "Outfit", sans-serif; font-weight: 500; font-size: 136px; line-height: 1.02; letter-spacing: -0.04em; color: ${C.page}; text-shadow: 0 10px 40px rgba(31,39,51,.25); }
.hl-s { position: absolute; right: 0; margin-top: 30px; font-family: "Caveat", cursive; font-weight: 600; font-size: 66px; color: ${C.page}; text-align: center; transform-origin: 100% 50%; }
.hl-s svg { display: block; width: 100%; height: 24px; margin-top: -6px; }
.m { display: inline-block; overflow: hidden; vertical-align: top; padding: 0.06em 0 0.14em; margin: -0.06em 0 -0.14em; }
.mi { display: inline-block; }
.sting { position: absolute; inset: 0; background: #617990; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.sting-coin { position: absolute; right: 0; bottom: 0; width: 820px; height: auto; -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 22%), linear-gradient(180deg, transparent 0%, #000 20%); -webkit-mask-composite: source-in; mask-image: linear-gradient(90deg, transparent 0%, #000 22%), linear-gradient(180deg, transparent 0%, #000 20%); mask-composite: intersect; }
.sting-in { position: relative; display: flex; flex-direction: column; align-items: center; gap: 34px; margin-top: -380px; }
#sting-logo { width: 540px; height: auto; }
#sting-line { width: 110px; height: 3px; background: ${C.page}; opacity: .9; }
#sting-tag { font-size: 30px; font-weight: 500; color: ${C.page}; letter-spacing: 0.34em; white-space: nowrap; }
#sting-cta { margin-top: 30px; font-family: "JetBrains Mono", monospace; font-size: 26px; color: ${C.page}; opacity: .85; letter-spacing: .06em; }
#vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 90% 75% at 50% 45%, rgba(31,39,51,0) 58%, rgba(31,39,51,.25) 100%); }
#grain { position: absolute; inset: 0; background-image: url("${GRAIN}"); background-size: 240px 240px; opacity: .16; mix-blend-mode: multiply; pointer-events: none; }
#frame { position: absolute; inset: 0; border: ${R.frame ?? 26}px solid ${C.page}; pointer-events: none; }
`;

writeFileSync(
  join(PROJECT, "index.html"),
  `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(R.title ?? "Reso — reel notifications")}</title>
    <!-- Généré par .claude/skills/reso-motion-reel/scripts/build-notifs.mjs — modifier reel.json puis relancer. -->
    <style>${css}</style>
  </head>
  <body>
    <div id="root" data-composition-id="reso-reel" data-start="0" data-width="${W}" data-height="${H}" data-duration="${T(TOTAL)}" data-fps="${FPS}">
      ${html.join("\n      ")}
      ${audio.join("\n      ")}
    </div>
    <script src="brand/gsap.min.js"></script>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${js.join("\n      ")}
      window.__timelines["reso-reel"] = tl;
    </script>
  </body>
</html>
`,
);
console.log(`✔ ${join(projectArg, "index.html")} — ${notifs.length} notifications, ${lines.length} phrases, ${TOTAL}s`);
