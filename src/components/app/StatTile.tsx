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
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-card p-5 ring-1 ring-line", className)}>
      <p className="text-[13px] font-medium text-ink-muted">{label}</p>
      <p className="mt-1.5 text-[28px] font-bold leading-9 tracking-tight text-ink">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[13px] text-ink-muted">{hint}</p>
      ) : null}
      {footer ? <div className="mt-2">{footer}</div> : null}
    </div>
  );
}
