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

// Stockage : table crm.leads de la base Supabase « harmonie-yacht », non exposée par l'API.
// On n'y accède que par les fonctions public.crm_*, qui exigent le mot de passe d'équipe (CRM_PASSWORD) :
// la clé publishable ci-dessous ne donne accès à rien d'autre.
const SUPABASE_URL = "https://szdfpjyytwedhochvzfd.supabase.co";
const SUPABASE_KEY = "sb_publishable_GKG0Qrs-e8OEHhJL94jFlw_K41YCX_F";

async function rpc(fn, args) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ p_secret: process.env.CRM_PASSWORD ?? "", ...args }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${fn} ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

export async function readLead(id) {
  return rpc("crm_get", { p_id: id });
}

export async function writeLeads(leads) {
  if (leads.length) await rpc("crm_put", { p_leads: leads });
  return leads;
}

export async function writeLead(lead) {
  await writeLeads([lead]);
  return lead;
}

export async function deleteLead(id) {
  await rpc("crm_remove", { p_id: id });
}

export async function listLeads() {
  return (await rpc("crm_list", {})) ?? [];
}
