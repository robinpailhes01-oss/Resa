import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Step = { href: string; label: string; done: boolean; hint: string };

/** Encart affiché tant que l'espace n'est pas prêt à recevoir des réservations. */
export function OnboardingChecklist({
  steps,
  slug,
}: {
  steps: Step[];
  slug: string;
}) {
  const remaining = steps.filter((s) => !s.done).length;
  if (remaining === 0) return null;
  return (
    <div className="mb-6 rounded-2xl bg-soft-tint p-5 md:p-6">
      <h2 className="text-[18px] font-semibold text-brand">
        Encore {remaining} étape{remaining > 1 ? "s" : ""} avant d’ouvrir les
        réservations
      </h2>
      <p className="mt-1 text-[14px] text-ink-muted">
        Votre lien de réservation sera{" "}
        <span className="font-medium text-ink">/r/{slug}</span>.
      </p>
      <ul className="mt-4 grid gap-2 md:grid-cols-3">
        {steps.map((step) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className={cn(
                "flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-line transition-colors hover:ring-brand/40",
                step.done && "opacity-70",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-full",
                  step.done
                    ? "bg-success text-white"
                    : "bg-page text-ink-muted ring-1 ring-line",
                )}
              >
                {step.done ? (
                  <Check className="size-3.5" strokeWidth={3} />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-ink">
                  {step.label}
                </span>
                <span className="block truncate text-[12px] text-ink-muted">
                  {step.hint}
                </span>
              </span>
              <ChevronRight className="size-4 text-ink-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
