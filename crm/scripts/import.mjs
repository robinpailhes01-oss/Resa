// Importe crm/data/leads.json dans le CRM déployé, sans créer de doublon (même nom et même adresse).
// Usage : CRM_URL=https://reso-crm.vercel.app CRM_PASSWORD=... node crm/scripts/import.mjs [fichier.json]
import { readFile } from "node:fs/promises";

const base = (process.env.CRM_URL || "").replace(/\/$/, "");
const password = process.env.CRM_PASSWORD || "";
if (!base || !password) {
  console.error("CRM_URL et CRM_PASSWORD sont obligatoires.");
  process.exit(1);
}
const file = process.argv[2] || new URL("../data/leads.json", import.meta.url);
const { leads } = JSON.parse(await readFile(file, "utf8"));

const login = await fetch(`${base}/api/session`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password }),
});
if (!login.ok) throw new Error(`Connexion refusée (${login.status})`);
const cookie = login.headers.get("set-cookie").split(";")[0];

const existing = await (await fetch(`${base}/api/leads`, { headers: { cookie } })).json();
const key = (l) => `${String(l.name).trim().toLowerCase()}|${String(l.address).trim().toLowerCase()}`;
const known = new Set(existing.leads.map(key));
const todo = leads.filter((l) => !known.has(key(l)));

if (!todo.length) {
  console.log("Rien à importer : tous les leads sont déjà dans le CRM.");
} else {
  const res = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ leads: todo }),
  });
  if (!res.ok) throw new Error(`Import refusé (${res.status}) : ${await res.text()}`);
  console.log(`${(await res.json()).leads.length} leads importés, ${leads.length - todo.length} déjà présents.`);
}
