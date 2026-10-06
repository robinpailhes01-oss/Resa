import { requireAuth } from "./_lib/auth.js";
import { cleanCall, cleanFields, deleteLead, listLeads, newId, readLead, validId, writeLead, writeLeads } from "./_lib/store.js";

function createLead(input) {
  const now = new Date().toISOString();
  const fields = cleanFields(input);
  if (!fields.name) return null;
  return {
    id: newId(fields.name),
    name: "", type: "", phone: "", address: "", city: "", planity: "", maps: "", notes: "", contact: "", nextCall: "",
    status: "a_appeler",
    ...fields,
    calls: [],
    createdAt: now,
    updatedAt: now,
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!requireAuth(req, res)) return;
  const id = typeof req.query.id === "string" ? req.query.id : "";
  try {
    if (req.method === "GET") {
      return res.status(200).json({ leads: await listLeads() });
    }

    if (req.method === "POST") {
      const body = req.body ?? {};
      // Import groupé : { leads: [...] }
      const inputs = Array.isArray(body.leads) ? body.leads.slice(0, 200) : [body];
      const created = await writeLeads(inputs.map((input) => createLead(input ?? {})).filter(Boolean));
      if (!created.length) return res.status(400).json({ error: "Le nom de l’établissement est obligatoire." });
      return res.status(201).json(Array.isArray(body.leads) ? { leads: created } : { lead: created[0] });
    }

    if (!validId(id)) return res.status(400).json({ error: "Identifiant invalide." });

    if (req.method === "PATCH") {
      const current = await readLead(id);
      if (!current) return res.status(404).json({ error: "Ce lead n’existe plus." });
      const body = req.body ?? {};
      const next = { ...current, ...cleanFields(body.patch ?? {}), updatedAt: new Date().toISOString() };
      if (body.call) next.calls = [...(Array.isArray(current.calls) ? current.calls : []), cleanCall(body.call)];
      if (next.status === "client" || next.status === "refus") next.nextCall = "";
      return res.status(200).json({ lead: await writeLead(next) });
    }

    if (req.method === "DELETE") {
      await deleteLead(id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Méthode non autorisée." });
  } catch (error) {
    console.error("[crm] leads", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Erreur du serveur, réessayez dans un instant." });
  }
}
