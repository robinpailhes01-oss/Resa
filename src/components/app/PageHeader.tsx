import type { ReactNode } from "react";

export function PageHeader({
  title,
  intro,
  actions,
}: {
  title: string;
  intro?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-[26px] leading-8 md:text-[30px] md:leading-9">
          {title}
        </h1>
        {intro ? (
          <p className="mt-1.5 text-[15px] text-ink-muted">{intro}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-card p-5 ring-1 ring-line md:p-6 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-card/60 px-6 py-12 text-center">
      <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-muted">{text}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
