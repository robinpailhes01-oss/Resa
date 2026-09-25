#!/usr/bin/env node
// Crée l'établissement de démonstration filmé dans les vidéos (données 100 % fictives) :
// compte demo+video@example.com, « Maison Alba » (Lyon), 4 prestations, 2 praticiennes,
// puis des réservations clientes via la page publique pour remplir l'agenda.
//
// Prérequis : app lancée avec DATABASE_URL (base de test !) et EMAIL_PROVIDER=console.
// Usage : node seed-demo.mjs [http://localhost:3000] [--bookings 6]
// Relançable : si le compte existe déjà, il se connecte et ajoute seulement des réservations.

import { chromium } from "playwright";
import { existsSync } from "node:fs";

const BASE = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:3000";
const nArg = process.argv.indexOf("--bookings");
const N_BOOKINGS = nArg > 0 ? Number(process.argv[nArg + 1]) : 6;
export const DEMO = { email: "demo+video@example.com", password: "reso-demo-video-2026", slug: "maison-alba" };

const SERVICES = [
  { name: "Coupe & brushing", duration: 60, price: 45 },
  { name: "Coloration", duration: 90, price: 70 },
  { name: "Soin du visage", duration: 60, price: 55 },
  { name: "Pose semi-permanent", duration: 45, price: 35 },
];
const CLIENTS = [
  ["Julie", "Martin"], ["Emma", "Laurent"], ["Chloé", "Bernard"], ["Léa", "Dubois"],
  ["Inès", "Moreau"], ["Camille", "Petit"], ["Sarah", "Roux"], ["Manon", "Fournier"],
];

const browser = await chromium.launch({ executablePath: existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "fr-FR" });
const page = await ctx.newPage();
const submit = (sel) => page.click(`form:has(${sel}) button[type="submit"]`);
const log = (m) => console.log(`• ${m}`);

// 1. Compte (création ou connexion)
await page.goto(`${BASE}/inscription`);
await page.fill("#fullName", "Camille Durand");
await page.fill("#email", DEMO.email);
await page.fill("#password", DEMO.password);
await page.click('button[type="submit"]');
const created = await page.waitForURL(/\/app\/bienvenue/, { timeout: 15000 }).then(() => true).catch(() => false);
if (created) {
  log("compte créé");
  await page.fill("#name", "Maison Alba");
  await page.selectOption("#businessType", "coiffure_barbier");
  await page.fill("#city", "Lyon");
  await page.fill("#postalCode", "69002");
  await page.fill("#addressLine", "12 rue de la République");
  await page.fill("#phone", "04 72 00 00 00");
  await submit("#businessType");
  await page.waitForURL(/\/app\/prestations/, { timeout: 20000 });
  log("établissement Maison Alba");

  await page.goto(`${BASE}/app/equipe/nouveau`);
  await page.fill("#name", "Sophie Leroy");
  await page.fill("#roleTitle", "Esthéticienne");
  await submit("#roleTitle");
  await page.waitForURL(/\/app\/equipe$/, { timeout: 20000 });
  log("praticienne Sophie Leroy");

  for (const s of SERVICES) {
    await page.goto(`${BASE}/app/prestations/nouvelle`);
    await page.fill("#name", s.name);
    await page.fill("#durationMin", String(s.duration));
    await page.fill("#price", String(s.price));
    const boxes = page.locator('input[name="practitionerIds"]');
    for (let i = 0; i < (await boxes.count()); i++) await boxes.nth(i).check();
    await submit("#durationMin");
    await page.waitForURL(/\/app\/prestations$/, { timeout: 20000 });
    log(`prestation ${s.name}`);
  }
} else {
  await page.goto(`${BASE}/connexion`);
  await page.fill("#email", DEMO.email);
  await page.fill("#password", DEMO.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/, { timeout: 20000 });
  log("compte existant, connexion");
}

// 2. Réservations clientes via la page publique (contexte séparé, non connecté)
const pub = await (await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "fr-FR" })).newPage();
for (let k = 0; k < N_BOOKINGS; k++) {
  const [first, last] = CLIENTS[k % CLIENTS.length];
  // Navigation par les URL des liens (les clics Next.js côté client ne sont pas attendus de façon fiable).
  const go = async (loc, i = 0) => {
    const href = await loc.nth(i).getAttribute("href");
    await pub.goto(new URL(href, BASE).toString(), { waitUntil: "networkidle" });
  };
  await pub.goto(`${BASE}/r/${DEMO.slug}`, { waitUntil: "networkidle" });
  await go(pub.locator("a[href*='service=']"), k % SERVICES.length);
  const pract = pub.locator("a[href*='praticien=']");
  if (await pract.count()) await go(pract, k % (await pract.count()));
  // Jour : le premier jour ouvré après demain (agenda du jour bien rempli pour la capture).
  const days = pub.locator('a[aria-disabled="false"][href*="date="]');
  const nd = await days.count();
  if (nd > 2) await go(days, 2);
  const slots = pub.locator("a[href*='heure=']");
  const n = await slots.count();
  if (!n) {
    log(`aucun créneau pour ${first}`);
    continue;
  }
  await go(slots, Math.min(Math.floor(k / 2) * 4 + (k % 2) * 2, n - 1));
  await pub.fill("#firstName", first);
  await pub.fill("#lastName", last);
  await pub.fill("#email", `${first.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.${last.toLowerCase()}@example.com`);
  await pub.fill("#phone", "06 12 34 56 78");
  await pub.click('form:has(#firstName) button[type="submit"]');
  const ok = await pub.waitForURL(/\/rdv\//, { timeout: 20000 }).then(() => true).catch(() => false);
  log(ok ? `réservation ${first} ${last} (${new URL(pub.url()).pathname.slice(0, 12)}…)` : `réservation ${first} échouée`);
}
await browser.close();
console.log(`\nConnexion démo : ${DEMO.email} / ${DEMO.password} — page publique /r/${DEMO.slug}`);
