"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { Check, MapPin, Search, X } from "lucide-react";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { googleImport } from "@/content/fr/app";
import { cn } from "@/lib/cn";
import type { GooglePlaceCandidate } from "@/lib/google-places";
import { searchGooglePlacesAction } from "@/server/app/actions/google-import";

const control =
  "block w-full min-h-12 rounded-field border border-control bg-card px-4 text-[16px] leading-6 text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none focus-visible:outline-3 focus-visible:outline-brand focus-visible:outline-offset-2";

function setField(id: string, value: string | null) {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
  if (!el || value === null) return;
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Bloc « Importer ma fiche Google » placé dans le formulaire d'onboarding :
 * recherche la fiche, puis préremplit les champs (nom, adresse, téléphone,
 * activité) et transmet les horaires au serveur via un champ caché.
 */
export function GoogleImport() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GooglePlaceCandidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<GooglePlaceCandidate | null>(null);
  const [pending, startTransition] = useTransition();

  const search = () => {
    setError(null);
    startTransition(async () => {
      const outcome = await searchGooglePlacesAction(query);
      if (outcome.error) {
        setError(outcome.error);
        setResults(null);
      } else {
        setResults(outcome.results ?? []);
      }
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      search();
    }
  };

  const apply = (place: GooglePlaceCandidate) => {
    setField("name", place.name);
    setField("addressLine", place.addressLine ?? "");
    setField("postalCode", place.postalCode ?? "");
    setField("city", place.city ?? "");
    setField("phone", place.phone ?? "");
    setField("businessType", place.businessType);
    setApplied(place);
    setResults(null);
  };

  const clear = () => setApplied(null);

  return (
    <section aria-labelledby="google-import-title" className="rounded-2xl border border-line bg-soft-tint/50 p-4 md:p-5">
      <h2 id="google-import-title" className="text-[16px] font-semibold text-ink">
        {googleImport.title}
      </h2>
      <p className="mt-1 text-[14px] leading-6 text-ink-muted">{googleImport.intro}</p>

      {applied ? (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-success/30 bg-success-tint px-4 py-3 text-[14px] leading-6 text-ink">
          <p>
            <Check aria-hidden="true" className="mr-1.5 inline size-4 text-success" />
            <span className="font-semibold">{googleImport.applied}</span> {applied.name}
            {applied.hours ? ` · ${googleImport.hoursImported}` : ""}
            {applied.photoNames.length > 0 ? ` · ${applied.photoNames.length} ${googleImport.photosImported}` : ""}
          </p>
          <button type="button" onClick={clear} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[13px] font-medium text-ink-muted hover:text-ink">
            <X aria-hidden="true" className="size-4" /> {googleImport.remove}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="google-query" className="sr-only">
            {googleImport.label}
          </label>
          <input
            id="google-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={googleImport.placeholder}
            autoComplete="off"
            className={control}
          />
          <button
            type="button"
            onClick={search}
            disabled={pending || query.trim().length < 3}
            aria-busy={pending}
            className="btn inline-flex min-h-12 items-center justify-center gap-2 rounded-button bg-ink px-5 text-[15px] font-semibold text-white disabled:opacity-60"
          >
            <Search aria-hidden="true" className="size-4" />
            {pending ? googleImport.searching : googleImport.button}
          </button>
        </div>
      )}

      {error ? (
        <div className="mt-3">
          <StatusMessage tone="error">{error}</StatusMessage>
        </div>
      ) : null}

      {results && results.length === 0 ? <p className="mt-3 text-[14px] text-ink-muted">{googleImport.empty}</p> : null}

      {results && results.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2" aria-label={googleImport.resultsLabel}>
          {results.map((place) => (
            <li key={place.placeId}>
              <button
                type="button"
                onClick={() => apply(place)}
                className={cn("flex w-full items-start gap-3 rounded-xl border border-line bg-card px-4 py-3 text-left transition-colors hover:border-brand")}
              >
                <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-ink">{place.name}</span>
                  <span className="block text-[13px] leading-5 text-ink-muted">{place.formattedAddress}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input type="hidden" name="googlePlaceId" value={applied?.placeId ?? ""} />
      <input type="hidden" name="googleHours" value={applied?.hours ? JSON.stringify(applied.hours) : ""} />
      <input type="hidden" name="googleDescription" value={applied?.description ?? ""} />
      <input type="hidden" name="googleMeta" value={applied ? JSON.stringify({ rating: applied.rating, ratingCount: applied.ratingCount, mapsUrl: applied.mapsUrl }) : ""} />
      <input type="hidden" name="googlePhotos" value={applied && applied.photoNames.length > 0 ? JSON.stringify(applied.photoNames) : ""} />
    </section>
  );
}
