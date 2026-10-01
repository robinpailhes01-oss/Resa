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
    <div className="mb-7 flex flex-col gap-4 border-b border-line pb-6 md:mb-9 md:flex-row md:items-end md:justify-between md:pb-7">
      <div>
        <h1 className="text-[30px] leading-9 tracking-[-0.03em] md:text-[38px] md:leading-[44px]">
          {title}
        </h1>
        {intro ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-ink-muted">{intro}</p>
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
      className={`rounded-[20px] bg-card p-5 shadow-card ring-1 ring-line md:p-7 ${className ?? ""}`}
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
    <div className="rounded-[20px] border border-dashed border-ink/20 bg-card/60 px-6 py-14 text-center">
      <h2 className="heading-3">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-muted">{text}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
