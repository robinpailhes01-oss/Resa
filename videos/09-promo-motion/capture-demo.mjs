// Capture de la démo en ligne (www.reso-app.fr/demo) en 2880 px pour la vidéo 09.
// Usage (depuis la racine du dépôt) : node videos/09-promo-motion/capture-demo.mjs videos/09-promo-motion/capture/assets
// Puis recadrage sans bandeau « démo » vers assets/app-*.png (voir STORYBOARD.md).
import { chromium } from "playwright";
const D = process.argv[2];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--ignore-certificate-errors"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const hide = () => p.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast]{display:none!important} *{caret-color:transparent}" });
await p.goto("https://www.reso-app.fr/demo", { waitUntil: "networkidle" }); await hide();
await p.waitForTimeout(1500);
await p.screenshot({ path: `${D}/demo-dashboard.png` });
await p.screenshot({ path: `${D}/demo-dashboard-full.png`, fullPage: true });
for (const [name, label] of [["agenda","Agenda"],["mapage","Ma page"],["emails","Emails automatiques"],["paiements","Paiements"]]) {
  await p.getByRole("button", { name: label, exact: true }).first().click();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${D}/demo-${name}.png` });
  await p.screenshot({ path: `${D}/demo-${name}-full.png`, fullPage: true });
}
await p.goto("https://www.reso-app.fr/demo/reservation", { waitUntil: "networkidle" }); await hide();
await p.waitForTimeout(1200);
await p.screenshot({ path: `${D}/demo-reservation-desktop.png` });
await p.screenshot({ path: `${D}/demo-reservation-desktop-full.png`, fullPage: true });
const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const q = await m.newPage();
await q.goto("https://www.reso-app.fr/demo/reservation", { waitUntil: "networkidle" });
await q.waitForTimeout(1200);
await q.screenshot({ path: `${D}/demo-reservation-mobile.png` });
await q.screenshot({ path: `${D}/demo-reservation-mobile-full.png`, fullPage: true });
await b.close();
