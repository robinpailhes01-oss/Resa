/**
 * Parcours d'un pro, de l'inscription à l'abonnement : étapes, étape où il s'arrête,
 * délais. Logique pure (testée) ; les données viennent de src/server/acquisition/journey.ts.
 */

export const JOURNEY_STEPS = [
  "google_import",
  "first_service",
  "hours_set",
  "link_copied",
  "page_visited",
  "billing_viewed",
  "checkout_started",
  "payment_failed",
  "error",
] as const;
export type JourneyStep = (typeof JOURNEY_STEPS)[number];

/** Étapes enregistrées une seule fois (la première) ; les autres peuvent se répéter. */
export const REPEATABLE_STEPS: ReadonlySet<JourneyStep> = new Set(["payment_failed", "error"]);
/** Étapes que le navigateur d'un pro connecté peut signaler. */
export const CLIENT_STEPS: ReadonlySet<JourneyStep> = new Set(["link_copied", "error"]);

export type Journey = {
  name: string;
  source: string | null;
  signupAt: Date;
  establishmentAt: Date | null;
  googleImport: string | null;
  firstServiceAt: Date | null;
  hoursAt: Date | null;
  published: boolean;
  linkCopiedAt: Date | null;
  pageVisitedAt: Date | null;
  activationAt: Date | null;
  billingViewedAt: Date | null;
  checkoutAt: Date | null;
  paidAt: Date | null;
  paymentFailures: number;
  errors: number;
  lastError: string | null;
};

type Stage = { key: string; label: string; at: (j: Journey) => Date | null; done: (j: Journey) => boolean };

/** Les étapes dans l'ordre du tunnel ; la première non franchie est l'étape où le pro s'est arrêté. */
export const STAGES: Stage[] = [
  { key: "establishment", label: "créer son établissement", at: (j) => j.establishmentAt, done: (j) => Boolean(j.establishmentAt) },
  { key: "services", label: "ajouter ses prestations", at: (j) => j.firstServiceAt, done: (j) => Boolean(j.firstServiceAt) },
  { key: "hours", label: "renseigner ses horaires", at: (j) => j.hoursAt, done: (j) => Boolean(j.hoursAt) },
  { key: "share", label: "partager son lien", at: (j) => j.pageVisitedAt ?? j.linkCopiedAt, done: (j) => Boolean(j.linkCopiedAt || j.pageVisitedAt) },
  { key: "activation", label: "recevoir sa 1re réservation", at: (j) => j.activationAt, done: (j) => Boolean(j.activationAt) },
  { key: "paid", label: "payer l'abonnement", at: (j) => j.paidAt, done: (j) => Boolean(j.paidAt) },
];

/** Prénom et initiale seulement (pas de nom complet ni d'email dans les rapports). */
export function shortName(fullName: string): string {
  const [first, ...rest] = fullName.trim().split(/\s+/);
  const initial = rest.length ? ` ${rest[rest.length - 1][0]?.toUpperCase()}.` : "";
  return `${first ?? "?"}${initial}`;
}

export function stoppedAt(j: Journey): Stage | null {
  return STAGES.find((s) => !s.done(j)) ?? null;
}

/** Dernière étape franchie (pour savoir depuis quand le pro est bloqué). */
export function lastProgressAt(j: Journey): Date {
  return STAGES.reduce<Date>((latest, s) => {
    const at = s.at(j);
    return at && at > latest ? at : latest;
  }, j.signupAt);
}

export function formatDuration(ms: number): string {
  const min = Math.max(0, Math.round(ms / 60_000));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h} h`;
  return `${Math.round(h / 24)} j`;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Délais médians entre étapes et nombre de pros bloqués depuis plus de 48 h, par étape. */
export function journeyStats(journeys: Journey[], now: Date) {
  const gaps: Array<{ label: string; from: (j: Journey) => Date | null; to: (j: Journey) => Date | null }> = [
    { label: "inscription → établissement", from: (j) => j.signupAt, to: (j) => j.establishmentAt },
    { label: "établissement → prestations", from: (j) => j.establishmentAt, to: (j) => j.firstServiceAt },
    { label: "établissement → horaires", from: (j) => j.establishmentAt, to: (j) => j.hoursAt },
    { label: "page prête → 1re réservation", from: (j) => maxDate(j.firstServiceAt, j.hoursAt), to: (j) => j.activationAt },
    { label: "inscription → abonnement", from: (j) => j.signupAt, to: (j) => j.paidAt },
  ];
  const delays = gaps.map((g) => {
    const values = journeys.flatMap((j) => {
      const a = g.from(j);
      const b = g.to(j);
      return a && b && b >= a ? [b.getTime() - a.getTime()] : [];
    });
    return { label: g.label, count: values.length, median: median(values) };
  });
  const blocked = STAGES.map((s) => ({
    label: s.label,
    count: journeys.filter((j) => stoppedAt(j)?.key === s.key && now.getTime() - lastProgressAt(j).getTime() > 48 * 3600_000).length,
  })).filter((b) => b.count > 0);
  return { delays, blocked };
}

function maxDate(a: Date | null, b: Date | null): Date | null {
  if (!a || !b) return null;
  return a > b ? a : b;
}

/** Deux lignes par pro pour le rapport Telegram (texte brut, à échapper par l'appelant). */
export function describeJourney(j: Journey, now: Date): { head: string; steps: string } {
  const mark = (ok: boolean, label: string, at?: Date | null, from?: Date | null) =>
    `${ok ? "✓" : "✗"} ${label}${ok && at && from ? ` (${formatDuration(at.getTime() - from.getTime())})` : ""}`;
  const parts = [
    mark(Boolean(j.establishmentAt), "établissement", j.establishmentAt, j.signupAt),
    j.establishmentAt ? (j.googleImport ? `Google : ${j.googleImport}` : "") : "",
    mark(Boolean(j.firstServiceAt), "prestations", j.firstServiceAt, j.establishmentAt),
    mark(Boolean(j.hoursAt), "horaires", j.hoursAt, j.establishmentAt),
    mark(Boolean(j.linkCopiedAt || j.pageVisitedAt), j.pageVisitedAt ? "page visitée" : "lien copié"),
    mark(Boolean(j.activationAt), "1re résa"),
    j.billingViewedAt && !j.paidAt ? "a vu l'abonnement" : "",
    j.checkoutAt && !j.paidAt ? "paiement commencé" : "",
    j.paymentFailures ? `${j.paymentFailures} paiement(s) échoué(s)` : "",
    mark(Boolean(j.paidAt), "payé"),
  ].filter(Boolean);
  const stop = stoppedAt(j);
  const since = formatDuration(now.getTime() - lastProgressAt(j).getTime());
  const status = stop ? `arrêté à : ${stop.label} (depuis ${since})` : "abonné ✅";
  const errors = j.errors ? ` · ⚠️ ${j.errors} erreur(s)${j.lastError ? ` : ${j.lastError}` : ""}` : "";
  return { head: `${j.name} · ${j.source ?? "direct"} · ${status}`, steps: parts.join(" · ") + errors };
}
