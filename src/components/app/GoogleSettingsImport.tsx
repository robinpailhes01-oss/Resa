"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { MapPin, Search, Star } from "lucide-react";
import { ActionForm } from "@/components/app/ActionForm";
import { Card } from "@/components/app/PageHeader";
import { Checkbox } from "@/components/app/Fields";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { googleImport, googleSettings } from "@/content/fr/app";
import type { GooglePlaceCandidate } from "@/lib/google-places";
import { importGooglePlaceAction, searchGooglePlacesAction } from "@/server/app/actions/google-import";

const control =
  "block w-full min-h-12 rounded-field border border-control bg-card px-4 text-[16px] leading-6 text-ink placeholder:text-ink-muted/70 focus:border-brand focus:outline-none focus-visible:outline-3 focus-visible:outline-brand focus-visible:outline-offset-2";

type Props = {
  linked: { rating: number | null; ratingCount: number | null; syncedAt: string | null } | null;
  defaultQuery: string;
};

/** Paramètres → « Ma fiche Google » : recherche, choix de la fiche, options d'import. */
export function GoogleSettingsImport({ linked, defaultQuery }: Props) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<GooglePlaceCandidate[] | null>(null);
  const [chosen, setChosen] = useState<GooglePlaceCandidate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const search = () => {
    setError(null);
    setChosen(null);
    startTransition(async () => {
      const outcome = await searchGooglePlacesAction(query);
      if (outcome.error) {
        setError(outcome.error);
        setResults(null);
      } else {
        setResults(outcome.results ?? []);
        if (outcome.results?.length === 1) setChosen(outcome.results[0]);
      }
    });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      search();
    }
  };

  return (
    <Card className="mb-6">
      <h2 className="text-[18px]">{googleSettings.title}</h2>
      <p className="mt-1 text-[14px] leading-6 text-ink-muted">{linked ? googleSettings.introLinked(linked.rating, linked.ratingCount, linked.syncedAt) : googleSettings.introUnlinked}</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="google-settings-query" className="sr-only">
          {googleImport.label}
        </label>
        <input id="google-settings-query" type="search" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown} placeholder={googleImport.placeholder} autoComplete="off" className={control} />
        <button type="button" onClick={search} disabled={pending || query.trim().length < 3} aria-busy={pending} className="btn inline-flex min-h-12 items-center justify-center gap-2 rounded-button bg-ink px-5 text-[15px] font-semibold text-white disabled:opacity-60">
          <Search aria-hidden="true" className="size-4" />
          {pending ? googleImport.searching : linked ? googleSettings.refresh : googleSettings.search}
        </button>
      </div>
      {error ? (
        <div className="mt-3">
          <StatusMessage tone="error">{error}</StatusMessage>
        </div>
      ) : null}
      {results && results.length === 0 ? <p className="mt-3 text-[14px] text-ink-muted">{googleImport.empty}</p> : null}
      {results && results.length > 1 && !chosen ? (
        <ul className="mt-3 flex flex-col gap-2" aria-label={googleImport.resultsLabel}>
          {results.map((place) => (
            <li key={place.placeId}>
              <button type="button" onClick={() => setChosen(place)} className="flex w-full items-start gap-3 rounded-xl border border-line bg-card px-4 py-3 text-left transition-colors hover:border-brand">
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

      {chosen ? (
        <div className="mt-4 rounded-xl border border-line bg-soft-tint/50 p-4">
          <p className="text-[14px] text-ink">
            <span className="font-semibold">{googleSettings.found}</span> {chosen.name}
            {chosen.rating !== null ? (
              <span className="ml-2 inline-flex items-center gap-1 text-ink-muted">
                <Star aria-hidden="true" className="size-3.5 fill-accent text-accent" /> {chosen.rating.toLocaleString("fr-FR")} · {chosen.ratingCount ?? 0} avis
              </span>
            ) : null}
            {results && results.length > 1 ? (
              <button type="button" onClick={() => setChosen(null)} className="ml-3 text-[13px] font-medium text-brand underline-offset-4 hover:underline">
                {googleSettings.change}
              </button>
            ) : null}
          </p>
          <ActionForm action={importGooglePlaceAction} submitLabel={googleSettings.submit} pendingLabel="Import…" className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="candidate" value={JSON.stringify(chosen)} />
            <Checkbox id="withPhotos" name="withPhotos" label={googleSettings.options.photos} defaultChecked={chosen.photoNames.length > 0} disabled={chosen.photoNames.length === 0} />
            <Checkbox id="withDescription" name="withDescription" label={googleSettings.options.description} defaultChecked={false} disabled={!chosen.description} />
            <Checkbox id="withHours" name="withHours" label={googleSettings.options.hours} defaultChecked={false} disabled={!chosen.hours} />
          </ActionForm>
        </div>
      ) : null}
    </Card>
  );
}
