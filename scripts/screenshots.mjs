// Captures de recette (cahier des charges §18) aux largeurs de référence.
// Usage : BASE_URL=http://localhost:3000 node scripts/screenshots.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = path.join(process.cwd(), "tests/screenshots");
mkdirSync(out, { recursive: true });

const viewports = [
  { name: "320x568", width: 320, height: 568 },
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Laisse la séquence d'arrivée du premier écran se terminer.
  await page.waitForTimeout(2600);
  // Rend visibles les éléments à apparition différée pour la capture pleine page.
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible")));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.screenshot({ path: path.join(out, `home-${vp.name}-fold.png`) });
  await page.screenshot({ path: path.join(out, `home-${vp.name}-full.png`), fullPage: true });
  console.log(`${vp.name} — scroll horizontal : ${overflow ? "OUI (anomalie)" : "non"}`);
  await page.close();
}
await browser.close();
