/** Récapitulatif hebdomadaire : agrégats et mise en forme (pur, testable). */

export interface WeeklyStats {
  from: Date;
  to: Date;
  newUsers: number;
  newEstablishments: number;
  bookingsOnline: number;
  bookingsManual: number;
  cancellations: number;
  feedbackCount: number;
  activeSubscriptions: number;
  trialsActive: number;
  trialsEndingSoon: number;
  trialsExpired: number;
  totalEstablishments: number;
}

const escape = (v: string) => v.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);

function dateFr(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "Europe/Paris" }).format(d);
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;

export function formatWeeklyReport(s: WeeklyStats): string {
  const lines = [
    `📊 <b>Reso · récap de la semaine</b> (${escape(dateFr(s.from))} → ${escape(dateFr(s.to))})`,
    "",
    `👤 Nouveaux comptes : <b>${s.newUsers}</b>`,
    `🏪 Nouveaux établissements : <b>${s.newEstablishments}</b> (total ${s.totalEstablishments})`,
    `📅 Rendez-vous : <b>${s.bookingsOnline + s.bookingsManual}</b> (${s.bookingsOnline} en ligne, ${s.bookingsManual} à la main) · ${plural(s.cancellations, "annulation")}`,
    `💳 Abonnements actifs : <b>${s.activeSubscriptions}</b>`,
    `⏳ Essais en cours : ${s.trialsActive} · se terminent sous 7 jours : <b>${s.trialsEndingSoon}</b> · terminés sans abonnement : ${s.trialsExpired}`,
    `💬 Retours reçus : ${s.feedbackCount}`,
  ];
  if (s.trialsEndingSoon > 0) lines.push("", `👉 ${plural(s.trialsEndingSoon, "établissement")} à recontacter avant la fin de l’essai.`);
  return lines.join("\n");
}
