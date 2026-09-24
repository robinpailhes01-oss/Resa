import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { formatDuration, formatPriceCents, frenchWeekdayName, minutesToHHMM } from "@/lib/time";
import type { Establishment } from "@/server/auth/guards";
import type { OpeningHourRow } from "@/server/app/hours";
import type { EstablishmentPhoto } from "@/server/app/photos";
import type { Practitioner } from "@/server/app/practitioners";
import type { Service } from "@/server/app/services";
import { businessTypeLabel } from "@/server/app/establishments";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { cn } from "@/lib/cn";

type Props = {
  establishment: Establishment;
  services: Service[];
  practitioners: Practitioner[];
  hours: OpeningHourRow[];
  photos: EstablishmentPhoto[];
  base: string;
  todayWeekday: number;
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function fullAddress(e: Establishment): string {
  return [e.addressLine, [e.postalCode, e.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

/** Fiche publique de l'établissement : photos, prestations, équipe, infos pratiques, horaires. */
export function EstablishmentPage({ establishment: e, services, practitioners, hours, photos, base, todayWeekday }: Props) {
  const address = fullAddress(e);
  const mapsHref = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.name} ${address}`)}` : null;
  const byDay = new Map<number, OpeningHourRow[]>();
  for (const h of hours) (byDay.get(h.weekday) ?? byDay.set(h.weekday, []).get(h.weekday))!.push(h);
  const gallery = photos.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-[28px] leading-9 md:text-[36px] md:leading-[1.1]">{e.name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ink-muted">
          <span>{businessTypeLabel(e.businessType)}</span>
          {address ? (
            <a href={mapsHref ?? undefined} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline-offset-4 hover:text-ink hover:underline">
              <MapPin aria-hidden="true" className="size-4" /> {address}
            </a>
          ) : null}
        </p>
        <div className="mt-4">
          <a href="#prestations" className="btn inline-flex min-h-12 items-center justify-center rounded-button bg-ink px-6 text-[15px] font-semibold text-white">
            Prendre rendez-vous
          </a>
        </div>
      </header>

      {gallery.length > 0 ? (
        <section aria-label="Photos de l’établissement" className={cn("grid gap-2 overflow-hidden rounded-[24px]", gallery.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-4 md:grid-rows-2")}>
          {gallery.map((photo, index) => (
            // Photos hébergées par Google : balise img simple (pas de transformation côté serveur).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              className={cn("h-full w-full object-cover", index === 0 ? "col-span-2 row-span-2 aspect-[4/3] md:aspect-auto" : "aspect-[4/3]", gallery.length === 1 && "max-h-[420px]")}
            />
          ))}
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex flex-col gap-8">
          <section id="prestations" aria-labelledby="prestations-title" className="scroll-mt-24">
            <h2 id="prestations-title" className="text-[22px]">
              Réserver en ligne chez {e.name}
            </h2>
            <p className="mt-1 text-[14px] text-ink-muted">24h/24 · Paiement sur place · Confirmation immédiate</p>
            {services.length === 0 ? (
              <div className="mt-4">
                <StatusMessage tone="pending">Aucune prestation n’est encore proposée à la réservation en ligne.</StatusMessage>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-line rounded-2xl bg-card ring-1 ring-line">
                {services.map((s) => (
                  <li key={s.id} className="flex items-center gap-4 px-4 py-4 md:px-5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[16px] font-semibold text-ink">{s.name}</div>
                      {s.description ? <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-5 text-ink-muted">{s.description}</p> : null}
                    </div>
                    <div className="hidden shrink-0 text-right text-[14px] text-ink-muted sm:block">
                      {formatDuration(s.durationMin)}
                      {s.priceCents > 0 ? <span className="ml-2 font-semibold text-ink">{formatPriceCents(s.priceCents)}</span> : null}
                    </div>
                    <Link href={`${base}?service=${s.id}`} className="btn inline-flex min-h-11 shrink-0 items-center justify-center rounded-button bg-ink px-4 text-[14px] font-semibold text-white">
                      Choisir
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {practitioners.length > 0 ? (
            <section aria-labelledby="equipe-title">
              <h2 id="equipe-title" className="text-[22px]">
                L’équipe
              </h2>
              <ul className="mt-4 grid gap-3 rounded-2xl bg-card p-4 ring-1 ring-line sm:grid-cols-2 md:p-5">
                {practitioners.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span aria-hidden="true" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-bold text-white">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold text-ink">{p.name}</span>
                      {p.roleTitle ? <span className="block text-[13px] text-ink-muted">{p.roleTitle}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {e.description ? (
            <section aria-labelledby="apropos-title">
              <h2 id="apropos-title" className="text-[22px]">
                À propos
              </h2>
              <div className="mt-4 rounded-2xl bg-card p-5 ring-1 ring-line">
                <p className="whitespace-pre-line text-[15px] leading-7 text-ink">{e.description}</p>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section aria-labelledby="horaires-title" className="rounded-2xl bg-card p-5 ring-1 ring-line">
            <h2 id="horaires-title" className="flex items-center gap-2 text-[16px] font-semibold text-ink">
              <Clock aria-hidden="true" className="size-4 text-brand" /> Horaires d’ouverture
            </h2>
            <dl className="mt-3 divide-y divide-line text-[14px]">
              {DAY_ORDER.map((day) => {
                const ranges = byDay.get(day) ?? [];
                const today = day === todayWeekday;
                return (
                  <div key={day} className={cn("flex items-baseline justify-between gap-3 py-2", today && "font-semibold text-ink")}>
                    <dt className={cn("capitalize", !today && "text-ink")}>{frenchWeekdayName(day)}</dt>
                    <dd className={cn("text-right tabular-nums", ranges.length === 0 ? "text-ink-muted" : "text-ink")}>
                      {ranges.length === 0 ? "Fermé" : ranges.map((r) => `${minutesToHHMM(r.startMin)} – ${minutesToHHMM(r.endMin)}`).join(" · ")}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>

          {address || e.phone ? (
            <section aria-labelledby="infos-title" className="rounded-2xl bg-card p-5 ring-1 ring-line">
              <h2 id="infos-title" className="text-[16px] font-semibold text-ink">
                Où nous trouver
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
                          Voir sur la carte
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
        </aside>
      </div>
    </div>
  );
}
