import type { Metadata } from "next";
import { SimplePage } from "@/components/pages/SimplePage";
import { acquisitionAdmin as t } from "@/content/fr/acquisition";
import { formatPrice } from "@/lib/format";
import { acquisitionReport, type FunnelRow } from "@/server/acquisition/report";
import { requireAdmin } from "@/server/prospection/admin";

export const metadata: Metadata = { title: t.title, robots: { index: false, follow: false } };

const STEPS = ["visits", "signups", "onboarded", "published", "activated", "paid"] as const;
const STAGE_LABEL: Record<string, string> = { signup: t.steps.signups, start_trial: t.steps.onboarded, activation: t.steps.activated, subscribe: t.steps.paid };
const day = (d: Date) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).format(d);

function sourceOf(r: FunnelRow): string {
  const parts = [r.source, r.campaign, r.content].filter(Boolean);
  return parts.length ? parts.join(" · ") : t.direct;
}

/** Tunnel d'acquisition par origine : réservé aux comptes administrateurs connectés. */
export default async function AcquisitionAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin("/admin/acquisition");
  const params = await searchParams;
  const requested = Number(typeof params.jours === "string" ? params.jours : "30");
  const days = t.periods.some((p) => p.days === requested) ? requested : 30;
  const report = await acquisitionReport(days);
  const cell = "px-3 py-2 text-right tabular-nums whitespace-nowrap";

  return (
    <SimplePage title={t.title} intro={t.intro}>
      <form method="get" className="flex flex-wrap gap-2" aria-label="Période">
        {t.periods.map((p) => (
          <button
            key={p.days}
            type="submit"
            name="jours"
            value={p.days}
            aria-pressed={p.days === days}
            className={`min-h-10 rounded-full px-4 text-[14px] font-semibold ${p.days === days ? "bg-ink text-white" : "border border-ink/15 bg-card text-ink"}`}
          >
            {p.label}
          </button>
        ))}
      </form>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s} className="rounded-2xl border border-line bg-card p-4">
            <p className="text-[13px] font-semibold text-ink-muted">{t.steps[s]}</p>
            <p className="mt-1 font-display text-[32px] font-semibold leading-none tabular-nums text-ink">{report.total[s]}</p>
            <p className="mt-2 text-[12px] leading-5 text-ink-muted">{t.stepHelp[s]}</p>
          </div>
        ))}
      </section>

      <h2>{t.bySource}</h2>
      {report.rows.length === 0 ? (
        <p className="text-ink-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[720px] text-[14px]">
            <thead className="bg-page text-[12px] uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-2 text-left">{t.source}</th>
                {STEPS.map((s) => (
                  <th key={s} className="px-3 py-2 text-right">
                    {t.steps[s]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={`${r.source}|${r.campaign}|${r.content}`} className="border-t border-line">
                  <td className="px-3 py-2 text-left">{sourceOf(r)}</td>
                  {STEPS.map((s) => (
                    <td key={s} className={cell}>
                      {r[s]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-line font-semibold">
                <td className="px-3 py-2 text-left">{t.total}</td>
                {STEPS.map((s) => (
                  <td key={s} className={cell}>
                    {report.total[s]}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <h2>{t.latest}</h2>
      {report.latest.length === 0 ? (
        <p className="text-ink-muted">{t.latestEmpty}</p>
      ) : (
        <div className="divide-y divide-line">
          {report.latest.map((l) => (
            <div key={`${l.email}-${l.createdAt.toISOString()}`} className="py-3">
              <p className="font-semibold text-ink">
                {l.name}
                {l.establishment ? ` · ${l.establishment}` : ""}
              </p>
              <p className="text-[13px] text-ink-muted">
                {day(l.createdAt)} · {l.email} · {l.source ?? t.direct} · <span className="font-semibold text-ink">{STAGE_LABEL[l.stage] ?? l.stage}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <h2>{t.meta.title}</h2>
      <ul>
        <li>
          {t.meta.pixel} : {report.meta.pixel ? t.meta.on : t.meta.off}
        </li>
        <li>
          {t.meta.capi} : {report.meta.capi ? t.meta.on : t.meta.off}
          {report.meta.testMode ? ` (${t.meta.testMode})` : ""}
        </li>
        <li>
          {report.meta.sent} {t.meta.sent} · {report.meta.skipped} {t.meta.skipped} · {report.meta.errors} {t.meta.errors}
        </li>
        {report.meta.lastError ? <li className="text-[13px] text-ink-muted">{report.meta.lastError}</li> : null}
      </ul>

      <h2>{t.salonPayments.title}</h2>
      <p className="text-ink-muted">{t.salonPayments.help}</p>
      <ul>
        <li>
          {report.salonPayments.count} {t.salonPayments.count}
        </li>
        <li>
          {formatPrice(report.salonPayments.amountCents / 100)} {t.salonPayments.amount}
        </li>
        <li>
          {formatPrice(report.salonPayments.feeCents / 100)} {t.salonPayments.fee}
        </li>
      </ul>
    </SimplePage>
  );
}
