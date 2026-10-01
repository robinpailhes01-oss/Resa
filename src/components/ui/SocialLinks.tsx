import type { ReactNode } from "react";
import { offer, type SocialLinks as Links } from "@/config/offer";
import { footer } from "@/content/fr/landing";
import { cn } from "@/lib/cn";

/* Pictogrammes des réseaux (tracés simplifiés, couleur héritée du texte). */
const icons: Record<keyof Links, ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.1 23.69v-7.98H6.63v-3.67H9.1v-1.58c0-4.09 1.85-5.98 5.86-5.98.4 0 .96.04 1.47.1.39.05.77.11 1.14.2v3.32c-.22-.02-.44-.03-.65-.04-.24 0-.49-.01-.73-.01-.71 0-1.26.1-1.68.31-.28.14-.52.36-.68.62-.26.42-.37 1-.37 1.75v1.3h3.92l-.39 2.1-.29 1.57H13.3v8.24C19.4 23.24 24 18.18 24 12.04 24 5.42 18.63.04 12 .04S0 5.42 0 12.04c0 5.63 3.87 10.35 9.1 11.65z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0h.01z" />
    </svg>
  ),
};

/** Icônes des réseaux de Reso ; n'affiche rien si aucun lien n'est configuré. */
export function SocialLinks({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const entries = (Object.keys(icons) as Array<keyof Links>).filter((k) => offer.social[k]);
  if (entries.length === 0) return null;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {withLabel ? <span className="text-[13px] text-ink-muted">{footer.followUs}</span> : null}
      <ul className="flex items-center gap-1">
        {entries.map((k) => (
          <li key={k}>
            <a
              href={offer.social[k]!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={footer.social[k]}
              className="inline-flex size-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink [&_svg]:size-[18px]"
            >
              {icons[k]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
