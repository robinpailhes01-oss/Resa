// Parcours complet d'un établissement, en mode live : landing → inscription → vérification
// d'email → onboarding → catalogue → agenda → réservation cliente → mot de passe oublié → reconnexion.
// Usage : serveur lancé avec RESO_LAUNCH_MODE=live, DATABASE_URL, EMAIL_PROVIDER=console, RESO_SITE_URL ;
//         node scripts/recette-parcours.mjs [http://127.0.0.1:3000] [journal serveur] [dossier de captures]
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const LOG = process.argv[3] ?? "";
const OUT = process.argv[4] ?? "tests/screenshots/parcours";
mkdirSync(OUT, { recursive: true });
const stamp = Date.now();
const email = `institut+${stamp}@example.com`;
const password = "mon-institut-2026";
const results = [];
const ok = (name, cond, detail = "") => results.push(`${cond ? "OK " : "KO "} ${name}${detail ? ` — ${detail}` : ""}`);
const linkFromLog = (pattern) => {
  if (!LOG) return null;
  const matches = readFileSync(LOG, "utf8").match(pattern);
  return matches ? matches[matches.length - 1] : null;
};

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
process.on("uncaughtException", (error) => {
  console.log(results.join("\n"));
  console.error("Interrompu :", error.message);
  process.exit(1);
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "fr-FR" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let n = 0;
const shot = async (name) => page.screenshot({ path: `${OUT}/${String(++n).padStart(2, "0")}-${name}.png`, fullPage: false });
const submit = (sel) => page.click(`form:has(${sel}) button[type="submit"]`);

// 1. Landing en mode live
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const heroCta = await page.locator('#hero a.btn').first();
ok("landing live : CTA « Créer mon compte » vers /inscription", (await heroCta.textContent())?.includes("Créer mon compte") && (await heroCta.getAttribute("href")) === "/inscription");
ok("landing live : lien Connexion dans la navigation", (await page.locator('nav[aria-label="Navigation principale"] a[href="/connexion"]').count()) === 1);
await shot("landing-live");

// 2. Inscription
await heroCta.click();
await page.waitForURL(/\/inscription/);
await shot("inscription");
await page.fill("#fullName", "Camille Durand");
await page.fill("#email", email);
await page.fill("#password", password);
await submit("#password");
await page.waitForURL(/\/app\/bienvenue/, { timeout: 20000 });
ok("inscription : compte créé et session ouverte", true);
await shot("bienvenue");

// 3. Vérification de l'email (lien du journal serveur)
const verifyLink = linkFromLog(/http:\/\/[^\s]+\/verifier-email\?token=[A-Za-z0-9_-]+/g);
if (verifyLink) {
  const p2 = await ctx.newPage();
  await p2.goto(verifyLink.replace(/^http:\/\/[^/]+/, BASE), { waitUntil: "networkidle" });
  const text = await p2.locator("main").innerText();
  ok("email de vérification : lien valide", /confirm|vérifi/i.test(text), text.split("\n")[0]);
  await p2.screenshot({ path: `${OUT}/${String(++n).padStart(2, "0")}-email-verifie.png` });
  await p2.close();
} else ok("email de vérification : lien trouvé dans le journal", false);

// 4. Création de l'établissement
await page.fill("#name", "Institut Lumière");
await page.selectOption("#businessType", "institut");
await page.fill("#city", "Bordeaux");
await page.fill("#postalCode", "33000");
await page.fill("#addressLine", "8 cours de l’Intendance");
await page.fill("#phone", "05 56 00 00 00");
await submit("#businessType");
await page.waitForURL(/\/app\/prestations/, { timeout: 20000 });
ok("établissement créé, checklist d'onboarding", true);
await shot("prestations-onboarding");

// 5. Prestations
for (const [name, dur, price] of [["Soin du visage", "60", "60"], ["Épilation sourcils", "20", "15"]]) {
  await page.goto(`${BASE}/app/prestations/nouvelle`);
  await page.fill("#name", name);
  await page.fill("#durationMin", dur);
  await page.fill("#price", price);
  await submit("#durationMin");
  await page.waitForURL(/\/app\/prestations$/, { timeout: 20000 });
}
ok("deux prestations ajoutées", (await page.locator("main").innerText()).includes("Soin du visage"));
await shot("prestations");

// 6. Équipe et horaires
await page.goto(`${BASE}/app/equipe/nouveau`);
await page.fill("#name", "Inès Martin");
await page.fill("#roleTitle", "Esthéticienne");
await submit("#roleTitle");
await page.waitForURL(/\/app\/equipe$/, { timeout: 20000 });
ok("deuxième praticienne ajoutée", (await page.locator("main").innerText()).includes("Inès Martin"));
await shot("equipe");
await page.goto(`${BASE}/app/parametres/horaires`);
await page.uncheck('input[name="open-1"]'); // fermé le lundi
await submit('input[name="open-1"]');
await page.waitForSelector("text=Horaires enregistrés", { timeout: 15000 }).catch(() => {});
ok("horaires modifiés (lundi fermé)", (await page.locator('input[name="open-1"]').isChecked()) === false);
await shot("horaires");

// 7. Paramètres : lien public et conditions
await page.goto(`${BASE}/app/parametres`);
const publicLink = await page.locator("input[readonly]").first().inputValue();
ok("lien de réservation affiché", /\/r\/institut-lumiere/.test(publicLink), publicLink);
await page.fill("#bookingTerms", "Merci d’arriver 5 minutes avant votre rendez-vous.");
await page.click('form:has(#bookingTerms) button[type="submit"]');
await page.waitForSelector("text=Paramètres enregistrés", { timeout: 15000 });
ok("conditions de réservation enregistrées", true);
await shot("parametres");

// 8. Agenda et rendez-vous manuel
await page.goto(`${BASE}/app/agenda`);
await shot("agenda-vide");

// 9. Réservation côté cliente (navigateur séparé, non connecté)
const client = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: "fr-FR" });
const cp = await client.newPage();
const slug = publicLink.replace(/^https?:\/\/[^/]+/, "");
await cp.goto(`${BASE}${slug}`, { waitUntil: "networkidle" });
await cp.screenshot({ path: `${OUT}/${String(++n).padStart(2, "0")}-cliente-prestations.png` });
await cp.click('a[href*="?service="]');
await cp.waitForLoadState("networkidle");
await cp.click('a[href*="praticien="]');
await cp.waitForLoadState("networkidle");
let tries = 0;
while ((await cp.locator('a[href*="heure="]').count()) === 0 && tries < 8) {
  const next = cp.locator('a[aria-label="Semaine suivante"]');
  const days = cp.locator('a[href*="date="]:not([aria-disabled="true"]):not([aria-label])');
  if ((await days.count()) > 0) await days.nth(Math.min(tries, (await days.count()) - 1)).click();
  else await next.click();
  await cp.waitForLoadState("networkidle");
  tries++;
}
await cp.screenshot({ path: `${OUT}/${String(++n).padStart(2, "0")}-cliente-creneaux.png` });
await cp.click('a[href*="heure="]');
await cp.waitForLoadState("networkidle");
await cp.fill("#firstName", "Emma");
await cp.fill("#lastName", "Laurent");
await cp.fill("#email", `emma+${stamp}@example.com`);
await cp.fill("#phone", "06 12 34 56 78");
ok("cliente : conditions de l'établissement affichées avant confirmation", (await cp.locator("text=Merci d’arriver 5 minutes avant").count()) > 0);
await cp.screenshot({ path: `${OUT}/${String(++n).padStart(2, "0")}-cliente-coordonnees.png`, fullPage: true });
await cp.click('form:has(#clientNotes) button[type="submit"]');
await cp.waitForURL(/\/rdv\//, { timeout: 20000 });
ok("cliente : rendez-vous confirmé, page de gestion", true);
await cp.screenshot({ path: `${OUT}/${String(++n).padStart(2, "0")}-cliente-confirmation.png`, fullPage: true });
const rdvUrl = cp.url();
await client.close();

// 10. Emails partis (journal)
if (LOG) {
  const log = readFileSync(LOG, "utf8");
  ok("email de confirmation envoyé à la cliente", log.includes(`À : emma+${stamp}@example.com`) && log.includes("est confirmé"));
  ok("notification « Nouveau rendez-vous » envoyée à l'établissement", log.includes("Nouveau rendez-vous : Emma Laurent"));
}

// 11. Côté pro : tableau de bord, fiche du rendez-vous
await page.goto(`${BASE}/app`);
await page.waitForLoadState("networkidle");
ok("tableau de bord : bandeau de lancement (paiement non activé)", (await page.locator("text=Période de lancement").count()) > 0);
await shot("tableau-de-bord");
const bookedDate = new URL(rdvUrl).searchParams.get("date") ?? null;
await page.goto(`${BASE}/app/agenda${bookedDate ? `?date=${bookedDate}` : ""}`);
const link = page.locator('a[href^="/app/rendez-vous/"]:not([href*="nouveau"])').first();
if ((await link.count()) === 0) {
  // Le rendez-vous est un autre jour : on passe par la fiche cliente.
  await page.goto(`${BASE}/app/clients`);
  await page.locator('a[href^="/app/clients/"]').first().click();
  await page.waitForLoadState("networkidle");
  await page.locator('a[href^="/app/rendez-vous/"]').first().click();
} else await link.click();
await page.waitForURL(/\/app\/rendez-vous\//);
ok("pro : fiche du rendez-vous d'Emma", (await page.locator("main").innerText()).includes("Emma Laurent"));
await shot("rendez-vous-pro");

// 12. Déconnexion, mot de passe oublié, réinitialisation, reconnexion
await page.click('form button:has-text("Se déconnecter")');
await page.waitForURL(/\/connexion/);
await page.goto(`${BASE}/mot-de-passe-oublie`);
await page.fill("#email", email);
await submit("#email");
await page.waitForTimeout(1500);
await shot("mot-de-passe-oublie");
const resetLink = linkFromLog(/http:\/\/[^\s]+\/reinitialiser\?token=[A-Za-z0-9_-]+/g);
ok("email de réinitialisation : lien trouvé", Boolean(resetLink));
if (resetLink) {
  await page.goto(resetLink.replace(/^http:\/\/[^/]+/, BASE));
  await page.fill("#password", "nouveau-mdp-2026");
  await submit("#password");
  await page.waitForURL(/\/app/, { timeout: 20000 }).catch(() => {});
  ok("réinitialisation : nouveau mot de passe accepté et session ouverte", /\/app/.test(page.url()));
  await shot("mot-de-passe-reinitialise");
  await page.click('form button:has-text("Se déconnecter")');
  await page.waitForURL(/\/connexion/);
  await page.goto(`${BASE}/connexion`);
  await page.fill("#email", email);
  await page.fill("#password", "nouveau-mdp-2026");
  await submit("#password");
  await page.waitForURL(/\/app$/, { timeout: 20000 });
  ok("reconnexion avec le nouveau mot de passe", true);
  await shot("reconnecte");
}
ok("aucune erreur JavaScript sur le parcours", errors.length === 0, errors.join(" | "));

await browser.close();
console.log(results.join("\n"));
if (results.some((r) => r.startsWith("KO"))) process.exitCode = 1;
