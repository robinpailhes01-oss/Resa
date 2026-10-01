import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Variation relative formatée « +12 % » / « −8 % », neutre si absente. */
export function DeltaBadge({
  value,
  invert = false,
}: {
  value: number | null;
  invert?: boolean;
}) {
  if (value === null || !Number.isFinite(value))
    return (
      <span className="text-[12px] text-ink-muted">
        vs période précédente : —
      </span>
    );
  const pct = Math.round(value * 100);
  const good = invert ? pct <= 0 : pct >= 0;
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[12px] font-medium",
        good ? "text-success" : "text-error",
      )}
    >
      <span aria-hidden="true">{pct > 0 ? "▲" : pct < 0 ? "▼" : "•"}</span>
      {sign}
      {Math.abs(pct)} % vs période précédente
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  footer,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[20px] bg-card p-5 shadow-card ring-1 ring-line md:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow !text-[11px] !tracking-[0.14em]">{label}</p>
        {icon ? <span aria-hidden="true" className="inline-flex size-8 items-center justify-center rounded-lg bg-soft-tint text-brand">{icon}</span> : null}
      </div>
      <p className="mt-4 font-display text-[40px] font-medium leading-none tracking-[-0.04em] tabular-nums text-ink">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[13px] leading-5 text-ink-muted">{hint}</p>
      ) : null}
      {footer ? <div className="mt-3 leading-5">{footer}</div> : null}
    </div>
  );
}
