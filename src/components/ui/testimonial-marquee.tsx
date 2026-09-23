import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import type { Testimonial } from "@/content/fr/testimonials";

function ReviewCard({ quote, firstName, establishment, activity, photo }: Testimonial) {
  return (
    <li className="card flex w-[280px] shrink-0 flex-col gap-3 p-5 md:w-[320px]">
      <figure className="flex h-full flex-col gap-3">
        <figcaption className="flex items-center gap-3">
          {photo ? (
            <Image src={photo} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
          ) : (
            <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-soft-tint text-[13px] font-bold text-brand">
              {firstName.charAt(0)}
            </span>
          )}
          <div className="leading-tight">
            <div className="text-[14px] font-semibold text-ink">{firstName}</div>
            <div className="text-[12.5px] text-ink-muted">
              {establishment} · {activity}
            </div>
          </div>
        </figcaption>
        <blockquote className="text-[14.5px] leading-6 text-ink">« {quote} »</blockquote>
      </figure>
    </li>
  );
}

/**
 * Deux rangées d'avis qui défilent en sens inverse, avec un fondu sur les
 * bords. En dessous de quatre avis, une seule rangée suffit.
 */
export function TestimonialMarquee({ items, label }: { items: Testimonial[]; label: string }) {
  const twoRows = items.length >= 4;
  const firstRow = twoRows ? items.slice(0, Math.ceil(items.length / 2)) : items;
  const secondRow = twoRows ? items.slice(Math.ceil(items.length / 2)) : [];

  return (
    <div className="relative flex w-full flex-col gap-4" role="group" aria-label={label}>
      <Marquee duration={`${Math.max(24, firstRow.length * 9)}s`}>
        {firstRow.map((item, i) => (
          <ReviewCard key={`${item.firstName}-${item.establishment}-${i}`} {...item} />
        ))}
      </Marquee>
      {secondRow.length > 0 ? (
        <Marquee reverse duration={`${Math.max(24, secondRow.length * 9)}s`}>
          {secondRow.map((item, i) => (
            <ReviewCard key={`${item.firstName}-${item.establishment}-${i}`} {...item} />
          ))}
        </Marquee>
      ) : null}
    </div>
  );
}
