// Captures de recette aux largeurs de référence, et captures réelles pour docs/previews.
// Usage : BASE_URL=http://localhost:3000 node scripts/screenshots.mjs [--docs]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = path.join(process.cwd(), "tests/screenshots");
const docs = path.join(process.cwd(), "docs/previews");
const withDocs = process.argv.includes("--docs");
mkdirSync(out, { recursive: true });
if (withDocs) mkdirSync(docs, { recursive: true });

const viewports = [
  { name: "320x568", width: 320, height: 568 },
  { name: "390x844", width: 390, height: 844 },
  { name: "514x1536", width: 514, height: 1536 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Laisse la séquence d'arrivée du premier écran et la démonstration de l'agenda se terminer.
  await page.waitForTimeout(2600);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.screenshot({ path: path.join(out, `home-${vp.name}-fold.png`) });
  if (withDocs && vp.width === 390) await page.screenshot({ path: path.join(docs, "hero-mobile.png") });
  // Finalise les apparitions différées pour la capture pleine page.
  await page.evaluate(() => document.querySelectorAll(".reveal, .demo-stage").forEach((el) => el.classList.add("is-visible")));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(out, `home-${vp.name}-full.png`), fullPage: true });
  if (withDocs) {
    if (vp.width === 1440) {
      await page.screenshot({ path: path.join(docs, "landing-desktop.png"), fullPage: true });
      for (const [id, file] of [["avis", "section-avis.png"], ["tarif", "section-tarif.png"]]) {
        const el = page.locator(`#${id}`);
        await el.screenshot({ path: path.join(docs, file) });
      }
    }
    if (vp.width === 390) await page.screenshot({ path: path.join(docs, "landing-mobile.png"), fullPage: true });
    if (vp.width === 514) await page.screenshot({ path: path.join(docs, "landing-mobile-514.png"), fullPage: true });
  }
  console.log(`${vp.name} — scroll horizontal : ${overflow ? "OUI (anomalie)" : "non"}${errors.length ? ` — erreurs JS : ${errors.join(" | ")}` : ""}`);
  if (overflow || errors.length) process.exitCode = 1;
  await page.close();
}
await browser.close();
