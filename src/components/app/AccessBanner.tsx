import Link from "next/link";
import { AlertTriangle, Clock, Sparkles } from "lucide-react";
import { accessNotice } from "@/content/fr/app";
import { cn } from "@/lib/cn";
import { formatDateKeyLong, todayDateKey } from "@/lib/time";
import { resolveAccess } from "@/lib/trial";
import type { Establishment } from "@/server/auth/guards";

/**
 * Bandeau d'accès affiché en haut de chaque page de l'espace pro : jours
 * d'essai restants, essai terminé ou abonnement arrêté.
 */
export function AccessBanner({ establishment }: { establishment: Establishment }) {
  const access = resolveAccess(establishment);
  const fmt = (d: Date | null) => (d ? formatDateKeyLong(todayDateKey(establishment.timezone, d)) : null);
  const notice =
    access.state === "trial"
      ? accessNotice.trial(access.daysLeft, fmt(access.endsAt) ?? "")
      : access.state === "expired"
        ? accessNotice.expired
        : access.state === "cancelled"
          ? accessNotice.cancelled
          : access.state === "past_due"
            ? accessNotice.pastDue(fmt(access.paidUntil))
            : accessNotice.active(fmt(access.paidUntil));
  const warning = access.state === "expired" || access.state === "cancelled" || access.state === "past_due";
  const showCta = access.state !== "active";
  const Icon = access.state === "trial" ? Clock : warning ? AlertTriangle : Sparkles;
  return (
    <div
      role={warning ? "alert" : "status"}
      data-access={access.state}
      className={cn(
        "mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-[14px] leading-6 text-ink",
        warning ? "border-accent/50 bg-accent-tint" : "border-line bg-soft-tint/60",
      )}
    >
      <Icon aria-hidden="true" className={cn("mt-1 size-4 shrink-0", warning ? "text-accent" : "text-brand")} />
      <p className="flex-1">
        <span className="font-semibold">{notice.title} · </span>
        {notice.text}
        {showCta ? (
          <>
            {" "}
            <Link href="/app/abonnement" className="font-semibold text-brand underline-offset-4 hover:underline">
              {accessNotice.cta}
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
