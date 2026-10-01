import { MessageCircle } from "lucide-react";
import { teamContactHref } from "@/lib/contact";
import { demoCall } from "@/content/fr/landing";
import { cn } from "@/lib/cn";

/** Lien de la démo en visio : WhatsApp, sinon téléphone, sinon email de contact. */
export function demoCallHref(): string | null {
  return teamContactHref(demoCall.whatsappMessage, demoCall.emailSubject);
}

/** « Vous préférez qu'on vous montre ? » : démo de 20 minutes en visio avec Ludivine. */
export function DemoCallCard({ className }: { className?: string }) {
  const href = demoCallHref();
  if (!href) return null;
  return (
    <div className={cn("rounded-[24px] bg-card p-6 shadow-card ring-1 ring-line md:p-8", className)}>
      <h3 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink md:text-[26px]">{demoCall.title}</h3>
      <p className="mt-3 text-[15px] leading-6 text-ink-muted md:text-[16px] md:leading-7">{demoCall.text}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-button border border-ink/15 bg-page px-5 text-[15px] font-semibold text-ink hover:border-ink/30 hover:bg-card"
      >
        <MessageCircle aria-hidden="true" className="size-[18px]" />
        {demoCall.button}
      </a>
    </div>
  );
}
