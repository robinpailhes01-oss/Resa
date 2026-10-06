import "server-only";
import { escapeHtml } from "@/server/telegram";
import { acquisitionReport, type AcquisitionReport, type FunnelRow } from "./report";

/**
 * Rapport d'acquisition quotidien (Telegram) : le tunnel sur 24 h et sur 7 jours,
 * le détail par pub, et l'état de l'envoi à Meta. Source des rapports de test
 * (skill reso-rapport-test) tant que la page /admin/acquisition n'est pas utilisée.
 */

const line = (r: FunnelRow) =>
  `Visites ${r.visits} · Inscriptions ${r.signups} · Établissements ${r.onboarded} · Pages publiées ${r.published} · 1res réservations ${r.activated} · <b>Abonnés payants ${r.paid}</b>`;

export function formatAcquisitionReport(day: AcquisitionReport, week: AcquisitionReport): string {
  const sources = week.rows
    .filter((r) => r.source || r.campaign || r.content)
    .slice(0, 8)
    .map((r) => `• ${escapeHtml([r.source, r.campaign, r.content].filter(Boolean).join(" · "))} : ${r.visits} visites, ${r.signups} inscr., ${r.onboarded} étab., ${r.activated} activ., ${r.paid} payants`);
  const m = week.meta;
  const meta = !m.capi
    ? "non configuré"
    : `${m.sent} envoyés · ${m.skipped} sans accord cookies · ${m.errors} erreurs${m.testMode ? " · mode test actif" : ""}`;
  return [
    "📊 <b>Acquisition RESO</b>",
    "",
    "<b>Dernières 24 h</b>",
    line(day.total),
    "",
    "<b>7 derniers jours</b>",
    line(week.total),
    ...(sources.length ? ["", "<b>Par pub (7 j)</b>", ...sources] : []),
    "",
    `Envoi à Meta (7 j) : ${meta}`,
    ...(m.lastError ? [`Dernière erreur : ${escapeHtml(m.lastError.slice(0, 200))}`] : []),
    ...(week.salonPayments.count ? [`Paiements des clientes aux salons (usage, pas des abonnements) : ${week.salonPayments.count}`] : []),
  ].join("\n");
}

export async function buildAcquisitionReport(now = new Date()): Promise<string> {
  const [day, week] = await Promise.all([acquisitionReport(1, now), acquisitionReport(7, now)]);
  return formatAcquisitionReport(day, week);
}
