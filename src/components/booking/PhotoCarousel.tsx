"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Share } from "lucide-react";
import { bookingPageCopy as t } from "@/content/fr/app";
import { cn } from "@/lib/cn";

/** Photos en pleine largeur, à faire défiler du doigt, avec le compteur « 1/8 » et le bouton Partager. */
export function PhotoCarousel({ photos, title }: { photos: Array<{ id: string; url: string }>; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const total = photos.length;

  const go = (next: number) => {
    const el = track.current;
    if (!el) return;
    const target = Math.max(0, Math.min(total - 1, next));
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  };

  const share = async () => {
    const url = window.location.href.split("?")[0];
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Partage annulé par l'utilisateur : rien à faire.
    }
  };

  return (
    <section aria-label={t.photosLabel} aria-roledescription="carrousel" className="group relative -mx-4 -mt-8 overflow-hidden bg-ink/5 md:mx-0 md:mt-0 md:rounded-[24px]">
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:aspect-[16/8] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, i) => (
          // Photos de l'établissement (Google ou envoyées) : balise img simple.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photo.id}
            src={photo.url}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : undefined}
            className="h-full w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-2">
        {copied ? <span className="rounded-full bg-ink/80 px-3 py-1.5 text-[12px] font-semibold text-page">{t.copied}</span> : null}
        <button
          type="button"
          onClick={share}
          aria-label={t.share}
          className="inline-flex size-10 items-center justify-center rounded-full bg-card/95 text-ink shadow-sm ring-1 ring-ink/5 transition-colors hover:bg-card"
        >
          <Share aria-hidden="true" className="size-[18px]" />
        </button>
      </div>

      {total > 1 ? (
        <>
          <span aria-live="polite" className="absolute bottom-3 right-3 rounded-full bg-ink/75 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-page">
            {t.counter(index + 1, total)}
          </span>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={t.previous}
            disabled={index === 0}
            className={cn(
              "absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/95 text-ink shadow-sm transition-opacity md:inline-flex",
              index === 0 ? "pointer-events-none opacity-0" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            )}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={t.next}
            disabled={index === total - 1}
            className={cn(
              "absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/95 text-ink shadow-sm transition-opacity md:inline-flex",
              index === total - 1 ? "pointer-events-none opacity-0" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            )}
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </>
      ) : null}
    </section>
  );
}
