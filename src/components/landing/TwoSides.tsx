"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Phone, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionKicker } from "@/components/ui/Section";
import { twoSides as t } from "@/content/fr/landing";
import { cn } from "@/lib/cn";

type Side = "pro" | "client";

/** Le même salon vu des deux côtés : la journée du pro, la page où ses clients réservent. */
export function TwoSides() {
  const [side, setSide] = useState<Side>("pro");
  return (
    <section id="deux-cotes" aria-labelledby="deux-cotes-title" className="py-16 md:py-24">
      <div className="container-page">
        <div className="reveal reveal-blur mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <SectionKicker index={t.index} eyebrow={t.eyebrow} />
          <h2 id="deux-cotes-title" className="heading-2">
            {t.title}
          </h2>
          <p className="max-w-xl text-[16px] leading-7 text-ink-muted md:text-[17px]">{t.intro}</p>
        </div>

        <div className="reveal mx-auto mt-10 max-w-[440px] rounded-[32px] bg-card p-4 shadow-card ring-1 ring-line md:p-6">
          <div role="tablist" aria-label={t.eyebrow} className="mx-auto flex w-fit gap-2">
            {(["pro", "client"] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={side === s}
                aria-controls="deux-cotes-ecran"
                onClick={() => setSide(s)}
                className={cn(
                  "rounded-full px-5 py-2 text-[15px] font-semibold transition-colors",
                  side === s ? "bg-soft-tint text-powder-deep ring-1 ring-powder/40" : "text-ink-muted ring-1 ring-line hover:text-ink",
                )}
              >
                {t.tabs[s]}
              </button>
            ))}
          </div>

          {/* Téléphone */}
          <div id="deux-cotes-ecran" role="tabpanel" className="mx-auto mt-5 w-full max-w-[330px] overflow-hidden rounded-[38px] border-[6px] border-ink/90 bg-page shadow-[0_30px_60px_-30px_rgba(20,28,38,0.55)]">
            <div className="flex items-center justify-between bg-page px-6 pb-1 pt-3 text-[11px] font-semibold text-ink">
              <span>9:41</span>
              <span aria-hidden="true" className="h-[18px] w-20 rounded-full bg-ink" />
              <span aria-hidden="true" className="flex items-center gap-1">
                <span className="h-2 w-3 rounded-[2px] bg-ink/80" />
                <span className="h-2.5 w-5 rounded-[3px] border border-ink/70" />
              </span>
            </div>
            <div className="h-[540px] overflow-hidden">{side === "pro" ? <ProScreen /> : <ClientScreen />}</div>
          </div>

          <p className="mt-4 text-center text-[12px] text-ink-muted">{t.caption}</p>
          <div className="mt-3 flex justify-center">
            <Button href="/demo" variant="secondary" size="compact">
              {t.demo} <ArrowUpRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProScreen() {
  const p = t.pro;
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-3 ring-1 ring-line">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-powder-deep text-[11px] font-semibold text-page">MA</span>
          <span className="leading-tight">
            <span className="block text-[12px] font-semibold text-ink">{p.salon}</span>
            <span className="block text-[10px] text-ink-muted">{p.subtitle}</span>
          </span>
        </div>
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-powder-deep text-page">
          <Plus aria-hidden="true" className="size-4" />
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 rounded-full bg-card p-1 text-center text-[12px] ring-1 ring-line">
        <span className="rounded-full bg-page py-1.5 font-semibold text-ink shadow-sm">{p.today}</span>
        <span className="py-1.5 text-ink-muted">{p.week}</span>
      </div>
      <p className="mt-4 text-center font-display text-[20px] font-semibold text-ink">{p.date}</p>
      <span aria-hidden="true" className="mx-auto mt-1.5 block h-0.5 w-8 rounded-full bg-powder" />

      <ol className="relative mt-3 flex-1 space-y-2.5 border-l border-line pl-4 text-[12px] [margin-left:3.1rem]">
        {p.done.map((r) => (
          <li key={r.time} className="relative flex items-center justify-between text-ink-muted">
            <span className="absolute -left-[4.35rem] w-11 text-right tabular-nums">{r.time}</span>
            <span aria-hidden="true" className="absolute -left-[1.2rem] size-1.5 rounded-full bg-line" />
            <span>{r.name}</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Check aria-hidden="true" className="size-3 text-success" /> {r.price}
            </span>
          </li>
        ))}
        <li className="relative rounded-2xl bg-card p-3 ring-1 ring-powder/30">
          <span className="absolute -left-[4.35rem] top-3 w-11 text-right text-[13px] font-semibold tabular-nums text-ink">{p.next.time}</span>
          <span aria-hidden="true" className="absolute -left-[1.45rem] top-3.5 size-3 rounded-full bg-powder ring-4 ring-soft-tint" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-powder-deep">{p.nextIn}</p>
          <p className="mt-0.5 font-display text-[17px] font-semibold leading-tight text-ink">{p.next.name}</p>
          <p className="text-ink-muted">{p.next.service}</p>
          <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-[10px] font-semibold text-success">
            <Wallet aria-hidden="true" className="size-3" /> {p.next.deposit}
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <span className="inline-flex items-center justify-center gap-1 rounded-full py-1.5 font-semibold text-ink ring-1 ring-line">
              <Phone aria-hidden="true" className="size-3" /> {p.actions.call}
            </span>
            <span className="inline-flex items-center justify-center rounded-full bg-powder-deep py-1.5 font-semibold text-page">{p.actions.open}</span>
          </div>
        </li>
        {p.later.map((r) => (
          <li key={r.time} className="relative flex items-start justify-between gap-2">
            <span className="absolute -left-[4.35rem] w-11 text-right font-semibold tabular-nums text-ink">{r.time}</span>
            <span aria-hidden="true" className="absolute -left-[1.2rem] top-1 size-1.5 rounded-full bg-ink" />
            <span className="min-w-0">
              <span className="block font-semibold text-ink">{r.name}</span>
              <span className="block text-ink-muted">{r.service}</span>
            </span>
            <span className="flex items-center gap-0.5 font-semibold tabular-nums text-ink">
              {r.price} <ChevronRight aria-hidden="true" className="size-3 text-ink-muted" />
            </span>
          </li>
        ))}
        <li className="relative text-ink-muted">
          <span className="absolute -left-[4.35rem] w-11 text-right tabular-nums">{p.end.time}</span>
          <span aria-hidden="true" className="absolute -left-[1.25rem] top-1 size-2 rounded-full border border-line bg-page" />
          {p.end.label}
        </li>
      </ol>
    </div>
  );
}

function ClientScreen() {
  const c = t.client;
  return (
    <div className="h-full px-4 pb-4 pt-2">
      <p className="flex items-center gap-1 text-[13px] font-semibold text-ink">
        <ChevronLeft aria-hidden="true" className="size-4" /> {c.back}
      </p>
      <p className="mt-1 text-[11px] text-ink-muted">{c.bio}</p>
      <p className="mt-2 flex w-fit items-center gap-1 rounded-full bg-soft-tint px-2.5 py-1 text-[10px] font-semibold text-powder-deep">
        <Wallet aria-hidden="true" className="size-3" /> {c.deposit}
      </p>
      <div className="mt-3 flex gap-1.5 overflow-hidden">
        {c.filters.map((f, i) => (
          <span key={f} className={cn("inline-block shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold leading-4", i === 0 ? "bg-powder-deep text-page" : "bg-soft-tint text-powder-deep")}>
            {f}
          </span>
        ))}
      </div>
      <ul className="mt-3 space-y-2">
        {c.services.map((s) => (
          <li key={s.name} className="flex items-center gap-2.5 rounded-2xl bg-card p-2 ring-1 ring-line">
            {s.image ? (
              <Image src={s.image} alt="" width={96} height={96} loading="eager" className="size-14 shrink-0 rounded-xl object-cover" />
            ) : (
              <span aria-hidden="true" className="size-14 shrink-0 rounded-xl bg-[repeating-linear-gradient(135deg,var(--color-soft-tint)_0_6px,var(--color-page)_6px_12px)]" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-ink">{s.name}</span>
              <span className="block truncate text-[11px] text-ink-muted">{s.text}</span>
              <span className="block text-[11px] font-semibold text-powder-deep">{s.meta}</span>
            </span>
            <span aria-label={c.add} className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-ink ring-1 ring-line">
              <Plus aria-hidden="true" className="size-3.5" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
