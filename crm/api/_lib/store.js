import { del, get, list, put } from "@vercel/blob";

// Un fichier JSON privé par lead : leads/<id>.json (store Vercel Blob en accès privé).
const PREFIX = "leads/";

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
  if (input.noLink !== undefined) out.noLink = input.noLink === true;
  if (input.lulu !== undefined) out.lulu = input.lulu === true;
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

// Chaque écriture crée une nouvelle version (leads/<id>/v-<horodatage>-<suffixe>.json) au lieu de réécrire
// le même fichier : un blob privé réécrit puis relu sans cache répond 403, ce qui faisait disparaître le lead.
// Les anciens fichiers leads/<id>.json restent lisibles et sont remplacés à la première modification.
const isLegacy = (pathname) => !pathname.slice(PREFIX.length).includes("/");
const idOf = (pathname) => pathname.slice(PREFIX.length).replace(/\/.*$/, "").replace(/\.json$/, "");

async function readText(pathname, options) {
  const result = await get(pathname, { access: "private", ...options });
  if (!result || result.statusCode !== 200) return null;
  return new Response(result.stream).text();
}

async function readBlob(blob) {
  let text = null;
  if (isLegacy(blob.pathname)) {
    text = await readText(blob.pathname, { useCache: false }).catch(() => null);
    if (text === null) text = await readText(blob.pathname).catch(() => null);
  } else {
    text = await readText(blob.pathname).catch(() => null);
  }
  return text === null ? null : JSON.parse(text);
}

async function listBlobs(prefix) {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

const newer = (a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt) || (isLegacy(b.pathname) ? 1 : -1);

/** Dernière version de chaque lead, regroupée par identifiant. */
function latestById(blobs) {
  const latest = new Map();
  for (const blob of blobs) {
    const id = idOf(blob.pathname);
    const current = latest.get(id);
    if (!current || newer(blob, current) > 0) latest.set(id, blob);
  }
  return latest;
}

const blobsOf = async (id) => (await listBlobs(`${PREFIX}${id}`)).filter((b) => idOf(b.pathname) === id);

export async function readLead(id) {
  const latest = latestById(await blobsOf(id)).get(id);
  return latest ? readBlob(latest) : null;
}

export async function writeLead(lead) {
  const saved = await put(`${PREFIX}${lead.id}/v-${Date.now()}.json`, JSON.stringify(lead), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: true,
  });
  // Les versions antérieures à celle-ci ne servent plus (une écriture concurrente plus récente est gardée).
  const blobs = await blobsOf(lead.id);
  const mine = blobs.find((b) => b.pathname === saved.pathname);
  const old = mine ? blobs.filter((b) => b !== mine && newer(mine, b) > 0) : [];
  if (old.length) await del(old.map((b) => b.url));
  return lead;
}

export async function deleteLead(id) {
  const blobs = await blobsOf(id);
  if (blobs.length) await del(blobs.map((b) => b.url));
}

export async function listLeads() {
  const latest = [...latestById(await listBlobs(PREFIX)).values()];
  const leads = [];
  // Lecture par lots pour ne pas ouvrir des centaines de requêtes à la fois.
  for (let i = 0; i < latest.length; i += 25) {
    const batch = await Promise.all(latest.slice(i, i + 25).map((b) => readBlob(b).catch(() => null)));
    leads.push(...batch.filter(Boolean));
  }
  return leads;
}
