import { del, get, list, put } from "@vercel/blob";

// Un fichier JSON privé par lead : leads/<id>.json (store Vercel Blob en accès privé).
const PREFIX = "leads/";
const pathFor = (id) => `${PREFIX}${id}.json`;

export const STATUSES = ["a_appeler", "sans_reponse", "a_rappeler", "interesse", "essai", "client", "refus"];
const TEXT_FIELDS = ["name", "type", "phone", "address", "city", "planity", "maps", "notes", "contact", "nextCall"];

export function validId(id) {
  return typeof id === "string" && /^[a-z0-9-]{1,80}$/.test(id);
}

function slug(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function newId(name) {
  return `${slug(name) || "lead"}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Ne garde que les champs connus, en texte court. */
export function cleanFields(input) {
  const out = {};
  for (const key of TEXT_FIELDS) {
    if (input[key] !== undefined) out[key] = String(input[key] ?? "").slice(0, key === "notes" ? 4000 : 600);
  }
  if (input.status !== undefined && STATUSES.includes(input.status)) out.status = input.status;
  if (input.priority !== undefined) out.priority = input.priority === true;
  if (out.nextCall && !/^\d{4}-\d{2}-\d{2}$/.test(out.nextCall)) out.nextCall = "";
  return out;
}

export function cleanCall(input) {
  return {
    at: new Date().toISOString(),
    outcome: String(input.outcome ?? "note").slice(0, 40),
    note: String(input.note ?? "").slice(0, 2000),
    by: String(input.by ?? "").slice(0, 60),
  };
}

async function readJson(pathname) {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text());
}

export async function readLead(id) {
  return readJson(pathFor(id));
}

export async function writeLead(lead) {
  await put(pathFor(lead.id), JSON.stringify(lead), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return lead;
}

export async function deleteLead(id) {
  await del(pathFor(id));
}

export async function listLeads() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  const leads = [];
  // Lecture par lots pour ne pas ouvrir des centaines de requêtes à la fois.
  for (let i = 0; i < blobs.length; i += 25) {
    const batch = await Promise.all(blobs.slice(i, i + 25).map((b) => readJson(b.pathname).catch(() => null)));
    leads.push(...batch.filter(Boolean));
  }
  return leads;
}
