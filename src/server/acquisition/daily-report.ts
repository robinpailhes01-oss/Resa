import "server-only";
import { escapeHtml } from "@/server/telegram";
import { avatarMix, describeJourney, formatDuration, journeyStats, type Journey } from "@/lib/journey";
import { loadJourneys } from "./journey";
import { acquisitionReport, type AcquisitionReport, type FunnelRow } from "./report";

/**
 * Rapport d'acquisition quotidien (Telegram) : le tunnel sur 24 h et sur 7 jours,
 * le détail par pub, et l'état de l'envoi à Meta. Source des rapports de test
 * (skill reso-rapport-test) tant que la page /admin/acquisition n'est pas utilisée.
 */

const line = (r: FunnelRow) =>
  `Visites ${r.visits} · Inscriptions ${r.signups} · Établissements ${r.onboarded} · Pages publiées ${r.published} · 1res réservations ${r.activated} · <b>Abonnés payants ${r.paid}</b>`;

const MAX_JOURNEYS = 12;

/** Parcours individuels (7 j) et délais entre étapes (30 j). */
export function formatJourneys(recent: Journey[], month: Journey[], now: Date): string[] {
  if (recent.length === 0 && month.length === 0) return [];
  const out: string[] = [];
  if (recent.length) {
    out.push("", `<b>Qui s'inscrit (7 j)</b> : ${escapeHtml(avatarMix(recent))}`);
    out.push("", `<b>Parcours des inscrits (7 j)</b>${recent.length > MAX_JOURNEYS ? ` · ${MAX_JOURNEYS} plus récents sur ${recent.length}` : ""}`);
    for (const j of recent.slice(0, MAX_JOURNEYS)) {
      const { head, steps } = describeJourney(j, now);
      out.push(`👤 ${escapeHtml(head)}`, `   ${escapeHtml(steps)}`);
    }
  }
  const { delays, blocked } = journeyStats(month, now);
  const measured = delays.filter((d) => d.count > 0 && d.median !== null);
  if (measured.length) {
    out.push("", "<b>Délais médians (30 j)</b>");
    for (const d of measured) out.push(`• ${d.label} : ${formatDuration(d.median as number)} (${d.count} pro${d.count > 1 ? "s" : ""})`);
  }
  if (blocked.length) {
    out.push("", "<b>Bloqués depuis plus de 48 h (30 j)</b>");
    for (const b of blocked) out.push(`• ${escapeHtml(b.label)} : ${b.count}`);
  }
  return out;
}

export function formatAcquisitionReport(day: AcquisitionReport, week: AcquisitionReport, journeys: string[] = []): string {
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
    // En dernier : la partie la plus longue (Telegram coupe au-delà de 4 000 caractères).
    ...journeys,
  ].join("\n");
}

export async function buildAcquisitionReport(now = new Date()): Promise<string> {
  const [day, week, month] = await Promise.all([acquisitionReport(1, now), acquisitionReport(7, now), loadJourneys(30, 200, now)]);
  const recent = month.filter((j) => now.getTime() - j.signupAt.getTime() <= 7 * 24 * 3600_000);
  return formatAcquisitionReport(day, week, formatJourneys(recent, month, now));
}
