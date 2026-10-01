import Link from "next/link";
import { ChevronDown, Clock, MapPin, Phone, Star } from "lucide-react";
import { googleReviewsUrl } from "@/lib/google-places";
import { groupServices } from "@/lib/service-groups";
import { formatDuration, formatPriceCents, frenchWeekdayName, minutesToHHMM } from "@/lib/time";
import type { Establishment } from "@/server/auth/guards";
import type { ServiceCategory } from "@/server/app/categories";
import type { OpeningHourRow } from "@/server/app/hours";
import type { EstablishmentPhoto } from "@/server/app/photos";
import type { Practitioner } from "@/server/app/practitioners";
import type { Service } from "@/server/app/services";
import { businessTypeLabel } from "@/server/app/establishments";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { cn } from "@/lib/cn";
import { bookingPageCopy as t, publicReviewsCopy } from "@/content/fr/app";
import { PageTabs } from "./PageTabs";
import { PhotoCarousel } from "./PhotoCarousel";
import { ReviewCard, Stars, type ReviewCardData } from "./ReviewCard";

type Props = {
  establishment: Establishment;
  services: Service[];
  /** Rubriques écrites par l'établissement (titres, emojis, textes d'information). */
  categories?: ServiceCategory[];
  practitioners: Practitioner[];
  hours: OpeningHourRow[];
  photos: EstablishmentPhoto[];
  base: string;
  todayWeekday: number;
  /** Règle d'encaissement affichée (« Acompte de 30 % à la réservation ») ; null = paiement sur place. */
  paymentLabel?: string | null;
  /** Avis Google affichés (non masqués par l'établissement). */
  reviews?: Array<ReviewCardData & { id: string }>;
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function fullAddress(e: Establishment): string {
  return [e.addressLine, [e.postalCode, e.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

/** Fiche publique, simple comme une fiche d'annuaire : photos, nom, onglets, prestations rangées par rubrique. */
export function EstablishmentPage({ establishment: e, services, categories = [], practitioners, hours, photos, base, todayWeekday, paymentLabel = null, reviews = [] }: Props) {
  const address = fullAddress(e);
  const mapsHref = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.name} ${address}`)}` : null;
  const byDay = new Map<number, OpeningHourRow[]>();
  for (const h of hours) (byDay.get(h.weekday) ?? byDay.set(h.weekday, []).get(h.weekday))!.push(h);
  const groups = groupServices(categories, services);
  // Ouvertes d'emblée : la première rubrique (souvent un message à lire) et la première qui contient des prestations.
  const firstBookable = groups.findIndex((g) => g.services.length > 0);
  const rating = e.googleRating !== null ? e.googleRating.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null;
  const reviewsHref = e.googlePlaceId ? (e.googleMapsUrl ?? googleReviewsUrl(e.googlePlaceId)) : null;

  const book = (
    <section aria-labelledby="prestations-title">
      <h2 id="prestations-title" className="text-[22px]">
        {t.choose}
      </h2>
      <p className="mt-1 text-[14px] text-ink-muted">{t.facts(paymentLabel)}</p>
      {services.length === 0 && groups.length === 0 ? (
        <div className="mt-4">
          <StatusMessage tone="pending">{t.closed}</StatusMessage>
        </div>
      ) : groups.length === 1 && groups[0].category === null ? (
        <ServiceList services={groups[0].services} base={base} className="mt-4 rounded-2xl bg-card ring-1 ring-line" />
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {groups.map((g, i) => (
            <details key={g.category?.id ?? "autres"} open={i === 0 || i === firstBookable || groups.length <= 2} className="group overflow-hidden rounded-2xl bg-card ring-1 ring-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 md:px-5 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 text-[16px] font-semibold leading-6 text-ink">{g.category?.title ?? t.others}</span>
                <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
              </summary>
              {g.category?.description ? (
                <p className="mx-4 mb-3 whitespace-pre-line rounded-xl bg-page px-4 py-3 text-[14px] leading-6 text-ink md:mx-5">{g.category.description}</p>
              ) : null}
              {g.services.length > 0 ? <ServiceList services={g.services} base={base} className="border-t border-line" /> : null}
            </details>
          ))}
        </div>
      )}
    </section>
  );

  const reviewsPanel = (
    <section aria-labelledby="avis-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="avis-title" className="text-[22px]">
            {publicReviewsCopy.title}
          </h2>
          {e.googleRating !== null ? (
            <p className="mt-1 flex items-center gap-2 text-[14px] text-ink">
              <Stars rating={e.googleRating} />
              <span className="font-semibold">{rating}</span>
              <span className="text-ink-muted">{publicReviewsCopy.basedOn(e.googleRatingCount ?? reviews.length)}</span>
            </p>
          ) : null}
        </div>
        {e.googlePlaceId ? (
          <a href={googleReviewsUrl(e.googlePlaceId)} target="_blank" rel="noopener" className="text-[14px] font-medium text-brand underline-offset-4 hover:underline">
            {publicReviewsCopy.seeAll}
          </a>
        ) : null}
      </div>
      {reviews.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-card px-4 py-6 text-center text-[14px] text-ink-muted ring-1 ring-line">{t.noReviews}</p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  const about = (
    <div className="flex flex-col gap-6">
      {e.description ? (
        <section aria-labelledby="presentation-title">
          <h2 id="presentation-title" className="text-[18px]">
            {t.presentation}
          </h2>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-ink">{e.description}</p>
        </section>
      ) : null}

      {practitioners.length > 0 ? (
        <section aria-labelledby="equipe-title">
          <h2 id="equipe-title" className="text-[18px]">
            {t.team}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-4">
            {practitioners.map((p) => (
              <li key={p.id} className="flex w-20 flex-col items-center text-center">
                <span aria-hidden="true" className="inline-flex size-14 items-center justify-center rounded-full bg-ink text-[18px] font-bold text-white">
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <span className="mt-1.5 text-[14px] font-semibold leading-5 text-ink">{p.name}</span>
                {p.roleTitle ? <span className="text-[12px] leading-4 text-ink-muted">{p.roleTitle}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="horaires-title" className="rounded-2xl bg-card p-5 ring-1 ring-line">
        <h2 id="horaires-title" className="flex items-center gap-2 text-[16px] font-semibold text-ink">
          <Clock aria-hidden="true" className="size-4 text-brand" /> {t.hours}
        </h2>
        <dl className="mt-3 divide-y divide-line text-[14px]">
          {DAY_ORDER.map((day) => {
            const ranges = byDay.get(day) ?? [];
            const today = day === todayWeekday;
            return (
              <div key={day} className={cn("flex items-baseline justify-between gap-3 py-2", today && "font-semibold text-ink")}>
                <dt className={cn("capitalize", !today && "text-ink")}>{frenchWeekdayName(day)}</dt>
                <dd className={cn("text-right tabular-nums", ranges.length === 0 ? "text-ink-muted" : "text-ink")}>
                  {ranges.length === 0 ? t.dayClosed : ranges.map((r) => `${minutesToHHMM(r.startMin)} – ${minutesToHHMM(r.endMin)}`).join(" · ")}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      {address || e.phone ? (
        <section aria-labelledby="infos-title" className="rounded-2xl bg-card p-5 ring-1 ring-line">
          <h2 id="infos-title" className="text-[16px] font-semibold text-ink">
            {t.where}
          </h2>
          {address ? (
            <p className="mt-2 flex items-start gap-2 text-[14px] leading-6 text-ink">
              <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
              <span>
                {address}
                {mapsHref ? (
                  <>
                    <br />
                    <a href={mapsHref} target="_blank" rel="noopener" className="font-medium text-brand underline-offset-4 hover:underline">
                      {t.map}
                    </a>
                  </>
                ) : null}
              </span>
            </p>
          ) : null}
          {e.phone ? (
            <p className="mt-2 flex items-center gap-2 text-[14px] text-ink">
              <Phone aria-hidden="true" className="size-4 shrink-0 text-brand" />
              <a href={`tel:${e.phone.replace(/\s+/g, "")}`} className="underline-offset-4 hover:underline">
                {e.phone}
              </a>
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );

  const showReviews = reviews.length > 0 || e.googleRating !== null;

  return (
    <div className="flex flex-col gap-5">
      {photos.length > 0 ? <PhotoCarousel photos={photos} title={e.name} /> : null}

      <header>
        <h1 className="text-[26px] leading-8 md:text-[34px] md:leading-[1.1]">{e.name}</h1>
        {address ? (
          <a href={mapsHref ?? undefined} target="_blank" rel="noopener" className="mt-1.5 inline-flex items-start gap-1 text-[15px] text-ink-muted underline-offset-4 hover:text-ink hover:underline">
            <MapPin aria-hidden="true" className="mt-[3px] size-4 shrink-0" /> {address}
          </a>
        ) : null}
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-ink-muted">
          {rating ? (
            reviewsHref ? (
              <a href={reviewsHref} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline-offset-4 hover:underline" aria-label={t.ratingLabel(rating, e.googleRatingCount ?? 0)}>
                <Star aria-hidden="true" className="size-4 fill-ink text-ink" />
                <span className="font-semibold text-ink">{rating}</span> {t.reviewsCount(e.googleRatingCount ?? 0)}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1" aria-label={t.ratingLabel(rating, e.googleRatingCount ?? 0)}>
                <Star aria-hidden="true" className="size-4 fill-ink text-ink" />
                <span className="font-semibold text-ink">{rating}</span> {t.reviewsCount(e.googleRatingCount ?? 0)}
              </span>
            )
          ) : null}
          {rating ? <span aria-hidden="true">·</span> : null}
          <span>{businessTypeLabel(e.businessType)}</span>
        </p>
        {e.bio ? <p className="mt-3 max-w-xl text-[15px] leading-6 text-ink">{e.bio}</p> : null}
      </header>

      <PageTabs
        tabs={[
          { id: "prendre-rdv", label: t.tabs.book, content: book },
          ...(showReviews ? [{ id: "avis", label: t.tabs.reviews, content: reviewsPanel }] : []),
          { id: "a-propos", label: t.tabs.about, content: about },
        ]}
      />
    </div>
  );
}

function ServiceList({ services, base, className }: { services: Service[]; base: string; className?: string }) {
  return (
    <ul className={cn("divide-y divide-line", className)}>
      {services.map((s) => (
        <li key={s.id} className="flex items-center gap-3 px-4 py-4 md:gap-4 md:px-5">
          {s.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.photoUrl} alt="" loading="lazy" className="size-14 shrink-0 rounded-xl object-cover ring-1 ring-line md:size-16" />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold leading-5 text-ink md:text-[16px]">{s.name}</div>
            {s.description ? <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-5 text-ink-muted">{s.description}</p> : null}
            <p className="mt-1 text-[13.5px] text-ink-muted">
              {formatDuration(s.durationMin)}
              {s.priceCents > 0 ? (
                <>
                  {" · "}
                  <span className="font-semibold text-ink">{formatPriceCents(s.priceCents)}</span>
                </>
              ) : null}
            </p>
          </div>
          <Link href={`${base}?service=${s.id}`} className="btn inline-flex min-h-10 shrink-0 items-center justify-center rounded-button bg-ink px-4 text-[14px] font-semibold text-white">
            {t.pick}
          </Link>
        </li>
      ))}
    </ul>
  );
}
