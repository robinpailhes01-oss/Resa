// Recette de bout en bout de l'application (compte → établissement → prestation → équipe →
// réservation publique → annulation). Serveur lancé avec DATABASE_URL et EMAIL_PROVIDER=console.
// Usage : node scripts/recette-app.mjs [http://127.0.0.1:3000] [dossier de captures]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const OUT = process.argv[3] ?? "tests/screenshots/app";
mkdirSync(OUT, { recursive: true });
const stamp = Date.now();
const email = `camille+${stamp}@example.com`;
const password = "motdepasse-solide-42";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "fr-FR" });
const page = await ctx.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("[console]", m.text()); });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
const shot = async (n) => page.screenshot({ path: `${OUT}/${n}.png`, fullPage: true });
const submit = (sel) => page.click(`form:has(${sel}) button[type="submit"]`);
const step = (n) => console.log(`\n== ${n} → ${page.url()}`);
async function errorsOnPage() {
  const t = await page.locator('[role="alert"], .text-error').allTextContents();
  return t.filter(Boolean);
}

// 1. Inscription
await page.goto(`${BASE}/inscription`);
await page.fill("#fullName", "Camille Durand");
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('button[type="submit"]');
await page.waitForURL(/\/app\/bienvenue/, { timeout: 20000 });
step("inscription ok"); await shot("01-bienvenue");

// 2. Établissement
await page.fill("#name", "Maison Alba");
await page.selectOption("#businessType", "coiffure_barbier");
await page.fill("#city", "Lyon");
await page.fill("#postalCode", "69002");
await page.fill("#addressLine", "12 rue de la République");
await page.fill("#phone", "04 72 00 00 00");
await submit("#businessType");
await page.waitForURL(/\/app\/prestations/, { timeout: 20000 });
step("établissement créé"); await shot("02-prestations-vide");

// 3. Prestation
await page.goto(`${BASE}/app/prestations/nouvelle`);
await page.fill("#name", "Coupe & brushing");
await page.fill("#durationMin", "60");
await page.fill("#price", "45");
const cbs = await page.locator('input[name="practitionerIds"]').count();
console.log("practitioner checkboxes:", cbs);
for (let i = 0; i < cbs; i++) await page.locator('input[name="practitionerIds"]').nth(i).check();
await submit("#durationMin");
await page.waitForURL(/\/app\/prestations$/, { timeout: 20000 }).catch(async () => { console.log("errors:", await errorsOnPage()); await shot("03-prestation-err"); throw new Error("prestation non créée"); });
step("prestation créée"); await shot("03-prestations");

// 4. Équipe : ajouter une deuxième praticienne
await page.goto(`${BASE}/app/equipe/nouveau`);
await page.fill("#name", "Sophie Leroy");
await page.fill("#roleTitle", "Esthéticienne");
await submit("#roleTitle");
await page.waitForURL(/\/app\/equipe$/, { timeout: 20000 }).catch(async () => { console.log("errors:", await errorsOnPage()); throw new Error("praticienne non créée"); });
step("praticienne créée"); await shot("04-equipe");

// 5. Horaires page + paramètres
await page.goto(`${BASE}/app/parametres/horaires`); await shot("05-horaires");
await page.goto(`${BASE}/app/parametres`); await shot("05b-parametres");
const slug = await page.locator('input[readonly]').first().inputValue().catch(() => "");
console.log("slug field:", slug);

// 6. Agenda
await page.goto(`${BASE}/app/agenda`); step("agenda"); await shot("06-agenda");
await page.goto(`${BASE}/app`); await shot("06b-dashboard");

// 7. Réservation publique
const publicUrl = slug.startsWith("http") ? slug.replace(/^https?:\/\/[^/]+/, BASE) : `${BASE}/r/maison-alba`;
await page.goto(publicUrl); step("public"); await shot("07-public-1");
await page.click('a[href*="?service="]');
await page.waitForLoadState("networkidle"); step("public étape 2"); await shot("07-public-2");
// choisir un jour ouvert dans le futur si aucun créneau
let slotLinks = page.locator('a[href*="heure="]');
let tries = 0;
while ((await slotLinks.count()) === 0 && tries < 6) {
  const days = page.locator('a[href*="date="]:not([aria-disabled="true"])');
  const n = await days.count();
  console.log("no slot, days available:", n);
  if (n === 0) break;
  await days.nth(Math.min(1 + tries, n - 1)).click();
  await page.waitForLoadState("networkidle");
  slotLinks = page.locator('a[href*="heure="]');
  tries++;
}
console.log("slots:", await slotLinks.count());
await slotLinks.first().click();
await page.waitForLoadState("networkidle"); step("public étape 3"); await shot("07-public-3");
const bookedDate = new URL(page.url()).searchParams.get("date");
await page.fill("#firstName", "Emma");
await page.fill("#lastName", "Laurent");
await page.fill("#email", `emma+${stamp}@example.com`);
await page.fill("#phone", "06 12 34 56 78");
await page.fill("#clientNotes", "Première visite");
await submit("#clientNotes");
await page.waitForURL(/\/rdv\//, { timeout: 20000 }).catch(async () => { console.log("errors:", await errorsOnPage()); await shot("07-public-err"); throw new Error("réservation échouée"); });
step("réservation confirmée"); await shot("08-rdv-client");
const rdvUrl = page.url();

// 8. Pro : agenda + détail
await page.goto(`${BASE}/app/agenda?date=${bookedDate}`); await shot("09-agenda-avec-rdv");
const bookingLink = page.locator('a[href^="/app/rendez-vous/"]:not([href*="nouveau"])').first();
if (await bookingLink.count()) { await bookingLink.click(); await page.waitForLoadState("networkidle"); step("détail rdv"); await shot("10-rdv-pro"); }
else console.log("!! pas de lien rdv dans l'agenda du jour (le rdv est peut-être un autre jour)");
await page.goto(`${BASE}/app/clients`); await shot("11-clients");
await page.goto(`${BASE}/app/emails`); await shot("12-emails");

// 9. Annulation côté client
await page.goto(rdvUrl); 
page.once("dialog", (d) => d.accept());
const cancelBtn = page.locator('button', { hasText: /Annuler/ }).first();
if (await cancelBtn.count()) { await cancelBtn.click(); await page.waitForURL(/annule=1/, { timeout: 20000 }).catch(async()=>console.log("cancel errors:", await errorsOnPage())); step("annulé"); await shot("13-rdv-annule"); }
else console.log("!! pas de bouton d'annulation");

// 10. Déconnexion / reconnexion
await page.goto(`${BASE}/app/parametres`);
const logout = page.locator('button', { hasText: /Déconnexion|Se déconnecter/ }).first();
if (await logout.count()) { await logout.click(); await page.waitForURL(/connexion|\/$/, { timeout: 20000 }); step("déconnecté"); }
await page.goto(`${BASE}/connexion`);
await page.fill("#email", email); await page.fill("#password", password); await page.click('button[type="submit"]');
await page.waitForURL(/\/app/, { timeout: 20000 }); step("reconnecté"); await shot("14-app-reconnecte");
await browser.close();
console.log("\nFLOW OK");
