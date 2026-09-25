#!/usr/bin/env node
// Génère la composition HyperFrames d'une vidéo Reso « face caméra + app » (9:16).
//
// Entrée : <projet>/montage.json (plan de montage) + <projet>/transcript.json (mots horodatés).
// Sortie : <projet>/index.html + <projet>/brand/ (police, logo, GSAP) — prêt pour
//          `npx hyperframes lint|check|snapshot|preview|render <projet>`.
//
// Usage : node build-montage.mjs videos/<slug> [--plan]
//   --plan  affiche le découpage (segments, groupes de sous-titres) sans écrire de fichier.
//
// Le format de montage.json est documenté dans ../SKILL.md et ../templates/montage.example.json.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHARTE = resolve(HERE, "../../reso-video-charte/assets");

// ─── Charte (docs/DESIGN.md) ────────────────────────────────────────────────
const C = {
  page: "#FAFAFC",
  card: "#FFFFFF",
  ink: "#111116",
  muted: "#6F707C",
  brand: "#6C4FF8",
  brandDeep: "#4F36DB",
  soft: "#E9E3FF",
  softTint: "#F3F0FF",
  ice: "#DDEBFF",
  peach: "#F4B28F",
  peachTint: "#FFE8DA",
  mint: "#7FD0A4",
  mintTint: "#DDF5E8",
  line: "#E8E8EE",
};

// ─── Géométrie 9:16 (1080×1920) ─────────────────────────────────────────────
// Zones sûres Reels/TikTok/Shorts : rien d'important au-dessus de y=200 (barre du haut)
// ni sous y=1560 (légende, boutons) ; les 150 px de droite sous y=1000 sont couverts par
// les icônes (j'aime, commentaires…).
const W = 1080;
const H = 1920;
const BUBBLE = { x: 56, y: 1150, w: 300, h: 300, r: 150 };
const LAYOUTS = {
  face: { face: { x: 0, y: 0, w: W, h: H, r: 0 }, faceOn: true, stage: false, cap: 1300 },
  app: { face: BUBBLE, faceOn: true, stage: true, cap: 1500 },
  "app-only": { face: BUBBLE, faceOn: false, stage: true, cap: 1500 },
  split: { face: { x: 0, y: 1040, w: W, h: H - 1040, r: 0 }, faceOn: true, stage: true, cap: 1040 },
  cutout: { face: { x: 0, y: 0, w: W, h: H, r: 0 }, faceOn: false, stage: true, cap: 1500, cutout: true },
  card: { face: BUBBLE, faceOn: true, stage: true, cap: 1500 },
  end: { face: BUBBLE, faceOn: false, stage: true, cap: 1500 },
};
// Cadre de l'app par layout et par type de cadre.
function shotBox(layout, frame, aspect) {
  if (frame === "full") {
    if (layout === "split") return { x: 0, y: 0, w: W, h: 1040 };
    return { x: 0, y: 0, w: W, h: H };
  }
  if (frame === "window") {
    const w = layout === "cutout" ? 700 : 1000;
    const h = Math.round(w / aspect) + 44; // + barre de fenêtre
    const cy = layout === "split" ? 520 : layout === "cutout" ? 560 : 760;
    return { x: layout === "cutout" ? 340 : Math.round((W - w) / 2), y: Math.round(cy - h / 2), w, h };
  }
  // téléphone : aspect = largeur/hauteur de l'écran capturé (390/844 par défaut)
  const hTarget = layout === "split" ? 960 : layout === "cutout" ? 1080 : 1240;
  const h = hTarget;
  const w = Math.round(h * aspect);
  if (layout === "split") return { x: Math.round((W - w) / 2), y: 40, w, h };
  if (layout === "cutout") return { x: W - w - 60, y: 190, w, h, rot: 3 };
  return { x: Math.round((W - w) / 2), y: 150, w, h };
}
// Position des pastilles flottantes par layout.
const CHIP_POS = {
  face: { x: 470, y: 330 },
  app: { x: 520, y: 980 },
  "app-only": { x: 520, y: 980 },
  split: { x: 520, y: 700 },
  cutout: { x: 60, y: 260 },
  card: { x: 470, y: 330 },
  end: { x: 470, y: 330 },
};

const ICONS = {
  calendar:
    '<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  check: '<circle cx="12" cy="12" r="9.5"/><path d="m7.5 12.3 3 3 6-6.3"/>',
  bell: '<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2H4.5z"/><path d="M10 21h4"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  star: '<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4l-5.5 2.9 1-6.2L3 9.7l6.2-.9z"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>',
  message: '<path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.4A8.5 8.5 0 1 1 20.5 12z"/>',
  phone: '<path d="M5 3.5h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.6 6.6l1.4-2.3 4.5 1.8V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
};
const ICON_TINT = [
  [C.softTint, C.brand],
  [C.peachTint, "#C0673A"],
  [C.mintTint, "#1F7A4D"],
  [C.ice, "#2F5FB3"],
];

// ─── Utilitaires ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const planOnly = args.includes("--plan");
const projectArg = args.find((a) => !a.startsWith("--"));
if (!projectArg) {
  console.error("Usage : node build-montage.mjs videos/<slug> [--plan]");
  process.exit(1);
}
const PROJECT = resolve(projectArg);
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const fail = (msg) => {
  console.error(`✖ ${msg}`);
  process.exit(1);
};
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const montagePath = join(PROJECT, "montage.json");
if (!existsSync(montagePath)) fail(`montage.json introuvable dans ${PROJECT}`);
const M = readJson(montagePath);
const FPS = M.fps ?? 30;
const q = (t) => Math.round(t * FPS) / FPS; // quantifie sur la grille d'images
const f = (t) => q(t).toFixed(4);

function probeDuration(file) {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file],
      { encoding: "utf8" },
    );
    return Number.parseFloat(out.trim());
  } catch {
    return Number.NaN;
  }
}

// ─── Entrées ────────────────────────────────────────────────────────────────
if (!M.face?.src) fail("montage.face.src est obligatoire (vidéo face caméra, déjà dérushée).");
const faceFile = join(PROJECT, M.face.src);
if (!existsSync(faceFile)) fail(`Vidéo face caméra introuvable : ${M.face.src}`);
const FACE_DUR = q(M.face.duration ?? probeDuration(faceFile));
if (!Number.isFinite(FACE_DUR) || FACE_DUR <= 0) fail("Durée de la vidéo face caméra illisible (ffprobe ?). Renseignez face.duration.");
const FOCUS_Y = M.face.focusY ?? 32; // % vertical où se trouve le visage (bulle, split)
const BUBBLE_CROP = M.face.bubbleCrop ?? 0.62; // part de la largeur gardée dans la bulle

// La face caméra occupe toujours le canevas entier ; chaque layout la place par
// transform (x, y, scale) + clip-path, que GSAP interpole au sous-pixel (le lint
// HyperFrames refuse left/top/width/height, qui saccadent au rendu image par image).
function faceXform(B) {
  const full = B.w === W && B.h === H;
  const cw = full ? W : B.r ? W * BUBBLE_CROP : W;
  const ch = (cw * B.h) / B.w;
  const cx = W / 2;
  const cy = Math.min(Math.max((FOCUS_Y / 100) * H, ch / 2), H - ch / 2);
  const sc = B.w / cw;
  const top = cy - ch / 2;
  const left = cx - cw / 2;
  const r2 = (n) => Math.round(n * 100) / 100;
  return {
    x: r2(B.x - sc * left),
    y: r2(B.y - sc * top),
    scale: r2(sc * 10000) / 10000,
    clipPath: `inset(${r2(top)}px ${r2(W - left - cw)}px ${r2(H - top - ch)}px ${r2(left)}px round ${r2(B.r / sc)}px)`,
  };
}
const END = M.endCard ?? null;
const END_DUR = END ? q(END.duration ?? 2.5) : 0;
const TOTAL = q(FACE_DUR + END_DUR);

const transcriptPath = join(PROJECT, M.transcript ?? "transcript.json");
let words = [];
if (M.captions?.enabled !== false) {
  if (!existsSync(transcriptPath)) fail(`Transcription introuvable : ${transcriptPath} (npx hyperframes transcribe … --model small --language fr)`);
  const raw = readJson(transcriptPath);
  words = (Array.isArray(raw) ? raw : raw.words ?? []).map((w) => ({
    text: String(w.text ?? w.word ?? "").trim(),
    start: Number(w.start),
    end: Number(w.end),
  }));
  words = words.filter((w) => w.text && Number.isFinite(w.start) && Number.isFinite(w.end) && w.start < FACE_DUR);
  for (const w of words) w.end = Math.min(w.end, FACE_DUR);
}

// Segments : chaque segment dure jusqu'au début du suivant (le dernier jusqu'à la fin de la voix).
const segs = (M.segments ?? []).map((s) => ({ ...s })).sort((a, b) => a.start - b.start);
if (!segs.length) fail("montage.segments est vide.");
if (segs[0].start > 0) segs.unshift({ start: 0, layout: "face" });
segs.forEach((s, i) => {
  if (!LAYOUTS[s.layout]) fail(`Layout inconnu « ${s.layout} » (segment ${i}). Attendus : ${Object.keys(LAYOUTS).join(", ")}`);
  if (s.layout === "end") fail("Le layout « end » est réservé : utilisez montage.endCard.");
  s.start = q(s.start);
  s.end = q(i + 1 < segs.length ? segs[i + 1].start : FACE_DUR);
  if (s.end <= s.start) fail(`Segment ${i} (${s.layout}) de durée nulle : vérifiez les « start ».`);
  if (["app", "app-only", "split", "cutout"].includes(s.layout) && !s.app?.src) fail(`Segment ${i} (${s.layout}) : app.src manquant.`);
  if (s.app?.src && !existsSync(join(PROJECT, s.app.src))) fail(`Capture introuvable : ${s.app.src}`);
  if (s.layout === "cutout" && !M.face.cutout) fail("Layout « cutout » : renseignez face.cutout (npx hyperframes remove-background).");
  if (s.layout === "card" && !s.card?.text) fail(`Segment ${i} (card) : card.text manquant.`);
});
if (END) segs.push({ start: FACE_DUR, end: TOTAL, layout: "end", captions: false });

// ─── Sous-titres ────────────────────────────────────────────────────────────
const cap = M.captions ?? {};
const MAX_WORDS = cap.maxWords ?? 4;
const MAX_CHARS = cap.maxChars ?? 24;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, "");
const DROP = new Set((cap.drop ?? ["euh", "heu", "hum", "bah", "ben"]).map(norm));
const REPLACE = Object.fromEntries(Object.entries(cap.replace ?? {}).map(([k, v]) => [norm(k), v]));
const EMPH = new Set((cap.emphasis ?? []).map(norm));

// Ponctuation isolée (typographie française « clientes ? ») : rattachée au mot précédent.
const merged = [];
for (const w of words) {
  const prev = merged[merged.length - 1];
  if (prev && /^[^\p{L}\p{N}]+$/u.test(w.text)) {
    prev.text += "\u00a0" + w.text;
    prev.end = Math.max(prev.end, w.end);
  } else merged.push({ ...w });
}
const shown = [];
for (const w of merged) {
  const key = norm(w.text);
  if (DROP.has(key)) continue;
  let text = w.text;
  if (REPLACE[key] !== undefined) {
    const lead = text.match(/^[^\p{L}\p{N}]*/u)[0];
    const trail = text.match(/[^\p{L}\p{N}]*$/u)[0];
    text = lead + REPLACE[key] + trail;
  }
  shown.push({ ...w, text, emph: EMPH.has(key) });
}
const segAt = (t) => segs.find((s) => t >= s.start && t < s.end) ?? segs[segs.length - 1];
const groups = [];
let cur = [];
const flush = () => {
  if (cur.length) groups.push(cur);
  cur = [];
};
for (let i = 0; i < shown.length; i++) {
  const w = shown[i];
  const prev = cur[cur.length - 1];
  const chars = cur.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
  if (prev && (cur.length >= MAX_WORDS || chars > MAX_CHARS || w.start - prev.end > 0.45)) flush();
  cur.push(w);
  if (/[.!?…:;]$/.test(w.text) || (/,$/.test(w.text) && cur.length >= 2)) flush();
}
flush();
const capGroups = groups
  .map((g, i) => {
    const start = q(g[0].start);
    const next = groups[i + 1]?.[0].start ?? FACE_DUR;
    const end = q(Math.min(next, g[g.length - 1].end + 0.5, FACE_DUR));
    return { words: g, start, end: Math.max(end, q(start + 0.3)), seg: segAt(g[0].start) };
  })
  .filter((g) => g.seg.captions !== false && g.seg.layout !== "end");

if (planOnly) {
  console.log(`Durée voix ${FACE_DUR}s + carte de fin ${END_DUR}s = ${TOTAL}s @ ${FPS} i/s`);
  for (const s of segs) console.log(`  ${s.start.toFixed(2)} → ${s.end.toFixed(2)}  ${s.layout.padEnd(8)} ${s.app?.src ?? s.card?.text ?? s.title ?? ""}`);
  console.log(`${capGroups.length} groupes de sous-titres :`);
  for (const g of capGroups) console.log(`  ${g.start.toFixed(2)}  ${g.words.map((w) => w.text).join(" ")}`);
  process.exit(0);
}

// ─── Assets ─────────────────────────────────────────────────────────────────
const BRAND_DIR = join(PROJECT, "brand");
mkdirSync(BRAND_DIR, { recursive: true });
copyFileSync(join(CHARTE, "fonts/manrope.woff2"), join(BRAND_DIR, "manrope.woff2"));
copyFileSync(join(CHARTE, "logo.svg"), join(BRAND_DIR, "logo.svg"));
copyFileSync(join(HERE, "gsap.min.js"), join(BRAND_DIR, "gsap.min.js"));

// ─── HTML ───────────────────────────────────────────────────────────────────
const px = (b) => `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;`;
const isImg = (src) => /\.(png|jpe?g|webp|avif)$/i.test(src);
const html = [];
const js = [];
const T = (t) => f(t);

// Fond de scène (dégradé mesh de la landing) + captures d'app.
html.push(`<div id="stage-bg"></div>`);
html.push(`<div id="stage">`);
segs.forEach((s, i) => {
  if (!s.app?.src) return;
  const frame = s.app.frame ?? "phone";
  const aspect = s.app.aspect ?? (frame === "window" ? 16 / 10 : 390 / 844);
  const box = s.app.box ?? shotBox(s.layout, frame, aspect);
  const dur = q(s.end - s.start);
  const media = isImg(s.app.src)
    ? `<img id="shot-${i}-media" class="clip" src="${esc(s.app.src)}" alt="" style="object-position:${esc(s.app.position ?? "50% 0%")}" data-start="${T(s.start)}" data-duration="${T(dur)}" data-track-index="2" />`
    : `<video id="shot-${i}-media" class="clip" src="${esc(s.app.src)}" data-start="${T(s.start)}" data-duration="${T(dur)}" data-media-start="${(s.app.from ?? 0).toFixed(3)}" data-track-index="2" style="object-position:${esc(s.app.position ?? "50% 0%")}" muted playsinline></video>`;
  const chrome =
    frame === "window"
      ? `<div class="win-bar"><i></i><i></i><i></i></div>`
      : frame === "phone"
        ? `<div class="notch"></div>`
        : "";
  html.push(
    `<div class="shot shot-${frame}" id="shot-${i}" style="${px(box)}"><div class="shot-in" id="shot-${i}-in"${box.rot ? ` data-rot="${box.rot}"` : ""}>${chrome}<div class="screen"><div class="kb" id="shot-${i}-kb">${media}</div></div></div></div>`,
  );
  const inT = s.start;
  js.push(`tl.set("#shot-${i}", { opacity: 1 }, ${T(inT)});`);
  js.push(
    `tl.fromTo("#shot-${i}-in", { y: 70, scale: 0.94, rotation: ${box.rot ?? 0} }, { y: 0, scale: 1, rotation: ${box.rot ?? 0}, duration: 0.55, ease: "power3.out" }, ${T(inT)});`,
  );
  if (isImg(s.app.src) && s.app.kenBurns !== false)
    js.push(`tl.fromTo("#shot-${i}-kb", { scale: 1 }, { scale: 1.06, duration: ${T(dur)}, ease: "none" }, ${T(inT)});`);
  if (s.app.zoom)
    js.push(
      `tl.to("#shot-${i}-kb", { scale: ${s.app.zoom.scale ?? 1.6}, transformOrigin: "${s.app.zoom.origin ?? "50% 30%"}", duration: 0.6, ease: "power3.inOut" }, ${T(s.start + (s.app.zoom.at ?? 1))});`,
    );
  js.push(`tl.set("#shot-${i}", { opacity: 0 }, ${T(s.end)});`);
});

// Cartes texte (layout card).
segs.forEach((s, i) => {
  if (s.layout !== "card") return;
  const wordsHtml = s.card.text
    .split(/\s+/)
    .map((w, k) => `<span class="cw" id="card-${i}-w${k}">${esc(w)}</span>`)
    .join(" ");
  html.push(
    `<div class="card-slide clip" id="card-${i}" data-start="${T(s.start)}" data-duration="${T(s.end - s.start)}" data-track-index="3"><div class="card-in">${s.card.kicker ? `<div class="kicker">${esc(s.card.kicker)}</div>` : ""}<div class="card-text">${wordsHtml}</div>${s.card.sub ? `<div class="card-sub" id="card-${i}-sub">${esc(s.card.sub)}</div>` : ""}</div></div>`,
  );
  js.push(
    `tl.fromTo("#card-${i} .cw", { opacity: 0, y: 12, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out", stagger: 0.06 }, ${T(s.start + 0.1)});`,
  );
  if (s.card.sub)
    js.push(`tl.fromTo("#card-${i}-sub", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, ${T(s.start + 0.5)});`);
});
html.push(`</div>`);

// Face caméra (vidéo muette ; le son passe par <audio id="voice">).
const first = LAYOUTS[segs[0].layout];
const ringOn = (L) => L.faceOn && L.face.r > 0;
html.push(
  `<div id="bubble-ring" style="left:${BUBBLE.x - 10}px;top:${BUBBLE.y - 10}px;width:${BUBBLE.w + 20}px;height:${BUBBLE.h + 20}px;opacity:${ringOn(first) ? 1 : 0};"></div>`,
);
html.push(
  `<div id="face-wrap" style="opacity:${first.faceOn ? 1 : 0};"><div id="face-inner"><video id="face" src="${esc(M.face.src)}" data-start="0" data-duration="${T(FACE_DUR)}" data-track-index="1" muted playsinline></video></div></div>`,
);
if (M.face.cutout)
  html.push(
    `<div id="cutout-wrap" style="opacity:${first.cutout ? 1 : 0};"><div id="cutout-inner"><video id="face-cutout" src="${esc(M.face.cutout)}" data-start="0" data-duration="${T(FACE_DUR)}" data-track-index="4" muted playsinline></video></div></div>`,
  );

// Titres (bandeau haut) et pastilles flottantes.
segs.forEach((s, i) => {
  if (s.title) {
    const dur = q(Math.min(s.titleDuration ?? s.end - s.start, s.end - s.start));
    html.push(
      `<div class="topline clip" id="title-${i}" data-start="${T(s.start)}" data-duration="${T(dur)}" data-track-index="5">${esc(s.title)}</div>`,
    );
    js.push(`tl.fromTo("#title-${i}", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${T(s.start)});`);
  }
  (s.chips ?? []).forEach((c, k) => {
    const at = q(s.start + (c.at ?? 0.6));
    const dur = q(Math.min(c.duration ?? 2.4, s.end - at));
    if (dur <= 0.2) return;
    const pos = c.pos ?? CHIP_POS[s.layout];
    const [bg, fg] = ICON_TINT[(c.tint ?? k) % ICON_TINT.length];
    const id = `chip-${i}-${k}`;
    html.push(
      `<div class="chip clip" id="${id}" data-start="${T(at)}" data-duration="${T(dur)}" data-track-index="6" style="left:${pos.x}px;top:${pos.y}px;"><div class="chip-in" id="${id}-in"><div class="chip-ico" style="background:${bg};color:${fg}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[c.icon ?? "calendar"] ?? ICONS.calendar}</svg></div><div><div class="chip-t">${esc(c.title)}</div>${c.text ? `<div class="chip-s">${esc(c.text)}</div>` : ""}</div></div></div>`,
    );
    js.push(
      `tl.fromTo("#${id}-in", { opacity: 0, y: 24, scale: 0.92, rotation: -2 }, { opacity: 1, y: 0, scale: 1, rotation: -1.5, duration: 0.5, ease: "back.out(1.6)" }, ${T(at)});`,
    );
    js.push(`tl.to("#${id}-in", { y: -6, duration: ${T(Math.max(dur - 0.8, 0.2))}, ease: "sine.inOut" }, ${T(at + 0.5)});`);
  });
});

// Carte de fin.
if (END) {
  html.push(
    `<div class="end clip" id="end" data-start="${T(FACE_DUR)}" data-duration="${T(END_DUR)}" data-track-index="7"><div class="end-in"><img id="end-logo" src="brand/logo.svg" alt="Reso" />${END.line ? `<div class="end-line" id="end-line">${esc(END.line)}</div>` : ""}${END.cta ? `<div class="end-cta" id="end-cta">${esc(END.cta)}</div>` : ""}${END.url ? `<div class="end-url" id="end-url">${esc(END.url)}</div>` : ""}</div></div>`,
  );
  js.push(`tl.fromTo("#end-logo", { opacity: 0, y: 20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }, ${T(FACE_DUR + 0.1)});`);
  ["end-line", "end-cta", "end-url"].forEach((id, k) => {
    js.push(`if (document.getElementById("${id}")) tl.fromTo("#${id}", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, ${T(FACE_DUR + 0.35 + k * 0.15)});`);
  });
}

// Sous-titres.
html.push(`<div id="captions">`);
capGroups.forEach((g, i) => {
  const spans = g.words
    .map((w, k) => `<span class="w${w.emph ? " em" : ""}" id="c${i}w${k}">${esc(w.text)}</span>`)
    .join(" ");
  html.push(
    `<div class="cap clip" id="cap-${i}" data-start="${T(g.start)}" data-duration="${T(g.end - g.start)}" data-track-index="8">${spans}</div>`,
  );
  js.push(`tl.fromTo("#cap-${i}", { opacity: 0, y: 14, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.16, ease: "power2.out" }, ${T(g.start)});`);
  g.words.forEach((w, k) => {
    js.push(`tl.set("#c${i}w${k}", { color: "${C.brand}" }, ${T(Math.max(w.start, g.start))});`);
    const off = g.words[k + 1]?.start ?? g.end;
    if (k + 1 < g.words.length) js.push(`tl.set("#c${i}w${k}", { color: "${w.emph ? C.brandDeep : C.ink}" }, ${T(off)});`);
  });
});
html.push(`</div>`);

// Transitions de layout (face, scène, détourage, position des sous-titres).
segs.forEach((s, i) => {
  const L = LAYOUTS[s.layout];
  const t = s.start;
  const dur = i === 0 ? 0 : 0.5;
  const zoom = s.layout === "face" ? (s.zoom ?? 1) : 1;
  const fx = faceXform(L.face);
  js.push(
    `tl.to("#face-wrap", { x: ${fx.x}, y: ${fx.y}, scale: ${fx.scale}, clipPath: "${fx.clipPath}", opacity: ${L.faceOn ? 1 : 0}, duration: ${dur}, ease: "power3.inOut" }, ${T(t)});`,
  );
  js.push(`tl.to("#bubble-ring", { opacity: ${ringOn(L) ? 1 : 0}, duration: ${dur ? 0.3 : 0} }, ${T(ringOn(L) ? t + dur * 0.6 : t)});`);
  js.push(`tl.set("#face-inner", { scale: ${zoom} }, ${T(t)});`);
  js.push(`tl.to("#stage-bg", { opacity: ${L.stage ? 1 : 0}, duration: ${dur ? 0.35 : 0} }, ${T(t)});`);
  if (M.face.cutout) js.push(`tl.to("#cutout-wrap", { opacity: ${L.cutout ? 1 : 0}, duration: ${dur ? 0.35 : 0} }, ${T(t)});`);
  js.push(`tl.to("#captions", { y: ${L.cap}, duration: ${dur}, ease: "power3.inOut" }, ${T(t)});`);
});

// Audio : voix (piste son de la face caméra) + musique facultative.
const audio = [
  `<audio id="voice" src="${esc(M.face.src)}" data-start="0" data-duration="${T(FACE_DUR)}" data-track-index="10" data-volume="1"></audio>`,
];
if (M.music?.src) {
  if (!existsSync(join(PROJECT, M.music.src))) fail(`Musique introuvable : ${M.music.src}`);
  audio.push(
    `<audio id="music" src="${esc(M.music.src)}" data-start="0" data-duration="${T(TOTAL)}" data-media-start="${(M.music.from ?? 0).toFixed(3)}" data-track-index="11" data-volume="${M.music.volume ?? 0.08}"></audio>`,
  );
}

const css = `
@font-face { font-family: "Manrope"; src: url("brand/manrope.woff2") format("woff2"); font-weight: 200 800; font-display: block; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: ${C.page}; font-family: "Manrope", system-ui, sans-serif; color: ${C.ink}; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${C.page}; }
#stage-bg { position: absolute; inset: 0; opacity: ${first.stage ? 1 : 0};
  background:
    radial-gradient(circle at 16% 22%, rgba(108, 79, 248, 0.26), transparent 38%),
    radial-gradient(circle at 86% 30%, rgba(255, 190, 150, 0.32), transparent 36%),
    radial-gradient(circle at 50% 86%, rgba(130, 170, 255, 0.28), transparent 44%),
    ${C.page}; }
#stage { position: absolute; inset: 0; }
.shot { position: absolute; opacity: 0; }
.shot-in { position: relative; width: 100%; height: 100%; }
.shot .screen { position: absolute; inset: 0; overflow: hidden; background: ${C.card}; }
.shot .kb { width: 100%; height: 100%; }
.shot .kb img, .shot .kb video { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
.shot-phone .shot-in { border-radius: 64px; background: ${C.ink}; padding: 14px;
  box-shadow: 0 2px 6px rgba(17,17,22,.06), 0 40px 90px -30px rgba(60,40,140,.45), 0 90px 160px -60px rgba(60,40,140,.35); }
.shot-phone .screen { inset: 14px; border-radius: 50px; }
.shot-phone .notch { position: absolute; z-index: 2; top: 30px; left: 50%; width: 120px; height: 34px; margin-left: -60px; border-radius: 20px; background: ${C.ink}; }
.shot-window .shot-in { border-radius: 24px; background: ${C.card}; border: 1px solid ${C.line}; overflow: hidden;
  box-shadow: 0 1px 2px rgba(17,17,22,.04), 0 24px 60px -24px rgba(60,40,140,.3), 0 60px 120px -50px rgba(60,40,140,.25); }
.shot-window .win-bar { height: 44px; display: flex; gap: 9px; align-items: center; padding: 0 18px; border-bottom: 1px solid ${C.line}; background: ${C.page}; }
.shot-window .win-bar i { width: 12px; height: 12px; border-radius: 6px; background: ${C.line}; }
.shot-window .screen { top: 44px; }
#face-wrap { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; transform-origin: 0 0; }
#bubble-ring { position: absolute; border-radius: 50%; background: ${C.card}; box-shadow: 0 24px 60px -20px rgba(60,40,140,.5); }
#face-inner { width: 100%; height: 100%; transform-origin: 50% ${FOCUS_Y}%; overflow: hidden; }
#face { width: 100%; height: 100%; object-fit: cover; object-position: 50% ${FOCUS_Y}%; display: block; }
#cutout-wrap { position: absolute; inset: 0; }
#cutout-inner { position: absolute; left: -120px; bottom: 0; width: ${W}px; height: ${H}px; transform-origin: 0% 100%; transform: scale(0.84); }
#face-cutout { width: 100%; height: 100%; object-fit: cover; display: block; }
.card-slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 0 90px 420px; }
.card-in { display: flex; flex-direction: column; align-items: flex-start; gap: 34px; width: 100%; }
.kicker { font-size: 30px; font-weight: 700; letter-spacing: .02em; color: ${C.brand}; background: ${C.card}; border: 1px solid ${C.line}; border-radius: 999px; padding: 12px 26px; box-shadow: 0 6px 20px -10px rgba(17,17,22,.12); }
.card-text { font-size: 112px; line-height: .98; font-weight: 800; letter-spacing: -0.04em; color: ${C.ink}; }
.cw { display: inline-block; }
.card-sub { font-size: 42px; line-height: 1.3; font-weight: 500; color: ${C.muted}; max-width: 860px; }
.topline { position: absolute; left: 70px; right: 70px; top: 210px; margin: 0 auto; width: fit-content; max-width: 940px; font-size: 50px; line-height: 1.12; font-weight: 800; letter-spacing: -0.02em; text-align: center; color: ${C.ink}; background: rgba(255,255,255,.94); border-radius: 28px; padding: 22px 36px; box-shadow: 0 2px 6px rgba(17,17,22,.05), 0 18px 40px -16px rgba(60,40,140,.3); }
.chip { position: absolute; }
.chip-in { display: flex; align-items: center; gap: 22px; background: ${C.card}; border: 1px solid ${C.line}; border-radius: 30px; padding: 22px 30px 22px 22px; box-shadow: 0 2px 6px rgba(17,17,22,.05), 0 18px 40px -16px rgba(60,40,140,.32); }
.chip-ico { width: 76px; height: 76px; border-radius: 22px; display: flex; align-items: center; justify-content: center; flex: none; }
.chip-ico svg { width: 40px; height: 40px; }
.chip-t { font-size: 34px; font-weight: 700; letter-spacing: -0.01em; color: ${C.ink}; white-space: nowrap; }
.chip-s { font-size: 28px; font-weight: 500; color: ${C.muted}; margin-top: 4px; white-space: nowrap; }
.end { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.end-in { display: flex; flex-direction: column; align-items: center; gap: 40px; padding-bottom: 260px; }
#end-logo { width: 460px; height: auto; }
.end-line { font-size: 56px; font-weight: 800; letter-spacing: -0.03em; text-align: center; max-width: 900px; line-height: 1.08; }
.end-cta { font-size: 40px; font-weight: 700; color: ${C.card}; background: ${C.ink}; border-radius: 22px; padding: 28px 52px; box-shadow: 0 24px 50px -20px rgba(17,17,22,.5); }
.end-url { font-size: 36px; font-weight: 600; color: ${C.muted}; }
#captions { position: absolute; left: 0; top: 0; width: ${W}px; height: 0; }
.cap { position: absolute; left: 70px; right: 70px; top: -50px; margin: 0 auto; width: fit-content; max-width: 940px; font-size: 60px; line-height: 1.12; font-weight: 800; letter-spacing: -0.02em; text-align: center; color: ${C.ink};
  background: rgba(255,255,255,.95); border-radius: 26px; padding: 16px 30px 18px; box-shadow: 0 2px 6px rgba(17,17,22,.08), 0 20px 44px -16px rgba(17,17,22,.35); }
.cap .w { display: inline; }
.cap .w.em { color: ${C.brandDeep}; background: ${C.soft}; border-radius: 12px; padding: 0 8px; }
`;

const out = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(M.title ?? M.id ?? "Vidéo Reso")}</title>
    <!-- Généré par .claude/skills/reso-facecam-app/scripts/build-montage.mjs — modifier montage.json puis relancer. -->
    <style>${css}</style>
  </head>
  <body>
    <div id="root" data-composition-id="reso-montage" data-start="0" data-width="${W}" data-height="${H}" data-duration="${T(TOTAL)}" data-fps="${FPS}">
      ${html.join("\n      ")}
      ${audio.join("\n      ")}
    </div>
    <script src="brand/gsap.min.js"></script>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${js.join("\n      ")}
      window.__timelines["reso-montage"] = tl;
    </script>
  </body>
</html>
`;
writeFileSync(join(PROJECT, "index.html"), out);
console.log(`✔ ${join(projectArg, "index.html")} — ${segs.length} segments, ${capGroups.length} sous-titres, ${TOTAL}s @ ${FPS} i/s`);
