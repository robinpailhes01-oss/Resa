"use client";

import { useState } from "react";
import { ActionForm, type FormAction } from "./ActionForm";
import { TextInput } from "./Fields";
import { paymentsPage } from "@/content/fr/app";
import { amountDue, type DepositKind, type PaymentMode } from "@/lib/booking-payment";
import { formatPriceCents } from "@/lib/time";
import { cn } from "@/lib/cn";

const t = paymentsPage.rule;
const EXAMPLE_PRICE_CENTS = 6000;

/** Réglage de l'encaissement à la réservation : rien, acompte (pourcentage ou montant fixe) ou totalité. */
export function PaymentRuleForm({
  action,
  initial,
}: {
  action: FormAction;
  initial: { mode: PaymentMode; depositKind: DepositKind; depositValue: number };
}) {
  const [mode, setMode] = useState<PaymentMode>(initial.mode);
  const [kind, setKind] = useState<DepositKind>(initial.depositKind);
  const [percent, setPercent] = useState(initial.depositKind === "percent" ? String(initial.depositValue) : "30");
  const [amount, setAmount] = useState(initial.depositKind === "fixed" ? String(initial.depositValue / 100).replace(".", ",") : "20");

  const value = kind === "percent" ? Number.parseInt(percent, 10) || 0 : Math.round((Number.parseFloat(amount.replace(",", ".")) || 0) * 100);
  const due = amountDue({ mode, depositKind: kind, depositValue: value }, EXAMPLE_PRICE_CENTS);

  return (
    <ActionForm action={action} submitLabel={t.save}>
      <>
        <fieldset>
          <legend className="sr-only">{t.title}</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["none", "deposit", "full"] as const).map((m) => (
              <label
                key={m}
                className={cn(
                  "relative flex cursor-pointer flex-col gap-1 rounded-2xl border bg-card px-4 py-4 transition-[border-color,box-shadow]",
                  mode === m ? "border-brand shadow-[0_0_0_3px_rgba(74,97,121,0.14)]" : "border-line hover:border-ink/20",
                )}
              >
                <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="sr-only" />
                <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  <span aria-hidden="true" className={cn("inline-flex size-4 items-center justify-center rounded-full border", mode === m ? "border-brand" : "border-ink/30")}>
                    {mode === m ? <span className="size-2 rounded-full bg-brand" /> : null}
                  </span>
                  {t.modes[m].label}
                </span>
                <span className="text-[13px] leading-5 text-ink-muted">{t.modes[m].help}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <input type="hidden" name="depositKind" value={kind} />
        {mode === "deposit" ? (
          <div className="rounded-2xl bg-page p-4 ring-1 ring-line">
            <p className="text-[14px] font-semibold text-ink">{t.depositKind}</p>
            <div role="radiogroup" aria-label={t.depositKind} className="mt-2 inline-flex rounded-full bg-card p-1 ring-1 ring-line">
              {(["percent", "fixed"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={kind === k}
                  onClick={() => setKind(k)}
                  className={cn("rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors", kind === k ? "bg-ink text-page" : "text-ink-muted hover:text-ink")}
                >
                  {k === "percent" ? t.percent : t.fixed}
                </button>
              ))}
            </div>
            <div className="mt-4 max-w-[220px]">
              {kind === "percent" ? (
                <TextInput id="depositPercent" name="depositPercent" label={t.percentLabel} inputMode="numeric" value={percent} onChange={(e) => setPercent(e.target.value)} />
              ) : (
                <TextInput id="depositAmount" name="depositAmount" label={t.amountLabel} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
              )}
            </div>
          </div>
        ) : null}

        {mode !== "none" ? (
          <div className="flex flex-col gap-2 text-[13px] leading-5 text-ink-muted">
            {due ? (
              <p className="font-medium text-ink">
                {t.example(formatPriceCents(EXAMPLE_PRICE_CENTS), formatPriceCents(due.amountCents), due.remainingCents > 0 ? formatPriceCents(due.remainingCents) : "")}
              </p>
            ) : null}
            <p>{t.noteFree}</p>
            <p>{t.noteRefund}</p>
            {t.noteFee ? <p>{t.noteFee}</p> : null}
          </div>
        ) : null}
      </>
    </ActionForm>
  );
}
