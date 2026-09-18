import { Bell, CalendarCheck, MessageCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { demo } from "@/content/fr/landing";
import { cn } from "@/lib/cn";
import { AppFrame } from "./AppFrame";

const automations = [
  { icon: CalendarCheck, title: "Confirmation de réservation", when: "Juste après la réservation", tone: "soft" },
  { icon: Bell, title: "Rappel de rendez-vous", when: "24 heures avant le rendez-vous", tone: "accent" },
  { icon: MessageCircle, title: "Demande d’avis", when: "24 heures après un rendez-vous terminé", tone: "soft", active: true },
] as const;

function Toggle() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] text-ink-muted">
      <span className="relative inline-block h-4 w-7 rounded-full bg-brand">
        <span className="absolute right-0.5 top-0.5 size-3 rounded-full bg-white" />
      </span>
      Activé
    </span>
  );
}

function EmailCard() {
  const firstName = demo.reference.client.split(" ")[0];
  return (
    <div className="rounded-lg border border-line bg-page/60 p-3">
      <div className="mb-2 text-[11px] font-bold text-brand">Aperçu de l’email</div>
      <div className="rounded-md border border-line bg-card p-3 text-center">
        <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-accent" />
        <div className="text-[11px] font-bold tracking-wide text-brand">{demo.salon}</div>
        <div className="mb-2 text-[8px] uppercase tracking-[0.2em] text-ink-muted">Beauté · Bien-être · Soin</div>
        <div className="mb-2 h-10 rounded-md bg-[linear-gradient(120deg,#f3e3d4,#ddd5e5)]" />
        <div className="text-[12px] font-bold text-ink">Merci pour votre visite, {firstName}</div>
        <p className="mx-auto mt-1 max-w-[26ch] text-[9px] leading-snug text-ink-muted">
          Nous espérons que vous avez apprécié votre moment chez {demo.salon}. Votre avis nous aide à améliorer votre expérience.
        </p>
        <span className="mt-2 inline-block rounded-md bg-brand px-3 py-1 text-[9px] font-semibold text-white">Partager mon avis</span>
        <div className="mt-2 text-[9px] text-ink-muted">À bientôt, l’équipe {demo.salon}</div>
      </div>
    </div>
  );
}

export function EmailsPreview({ alt, className }: { alt: string; className?: string }) {
  return (
    <AppFrame alt={alt} className={className}>
      <div className="flex items-center justify-between border-b border-line px-3 py-2 @sm:px-4">
        <Logo height={16} />
        <span className="text-[10px] text-ink-muted @sm:text-[11px]">{demo.salon}</span>
      </div>
      <div className="px-3 py-3 @sm:px-4">
        <div className="mb-3">
          <div className="text-[13px] font-bold text-brand @sm:text-[15px]">Emails automatiques</div>
          <div className="text-[10px] text-ink-muted">Les bons messages, au bon moment.</div>
        </div>
        <div className="grid gap-3 @2xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2">
            {automations.map(({ icon: Icon, title, when, tone, ...rest }) => {
              const active = "active" in rest && rest.active;
              return (
                <div
                  key={title}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-2.5",
                    active ? "border-brand bg-soft-tint/70" : "border-line",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-brand",
                      tone === "soft" ? "bg-soft-tint" : "bg-accent-tint",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate text-[11px] font-semibold text-ink">{title}</div>
                    <div className="truncate text-[9px] text-ink-muted">{when}</div>
                  </div>
                  <Toggle />
                </div>
              );
            })}
            <div className="rounded-lg border border-line p-2.5 text-[10px]">
              <div className="mb-1.5 font-semibold text-ink">Personnaliser le message</div>
              <div className="mb-1 text-ink-muted">Objet de l’email</div>
              <div className="rounded-md border border-line bg-page/60 px-2 py-1.5">Comment s’est passé votre rendez-vous ?</div>
            </div>
          </div>
          <EmailCard />
        </div>
      </div>
    </AppFrame>
  );
}
