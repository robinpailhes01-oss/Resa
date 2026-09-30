import { Star } from "lucide-react";
import { publicReviewsCopy as t } from "@/content/fr/app";
import { cn } from "@/lib/cn";

export type ReviewCardData = {
  authorName: string;
  authorUrl: string | null;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string | null;
};

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span role="img" aria-label={t.stars(Math.round(rating))} className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden="true" className={cn("size-4", i <= Math.round(rating) ? "fill-[#e8b04b] text-[#e8b04b]" : "fill-transparent text-ink/20")} />
      ))}
    </span>
  );
}

/** Avis Google tel que publié : auteur, note, texte, date, mention de la source. */
export function ReviewCard({ review, className }: { review: ReviewCardData; className?: string }) {
  const initial = review.authorName.charAt(0).toUpperCase();
  return (
    <figure className={cn("flex h-full flex-col rounded-2xl bg-card p-5 ring-1 ring-line", className)}>
      <Stars rating={review.rating} />
      <blockquote className="mt-3 flex-1 text-[14px] leading-6 text-ink">
        <p className="line-clamp-6 whitespace-pre-line">{review.text}</p>
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4">
        {review.authorPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.authorPhotoUrl} alt="" referrerPolicy="no-referrer" loading="lazy" className="size-9 shrink-0 rounded-full object-cover" />
        ) : (
          <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-soft-tint text-[14px] font-semibold text-brand">
            {initial}
          </span>
        )}
        <span className="min-w-0 text-[13px] leading-5">
          {review.authorUrl ? (
            <a href={review.authorUrl} target="_blank" rel="noopener noreferrer" className="block truncate font-semibold text-ink underline-offset-4 hover:underline">
              {review.authorName}
            </a>
          ) : (
            <span className="block truncate font-semibold text-ink">{review.authorName}</span>
          )}
          <span className="block text-ink-muted">
            {review.relativeTime ? `${review.relativeTime} · ` : ""}
            {t.source}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
