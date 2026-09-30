import type { Metadata } from "next";
import { BadgeCheck, CircleAlert, Clock3, ExternalLink, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { PaymentRuleForm } from "@/components/app/PaymentRuleForm";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { paymentsPage as t } from "@/content/fr/app";
import { formatDateTimeFr, formatPriceCents } from "@/lib/time";
import { cn } from "@/lib/cn";
import { requireEstablishment } from "@/server/auth/guards";
import { getMollieConnection, listRecentBookingPayments, paymentRuleOf } from "@/server/app/booking-payments";
import { disconnectMollieAction, refreshMollieAction, startMollieConnectAction, updatePaymentRuleAction } from "@/server/app/actions/payments";
import { isMollieConnectConfigured } from "@/server/mollie-connect";

export const metadata: Metadata = { title: "Paiements" };

type Query = Record<string, string | string[] | undefined>;

const noticeTone = (key: string) => (["ok", "actualise", "deconnecte"].includes(key) ? "success" : key === "refusee" ? "pending" : "error");

export default async function PaiementsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const { user, establishment: e } = await requireEstablishment();
  const query = await searchParams;
  const notice = typeof query.connexion === "string" ? query.connexion : "";
  const configured = isMollieConnectConfigured();
  const [connection, history] = configured ? await Promise.all([getMollieConnection(e.id), listRecentBookingPayments(e.id)]) : [null, []];
  const isOwner = e.ownerUserId === user.id;
  const tz = e.timezone;

  const state = !connection
    ? null
    : connection.canReceivePayments && connection.profileId
      ? { label: t.account.ready, tone: "ready" as const, icon: BadgeCheck, text: null }
      : !connection.profileId
        ? { label: t.account.notReady, tone: "todo" as const, icon: CircleAlert, text: t.account.noProfileText }
        : connection.onboardingStatus === "in-review"
          ? { label: t.account.inReview, tone: "wait" as const, icon: Clock3, text: t.account.inReviewText }
          : { label: t.account.needsData, tone: "todo" as const, icon: CircleAlert, text: t.account.needsDataText };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} intro={t.intro} />

      {notice && t.notices[notice] ? (
        <div aria-live="polite" className="mb-6">
          <StatusMessage tone={noticeTone(notice)}>{t.notices[notice]}</StatusMessage>
        </div>
      ) : null}

      {!configured ? (
        <Card>
          <h2 className="text-[20px]">{t.unavailable.title}</h2>
          <p className="mt-2 text-[15px] leading-6 text-ink-muted">{t.unavailable.text}</p>
        </Card>
      ) : !connection ? (
        <section className="powder-panel grain relative overflow-hidden rounded-[24px] px-6 py-8 text-page md:px-10 md:py-11">
          <p className="eyebrow !text-page/75">{t.connect.eyebrow}</p>
          <h2 className="mt-3 max-w-lg font-display text-[30px] leading-[1.1] tracking-[-0.03em] text-page md:text-[40px]">{t.connect.title}</h2>
          <p className="mt-4 max-w-xl text-[15px] leading-6 text-page/85">{t.connect.text}</p>
          <ul className="mt-6 grid max-w-xl gap-2.5">
            {t.connect.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-[14px] leading-6 text-page/90">
                <ShieldCheck aria-hidden="true" className="mt-1 size-4 shrink-0 text-page/80" />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {isOwner ? (
              <form action={startMollieConnectAction}>
                <button type="submit" className="btn inline-flex min-h-12 items-center gap-2 rounded-button bg-page px-6 text-[15px] font-semibold text-ink shadow-[0_8px_24px_-12px_rgba(20,28,38,0.5)] hover:bg-card">
                  <Wallet aria-hidden="true" className="size-[18px]" />
                  {t.connect.button}
                </button>
              </form>
            ) : (
              <p className="text-[14px] text-page/85">{t.connect.ownerOnly}</p>
            )}
          </div>
        </section>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="eyebrow">{t.account.title}</p>
                <p className="mt-2 truncate font-display text-[24px] tracking-[-0.02em] text-ink">{connection.organizationName ?? "Mollie"}</p>
                {state ? (
                  <span
                    className={cn(
                      "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold",
                      state.tone === "ready" ? "bg-success-tint text-success" : state.tone === "wait" ? "bg-soft-tint text-brand" : "bg-accent-tint text-lilac-ink",
                    )}
                  >
                    <state.icon aria-hidden="true" className="size-4" />
                    {state.label}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {connection.dashboardUrl ? (
                  <a href={connection.dashboardUrl} target="_blank" rel="noopener" className="btn inline-flex min-h-10 items-center gap-2 rounded-button border border-ink/10 bg-card px-4 text-[14px] font-semibold text-ink shadow-card hover:border-ink/20">
                    {t.account.dashboard} <ExternalLink aria-hidden="true" className="size-4" />
                  </a>
                ) : null}
                <form action={refreshMollieAction}>
                  <button type="submit" className="btn inline-flex min-h-10 items-center gap-2 rounded-button px-4 text-[14px] font-semibold text-ink hover:bg-ink/5">
                    <RefreshCw aria-hidden="true" className="size-4" /> {t.account.refresh}
                  </button>
                </form>
              </div>
            </div>
            {state?.text ? <p className="mt-4 rounded-xl bg-page px-4 py-3 text-[14px] leading-6 text-ink-muted">{state.text}</p> : null}
            {connection.testmode ? <p className="mt-4 rounded-xl bg-soft-tint px-4 py-3 text-[13px] font-medium text-brand">{t.account.testmode}</p> : null}
            <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-line pt-5 text-[14px] sm:grid-cols-3">
              <div>
                <dt className="text-ink-muted">{t.account.profile}</dt>
                <dd className="mt-0.5 font-medium text-ink">{connection.profileName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">{t.account.connectedOn}</dt>
                <dd className="mt-0.5 font-medium text-ink">{formatDateTimeFr(connection.connectedAt, tz)}</dd>
              </div>
              {isOwner ? (
                <div className="sm:text-right">
                  <ConfirmButton action={disconnectMollieAction} variant="danger" confirm={t.account.disconnectConfirm}>
                    {t.account.disconnect}
                  </ConfirmButton>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card className="mb-6">
            <h2 className="text-[20px]">{t.rule.title}</h2>
            <p className="mb-5 mt-1 text-[14px] text-ink-muted">{t.rule.intro}</p>
            {!connection.canReceivePayments ? <p className="mb-5 rounded-xl bg-accent-tint px-4 py-3 text-[13px] leading-5 text-lilac-ink">{t.rule.inactiveWarning}</p> : null}
            <PaymentRuleForm action={updatePaymentRuleAction} initial={paymentRuleOf(e)} />
          </Card>

          <Card>
            <h2 className="text-[20px]">{t.history.title}</h2>
            {history.length === 0 ? (
              <p className="mt-2 text-[14px] text-ink-muted">{t.history.empty}</p>
            ) : (
              <ul className="mt-3 divide-y divide-line text-[14px]">
                {history.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">
                        {p.clientName || "Client"} · {p.serviceName}
                      </p>
                      <p className="text-[13px] text-ink-muted">
                        {p.kind === "full" ? t.history.full : t.history.deposit} · {formatDateTimeFr(p.startsAt, tz)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tabular-nums text-ink">{formatPriceCents(p.amountCents)}</span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[12px] font-medium",
                          p.status === "paid" ? "bg-success-tint text-success" : p.status === "refund_failed" ? "bg-error-tint text-error" : "bg-page text-ink-muted ring-1 ring-line",
                        )}
                      >
                        {t.history.status[p.status] ?? p.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
