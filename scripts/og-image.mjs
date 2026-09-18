// Génère src/app/opengraph-image.png (1200 × 630) à partir d'un gabarit HTML.
// Usage : node scripts/og-image.mjs
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const font = readFileSync(path.join(root, "src/assets/fonts/manrope-latin-wght-normal.woff2")).toString("base64");

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
@font-face{font-family:Manrope;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:200 800}
html,body{margin:0}
body{width:1200px;height:630px;background:#faf7f2;color:#493344;font-family:Manrope,system-ui,sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:72px;box-sizing:border-box}
.logo{display:flex;align-items:center;gap:14px}
.mark{width:56px;height:56px;border-radius:14px;background:#493344;display:flex;align-items:center;justify-content:center}
.mark span{color:#faf7f2;font-size:34px;font-weight:700;line-height:1}
.name{font-size:44px;font-weight:700;letter-spacing:-1px}
h1{font-size:76px;font-weight:700;line-height:1.05;letter-spacing:-2px;margin:0 0 18px}
p{font-size:32px;color:#655b66;margin:0}
.tags{display:flex;gap:12px}
.tags div{padding:12px 22px;border-radius:999px;background:#ddd5e5;font-size:24px;font-weight:600}
</style></head><body>
<div class="logo"><div class="mark"><span>r</span></div><div class="name">reso</div></div>
<div><h1>Vos rendez-vous.<br>Un prix tout simple.</h1><p>Agenda en ligne pour les pros de la beauté et du bien-être</p></div>
<div class="tags"><div>Réservation en ligne</div><div>Emails automatiques</div><div>Agenda partagé</div></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: "png" });
writeFileSync(path.join(root, "src/app/opengraph-image.png"), png);
await browser.close();
console.log("opengraph-image.png généré (1200×630)");
