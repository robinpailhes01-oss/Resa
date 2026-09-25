#!/usr/bin/env node
// Filme l'application Reso (ou la landing) à partir d'un scénario JSON, pour les montages vidéo.
//
// Usage : node capture-app.mjs <scenario.json> [--out videos/<slug>/media/app] [--base http://localhost:3000]
//
// Produit dans --out :
//   <name>.mp4          la vidéo du parcours (H.264, 30 i/s, images clés denses → prête pour HyperFrames)
//   <name>-<shot>.png   une image nette (deviceScaleFactor 3) à chaque étape { "shot": "<shot>" }
//
// Format du scénario : voir ../SKILL.md (goto, wait, click, fill, type, press, scroll, hover, shot, login).

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
};
const scenarioPath = argv.find((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
if (!scenarioPath) {
  console.error("Usage : node capture-app.mjs <scenario.json> [--out dossier] [--base url]");
  process.exit(1);
}
const S = JSON.parse(readFileSync(scenarioPath, "utf8"));
const NAME = S.name ?? basename(scenarioPath, ".json");
const BASE = opt("base", S.base ?? process.env.BASE_URL ?? "http://localhost:3000");
const OUT = resolve(opt("out", S.out ?? "."));
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
  desktop: { width: 1440, height: 900, isMobile: false, hasTouch: false },
  tablet: { width: 820, height: 1180, isMobile: true, hasTouch: true },
};
const vp = typeof S.viewport === "object" ? S.viewport : VIEWPORTS[S.viewport ?? "mobile"];
const SCALE = S.videoScale ?? 3; // résolution de la vidéo = viewport × SCALE (390×844 → 1170×2532)

const launch = { executablePath: existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined };
const browser = await chromium.launch(launch);
const tmpVideo = join(OUT, `.rec-${NAME}`);
rmSync(tmpVideo, { recursive: true, force: true });

// Contexte photo : netteté maximale pour les images fixes.
const photoCtx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 3, isMobile: vp.isMobile, hasTouch: vp.hasTouch, locale: "fr-FR", reducedMotion: "no-preference" });
// Contexte vidéo. La vidéo native de Playwright et le screencast Chrome n'enregistrent qu'en
// pixels CSS (390 px de large) : trop flou pour un Reel. On filme donc « au ralenti » :
// animations CSS ralenties ×SLOW (CDP Animation.setPlaybackRate), défilements et frappes
// étirés d'autant, captures d'écran nettes en boucle, puis horodatage ramené au temps réel.
const SLOW = S.slow ?? 5;
const videoCtx = await browser.newContext({
  viewport: { width: vp.width, height: vp.height },
  deviceScaleFactor: SCALE,
  isMobile: vp.isMobile,
  hasTouch: vp.hasTouch,
  locale: "fr-FR",
});

async function slowDown(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Animation.enable");
  await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 / SLOW });
}

function startCapture(page) {
  mkdirSync(tmpVideo, { recursive: true });
  const frames = [];
  const t0 = performance.now();
  let running = true;
  const loop = (async () => {
    while (running) {
      const t = (performance.now() - t0) / 1000 / SLOW;
      const buf = await page.screenshot({ type: "jpeg", quality: 92 }).catch(() => null);
      if (!buf) {
        await sleep(30);
        continue;
      }
      const file = join(tmpVideo, `f${String(frames.length).padStart(6, "0")}.jpg`);
      writeFileSync(file, buf);
      frames.push({ file, t });
    }
  })();
  return async () => {
    running = false;
    await loop;
    return frames;
  };
}

// Masque l'indicateur de développement Next.js (pastille « N ») dès le chargement.
for (const ctx of [photoCtx, videoCtx])
  await ctx.addInitScript(() => {
    const css = "nextjs-portal{display:none!important}";
    document.addEventListener("DOMContentLoaded", () => {
      const st = document.createElement("style");
      st.textContent = css;
      document.head.appendChild(st);
    });
  });

const url = (p) => (/^https?:/.test(p) ? p : BASE.replace(/\/$/, "") + p);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Défilement adouci piloté par l'horloge (et non par un nombre de pas) : il dure bien
// `duration` même quand les captures d'écran ralentissent chaque appel.
async function smoothScroll(page, dy, duration = 1200) {
  const t0 = performance.now();
  let done = 0;
  for (;;) {
    const p = Math.min((performance.now() - t0) / duration, 1);
    const target = dy * (0.5 - Math.cos(Math.PI * p) / 2); // ease in-out
    const delta = Math.round(target - done);
    if (delta) {
      // behavior « instant » : la landing déclare scroll-behavior: smooth, qui fausserait chaque pas.
      await page.evaluate((d) => window.scrollBy({ top: d, behavior: "instant" }), delta);
      done += delta;
    }
    if (p >= 1) break;
    await sleep(16);
  }
}

async function run(page, { record }) {
  const k = record ? SLOW : 1; // facteur d'étirement du temps réel pendant l'enregistrement
  page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
  for (const step of S.steps ?? []) {
    if (step.login) {
      await page.goto(url("/connexion"));
      await page.fill("#email", step.login.email);
      await page.fill("#password", step.login.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/, { timeout: 20000 });
    } else if (step.goto) {
      await page.goto(url(step.goto), { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      if (record) await slowDown(page);
    } else if (step.wait) {
      await sleep(record ? step.wait * k : Math.min(step.wait, 400));
    } else if (step.click) {
      const target = page.locator(step.click).first();
      // « optional » : étape sautée si l'élément n'existe pas (ex. un seul praticien).
      if (step.optional && !(await target.count())) continue;
      await target.click();
      await page.waitForLoadState("networkidle").catch(() => {});
    } else if (step.hover) {
      await page.locator(step.hover).first().hover();
    } else if (step.fill) {
      await page.fill(step.fill[0], step.fill[1]);
    } else if (step.type) {
      // Frappe visible, lettre par lettre (plus naturel à l'écran).
      await page.locator(step.type[0]).first().click();
      await page.keyboard.type(step.type[1], { delay: record ? (step.delay ?? 70) * k : 0 });
    } else if (step.press) {
      await page.keyboard.press(step.press);
    } else if (step.scroll !== undefined) {
      if (record) await smoothScroll(page, step.scroll, (step.duration ?? 1200) * k);
      else await page.evaluate((d) => window.scrollBy({ top: d, behavior: "instant" }), step.scroll);
    } else if (step.reveal) {
      // Force les apparitions différées de la landing (.reveal, .demo-stage).
      await page.evaluate(() => document.querySelectorAll(".reveal, .demo-stage").forEach((el) => el.classList.add("is-visible")));
    } else if (step.shot) {
      if (!record) {
        await sleep(350);
        await page.screenshot({ path: join(OUT, `${NAME}-${step.shot}.png`), fullPage: !!step.fullPage });
        console.log(`  image ${NAME}-${step.shot}.png`);
      }
    }
    if (record && step.pause !== 0) await sleep((step.pause ?? 250) * k);
  }
  if (record) await sleep((S.tail ?? 800) * k);
}

console.log(`Scénario « ${NAME} » sur ${BASE} (${vp.width}×${vp.height})`);
if (S.stills !== false) {
  const p = await photoCtx.newPage();
  await run(p, { record: false });
}
if (S.video !== false) {
  const p = await videoCtx.newPage();
  await p.goto("about:blank");
  const stop = startCapture(p);
  await run(p, { record: true });
  var frames = await stop();
  await p.close();
}
await videoCtx.close();
await photoCtx.close();
await browser.close();

if (S.video !== false) {
  // Captures irrégulières : on reconstruit un flux à 30 i/s en tenant chaque image
  // jusqu'à la suivante (démultiplexeur concat + durées).
  if (!frames.length) throw new Error("Aucune image capturée.");
  const end = frames[frames.length - 1].t + 1 / 30;
  const list = frames
    .map((fr, k) => `file '${fr.file}'\nduration ${Math.max((frames[k + 1]?.t ?? end) - fr.t, 1 / 30).toFixed(4)}`)
    .join("\n");
  const listFile = join(tmpVideo, "frames.txt");
  writeFileSync(listFile, `${list}\nfile '${frames[frames.length - 1].file}'\n`);
  const raw = listFile;
  const mp4 = join(OUT, `${NAME}.mp4`);
  // Recadre le blanc initial éventuel (S.trimStart) et ré-encode : 30 i/s, une image clé par seconde
  // max (-g 30) pour que HyperFrames puisse se positionner sur n'importe quelle image.
  const ss = S.trimStart ? ["-ss", String(S.trimStart)] : [];
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", raw, ...ss, "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-r", "30", "-c:v", "libx264", "-crf", "16", "-g", "30", "-keyint_min", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4]);
  rmSync(tmpVideo, { recursive: true, force: true });
  console.log(`  vidéo ${mp4}`);
} else if (existsSync(tmpVideo)) rmSync(tmpVideo, { recursive: true, force: true });
