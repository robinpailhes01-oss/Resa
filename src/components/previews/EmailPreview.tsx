import { CalendarCheck, Clock, MapPin, User } from "lucide-react";
import { demo } from "@/content/fr/landing";
import { AppFrame } from "./AppFrame";

/* Représentation simple d'un email de confirmation, tel que reçu par la cliente (fictif). */
export function EmailPreview({ alt, className }: { alt: string; className?: string }) {
  const firstName = demo.camilleDay[0].client.split(" ")[0];
  const slot = demo.camilleDay[0];
  return (
    <AppFrame alt={alt} className={className}>
      <div className="border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="envelope inline-flex size-7 items-center justify-center rounded-lg bg-soft-tint text-brand">
            <CalendarCheck className="size-4" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[12px] font-semibold text-ink">Votre rendez-vous chez {demo.salon} est confirmé</div>
            <div className="truncate text-[11px] text-ink-muted">
              {demo.salon} via Reso · à {firstName.toLowerCase()}@exemple.fr
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-4 text-[12px] leading-5">
        <p className="text-ink">Bonjour {firstName},</p>
        <p className="mt-1 text-ink-muted">Votre rendez-vous est confirmé. À très bientôt.</p>
        <ul className="mt-3 space-y-1.5 rounded-xl border border-line bg-page/70 p-3 text-ink">
          <li className="flex items-center gap-2">
            <CalendarCheck className="size-3.5 shrink-0 text-brand" /> {demo.date.short} · 09:00
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-brand" /> {slot.title} · 1 h
          </li>
          <li className="flex items-center gap-2">
            <User className="size-3.5 shrink-0 text-brand" /> Avec {demo.practitioners[0].name}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-brand" /> {demo.salon}, {demo.city}
          </li>
        </ul>
        <span className="mt-3 inline-flex rounded-lg bg-ink px-3 py-1.5 text-[11px] font-semibold text-white">Voir ou annuler mon rendez-vous</span>
      </div>
    </AppFrame>
  );
}
