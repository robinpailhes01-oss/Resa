// Recette fonctionnelle de la landing (menu mobile, CTA, ancres, préinscription avec et sans JavaScript, mouvement réduit).
// Usage : serveur lancé avec DATABASE_URL ou WAITLIST_FILE et EMAIL_PROVIDER=console, puis : node scripts/recette-landing.mjs [http://127.0.0.1:3000]
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const results = [];
const ok = (name, cond, detail = "") => results.push(`${cond ? "OK " : "KO "} ${name}${detail ? ` — ${detail}` : ""}`);

// 1. Desktop : ancres, CTA, un seul h1, structure des titres
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  ok("un seul h1", (await page.locator("h1").count()) === 1);
  const headings = await page.evaluate(() => Array.from(document.querySelectorAll("h1,h2,h3")).map((h) => `${h.tagName}:${h.textContent.trim().slice(0, 40)}`));
  ok("hiérarchie des titres", headings[0].startsWith("H1") && !headings.some((h, i) => i > 0 && h.startsWith("H3") && !headings.slice(0, i).some((x) => x.startsWith("H2"))), headings.join(" › "));
  for (const id of ["produit", "fonctionnalites", "avis", "tarif"]) {
    ok(`ancre #${id} présente`, (await page.locator(`#${id}`).count()) === 1);
  }
  const navHrefs = await page.locator('nav[aria-label="Navigation principale"] a').evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  ok("liens de navigation", JSON.stringify(navHrefs) === JSON.stringify(["/#produit", "/#fonctionnalites", "/#avis", "/#tarif"]), navHrefs.join(", "));
  // Navigation ne masque pas le titre de section après clic sur une ancre
  await page.click('nav[aria-label="Navigation principale"] a[href="/#tarif"]');
  await page.waitForTimeout(900);
  const rel = await page.evaluate(() => {
    const nav = document.querySelector("header").getBoundingClientRect();
    const title = document.getElementById("tarif-title").getBoundingClientRect();
    return { navBottom: Math.round(nav.bottom), titleTop: Math.round(title.top) };
  });
  ok("le titre Tarif reste sous la navigation", rel.titleTop > rel.navBottom, JSON.stringify(rel));
  const ctas = await page.locator('a:has-text("Me prévenir du lancement")').evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  ok("tous les CTA mènent à /preinscription", ctas.length >= 4 && ctas.every((h) => h.startsWith("/preinscription")), `${ctas.length} CTA`);
  ok("aucune erreur JS (desktop)", errors.length === 0, errors.join(" | "));
  // Animation unique : après 3 s, la carte rappel est visible et stable
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  const cardOpacity = await page.locator(".demo-card").first().evaluate((el) => getComputedStyle(el).opacity);
  const slotOpacity = await page.locator(".demo-slot").first().evaluate((el) => getComputedStyle(el).opacity);
  ok("démonstration terminée à l'état final", cardOpacity === "1" && slotOpacity === "1", `carte ${cardOpacity}, créneau ${slotOpacity}`);
  await page.close();
}

// 2. Mouvement réduit : état final immédiat
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(150);
  const states = await page.evaluate(() => ({
    slot: getComputedStyle(document.querySelector(".demo-slot")).opacity,
    card: getComputedStyle(document.querySelector(".demo-card")).opacity,
    title: getComputedStyle(document.querySelector("#hero-title")).opacity,
    perspective: getComputedStyle(document.querySelector(".product-window")).transform,
  }));
  ok("prefers-reduced-motion : tout visible sans animation", states.slot === "1" && states.card === "1" && states.title === "1" && states.perspective === "none", JSON.stringify(states));
  await page.close();
}

// 3. Mobile : menu, Échap, focus, CTA, agenda dans le premier écran
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const agendaTop = await page.evaluate(() => Math.round(document.getElementById("produit").getBoundingClientRect().top));
  const agendaBottom = await page.evaluate(() => Math.round(document.querySelector("#produit [role=img]").getBoundingClientRect().bottom));
  ok("agenda mobile commence entre 400 et 500 px", agendaTop >= 400 && agendaTop <= 500, `${agendaTop} px, bas de l'agenda à ${agendaBottom} px`);
  const toggle = page.locator('button[aria-controls]');
  await toggle.click();
  ok("menu mobile ouvert", (await toggle.getAttribute("aria-expanded")) === "true");
  const mobileLinks = await page.locator('nav[aria-label="Navigation mobile"] a').evaluateAll((els) => els.map((a) => a.textContent.trim()));
  ok("liens du menu mobile", mobileLinks.join("|") === "Produit|Fonctionnalités|Avis|Tarif|Me prévenir du lancement", mobileLinks.join(", "));
  await page.keyboard.press("Escape");
  ok("Échap ferme le menu", (await toggle.getAttribute("aria-expanded")) === "false");
  ok("focus revenu sur le bouton menu", await toggle.evaluate((el) => document.activeElement === el));
  const floats = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    return Array.from(document.querySelectorAll(".demo-card")).filter((el) => getComputedStyle(el).display !== "none").map((el) => { const r = el.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), vw }; });
  });
  ok("aucun élément flottant coupé sur mobile", floats.every((f) => f.left >= 0 && f.right <= f.vw), JSON.stringify(floats));
  const buttons = await page.locator("a.btn, button").evaluateAll((els) => els.filter((e) => e.offsetParent !== null).map((e) => Math.round(e.getBoundingClientRect().height)));
  ok("cibles tactiles ≥ 40 px", buttons.every((h) => h >= 40), `min ${Math.min(...buttons)} px`);
  ok("aucune erreur JS (mobile)", errors.length === 0, errors.join(" | "));
  await page.close();
}

// 4. Préinscription : UTM, validation, erreurs, succès, liens de retour, FAQ, mentions
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${base}/?utm_source=test&utm_campaign=refonte`, { waitUntil: "networkidle" });
  const heroCta = await page.locator('#hero a:has-text("Me prévenir du lancement")').getAttribute("href");
  ok("UTM conservés dans le lien du CTA", heroCta.includes("utm_source=test") && heroCta.includes("utm_campaign=refonte"), heroCta);
  await page.click('#hero a:has-text("Me prévenir du lancement")');
  await page.waitForURL(/\/preinscription/);
  ok("h1 sur /preinscription", (await page.locator("h1").count()) === 1);
  ok("FAQ présente", (await page.locator("#faq").count()) === 1 && (await page.locator("#faq li").count()) >= 6);
  ok("mentions commerciales visibles", await page.locator('text=SMS, caisse et terminal de paiement non inclus').isVisible());
  ok("lien de retour vers la landing", (await page.locator('a[href="/"]').count()) >= 1);
  const navFromPre = await page.locator('nav[aria-label="Navigation principale"] a').evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  ok("liens de navigation depuis /preinscription pointent vers /#…", navFromPre.every((h) => h.startsWith("/#")));
  // Email invalide
  await page.fill('input[name="email"]', "pas-un-email");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const err = await page.locator('[id$="-error"], .text-error').first().textContent().catch(() => "");
  ok("erreur affichée pour un email invalide", /valide/i.test(err ?? ""), err?.trim());
  ok("focus sur le champ email", await page.evaluate(() => document.activeElement?.getAttribute("name") === "email"));
  // Succès (store fichier + email console : aucun envoi réel)
  await page.fill('input[name="email"]', `recette+${Date.now()}@example.com`);
  await page.selectOption('select[name="businessType"]', "institut");
  const [resp] = await Promise.all([page.waitForResponse((r) => r.url().includes("/api/waitlist")), page.click('button[type="submit"]')]);
  const shown = await page.locator('[role="status"] >> text=Vérifiez votre boîte mail').isVisible({ timeout: 5000 }).catch(() => false);
  ok("confirmation après inscription", resp.status() === 202 && shown, `HTTP ${resp.status()}`);
  await page.close();
}

// 5. Sans JavaScript : contenu, CTA, POST natif
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "load" });
  const visible = await page.evaluate(() => ["#hero-title", "#produit", "#fonctionnalites-title", "#avis-title", "#tarif-title"].every((s) => { const el = document.querySelector(s); return el && getComputedStyle(el).opacity === "1" && getComputedStyle(el).visibility !== "hidden"; }));
  ok("sans JS : contenu essentiel visible", visible);
  const demoVisible = await page.evaluate(() => getComputedStyle(document.querySelector(".demo-card")).opacity === "1" && getComputedStyle(document.querySelector(".demo-slot")).opacity === "1");
  ok("sans JS : agenda et carte à l'état final", demoVisible);
  await page.goto(`${base}/preinscription`, { waitUntil: "load" });
  const faqAnswer = await page.locator("#faq p").first().isVisible();
  ok("sans JS : réponses FAQ lisibles", faqAnswer);
  await page.fill('input[name="email"]', `nojs+${Date.now()}@example.com`);
  const [postResp] = await Promise.all([page.waitForResponse((r) => r.url().includes("/api/waitlist")), page.click('button[type="submit"]')]);
  await page.waitForTimeout(1500);
  await page.waitForLoadState("load");
  const location = postResp.headers()["location"] ?? "";
  ok("sans JS : POST natif puis redirection", postResp.status() === 303 && location.includes("/preinscription?inscription=ok") && /preinscription\?inscription=ok/.test(page.url()) && (await page.locator('text=Vérifiez votre boîte mail').count()) > 0, `${postResp.status()} → ${location} ; page ${page.url()}`);
  await ctx.close();
}

// 6. Anciennes URL de résultat
{
  const res = await fetch(`${base}/?inscription=ok`, { redirect: "manual" });
  ok("/?inscription=ok redirige vers /preinscription", res.status === 307 && (res.headers.get("location") ?? "").includes("/preinscription?inscription=ok"), `${res.status} ${res.headers.get("location")}`);
}

await browser.close();
console.log(results.join("\n"));
if (results.some((r) => r.startsWith("KO"))) process.exitCode = 1;
