"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { MessageSquareHeart, X } from "lucide-react";
import { feedbackWidget } from "@/content/fr/app";
import { cn } from "@/lib/cn";
import { sendFeedbackAction } from "@/server/app/actions/feedback";

type Mood = (typeof feedbackWidget.moods)[number]["value"];

/** Petit bouton flottant en bas à droite : un retour produit en trois clics. */
export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<Mood>("neutral");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const panelId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = () => {
    if (message.trim().length < 3) {
      setError(feedbackWidget.tooShort);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await sendFeedbackAction({ mood, message, page: pathname });
      if (result.ok) {
        setSent(true);
        setMessage("");
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 print:hidden">
      {open ? (
        <section
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${panelId}-title`}
          className="w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-5 shadow-lift"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id={`${panelId}-title`} className="text-[16px] font-semibold text-ink">
                {feedbackWidget.title}
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-ink-muted">{feedbackWidget.intro}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={feedbackWidget.close} className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-page hover:text-ink">
              <X className="size-4" />
            </button>
          </div>

          {sent ? (
            <div className="mt-4 rounded-xl bg-success-tint px-4 py-3 text-[14px] text-ink" role="status">
              {feedbackWidget.thanks}
              <button type="button" onClick={() => setSent(false)} className="mt-2 block text-[13px] font-medium text-brand underline-offset-4 hover:underline">
                {feedbackWidget.again}
              </button>
            </div>
          ) : (
            <>
              <div role="radiogroup" aria-label="Type de retour" className="mt-4 grid grid-cols-3 gap-2">
                {feedbackWidget.moods.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    role="radio"
                    aria-checked={mood === item.value}
                    onClick={() => setMood(item.value)}
                    className={cn(
                      "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2 text-[12px] font-medium transition-colors",
                      mood === item.value ? "border-brand bg-soft-tint text-ink" : "border-line bg-card text-ink-muted hover:border-ink/20",
                    )}
                  >
                    <span aria-hidden="true" className="text-[18px] leading-none">
                      {item.emoji}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
              <label htmlFor={`${panelId}-message`} className="sr-only">
                {feedbackWidget.placeholder}
              </label>
              <textarea
                id={`${panelId}-message`}
                ref={textareaRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={feedbackWidget.placeholder}
                rows={4}
                maxLength={2000}
                className="mt-3 block w-full rounded-xl border border-control bg-card px-3.5 py-2.5 text-[15px] leading-6 text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none"
              />
              {error ? (
                <p className="mt-2 text-[13px] text-error" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                aria-busy={pending}
                className="btn mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-button bg-ink px-4 text-[15px] font-semibold text-white disabled:opacity-60"
              >
                {pending ? feedbackWidget.sending : feedbackWidget.send}
              </button>
            </>
          )}
        </section>
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="btn inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-[14px] font-semibold text-white shadow-lift"
      >
        <MessageSquareHeart aria-hidden="true" className="size-4" />
        {feedbackWidget.open}
      </button>
    </div>
  );
}
