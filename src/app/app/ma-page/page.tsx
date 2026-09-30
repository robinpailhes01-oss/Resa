import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { ActionForm } from "@/components/app/ActionForm";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { CopyField } from "@/components/app/CopyField";
import { TextArea, TextInput } from "@/components/app/Fields";
import { Card, PageHeader } from "@/components/app/PageHeader";
import { PhotoUploader } from "@/components/app/PhotoUploader";
import { ReviewCard, Stars } from "@/components/booking/ReviewCard";
import { Button } from "@/components/ui/Button";
import { offer } from "@/config/offer";
import { pageEditor as t, publicReviewsCopy } from "@/content/fr/app";
import { cn } from "@/lib/cn";
import { formatDuration, formatPriceCents } from "@/lib/time";
import { requireEstablishment } from "@/server/auth/guards";
import { MAX_PHOTOS, listPhotos } from "@/server/app/photos";
import { listReviews } from "@/server/app/reviews";
import { listServices } from "@/server/app/services";
import {
  coverPhotoAction,
  deletePagePhotoAction,
  setReviewHiddenAction,
  syncReviewsAction,
  updateDescriptionAction,
  uploadPhotoAction,
} from "@/server/app/actions/page";
import { isGoogleImportEnabled } from "@/server/google/places";

export const metadata: Metadata = { title: "Ma page" };

export default async function MaPage() {
  const { establishment: e } = await requireEstablishment();
  const [photos, services, reviews] = await Promise.all([listPhotos(e.id), listServices(e.id, true), listReviews(e.id)]);
  const bookingUrl = new URL(`/r/${e.slug}`, offer.siteUrl).toString();
  const googleEnabled = isGoogleImportEnabled();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.title}
        intro={t.intro}
        actions={
          <Button href={`/r/${e.slug}`} variant="secondary" size="compact" target="_blank" rel="noopener">
            {t.view} <ExternalLink aria-hidden="true" />
          </Button>
        }
      />

      <div className="mb-6">
        <CopyField value={bookingUrl} />
      </div>

      {/* Photos */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="heading-3">{t.photos.title}</h2>
            <p className="mt-1 text-[14px] leading-6 text-ink-muted">{t.photos.help(MAX_PHOTOS)}</p>
          </div>
          <PhotoUploader action={uploadPhotoAction} remaining={MAX_PHOTOS - photos.length} />
        </div>
        {photos.length === 0 ? (
          <p className="mt-5 rounded-xl bg-page px-4 py-6 text-center text-[14px] text-ink-muted">{t.photos.empty}</p>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <li key={photo.id} className="overflow-hidden rounded-2xl bg-page ring-1 ring-line">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-0.5 text-[12px] font-semibold text-page">{t.photos.cover}</span>
                  ) : null}
                  {photo.source === "google" ? (
                    <span className="absolute right-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-medium text-ink-muted">{t.photos.fromGoogle}</span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1 p-2">
                  {index > 0 ? (
                    <ConfirmButton action={coverPhotoAction.bind(null, photo.id)} variant="ghost" className="!min-h-8 !px-2.5 !text-[12px]">
                      {t.photos.makeCover}
                    </ConfirmButton>
                  ) : null}
                  <ConfirmButton action={deletePagePhotoAction.bind(null, photo.id)} variant="danger" confirm={t.photos.removeConfirm} className="!min-h-8 !px-2.5 !text-[12px]">
                    {t.photos.remove}
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Présentation */}
      <Card className="mb-6">
        <h2 className="heading-3">{t.about.title}</h2>
        <p className="mb-4 mt-1 text-[14px] text-ink-muted">{t.about.help}</p>
        <ActionForm action={updateDescriptionAction} submitLabel={t.about.save}>
          <TextInput id="bio" name="bio" label={t.about.bioLabel} help={t.about.bioHelp} maxLength={160} defaultValue={e.bio ?? ""} placeholder={t.about.bioPlaceholder} />
          <TextArea id="description" name="description" label={t.about.label} maxLength={600} rows={5} defaultValue={e.description ?? ""} placeholder={t.about.placeholder} />
        </ActionForm>
      </Card>

      {/* Prestations */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="heading-3">{t.services.title}</h2>
            <p className="mt-1 text-[14px] text-ink-muted">{t.services.help}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href="/app/prestations/nouvelle" size="compact">
              <Plus aria-hidden="true" /> {t.services.add}
            </Button>
            <Button href="/app/prestations" size="compact" variant="secondary">
              {t.services.manage}
            </Button>
          </div>
        </div>
        {services.length === 0 ? (
          <p className="mt-5 rounded-xl bg-page px-4 py-6 text-center text-[14px] text-ink-muted">{t.services.empty}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/app/prestations/${s.id}`} className="group flex items-center justify-between gap-4 py-3">
                  {s.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.photoUrl} alt="" loading="lazy" className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-line" />
                  ) : (
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-page text-center text-[10px] leading-3 text-ink-muted ring-1 ring-line">{t.services.addPhoto}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[15px] font-medium", s.active ? "text-ink" : "text-ink-muted")}>{s.name}</span>
                    <span className="block text-[13px] text-ink-muted">
                      {formatDuration(s.durationMin)}
                      {!s.active ? ` · ${t.services.hiddenTag}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-[15px] font-semibold tabular-nums text-ink">{s.priceCents > 0 ? formatPriceCents(s.priceCents) : "—"}</span>
                    <Pencil aria-hidden="true" className="size-4 text-ink-muted transition-colors group-hover:text-brand" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Avis */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="heading-3">{t.reviews.title}</h2>
            <p className="mt-1 text-[14px] leading-6 text-ink-muted">{t.reviews.help}</p>
            {e.googleRating !== null ? (
              <p className="mt-3 flex items-center gap-2 text-[14px] text-ink">
                <Stars rating={e.googleRating} />
                <span className="font-semibold">{e.googleRating.toLocaleString("fr-FR")}</span>
                <span className="text-ink-muted">{publicReviewsCopy.basedOn(e.googleRatingCount ?? 0)}</span>
              </p>
            ) : null}
          </div>
          {googleEnabled && e.googlePlaceId ? (
            <ActionForm action={syncReviewsAction} submitLabel={t.reviews.sync} pendingLabel={t.reviews.syncing} variant="secondary" className="flex max-w-xs flex-col gap-3">
              {null}
            </ActionForm>
          ) : (
            <Button href="/app/parametres" size="compact" variant="secondary">
              {t.reviews.linkListing}
            </Button>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="mt-5 rounded-xl bg-page px-4 py-6 text-center text-[14px] text-ink-muted">{t.reviews.empty}</p>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className={cn("flex flex-col gap-2", r.hidden && "opacity-60")}>
                <ReviewCard review={r} />
                <div className="flex items-center justify-between gap-3 px-1">
                  <span className={cn("text-[12px] font-semibold", r.hidden ? "text-ink-muted" : "text-success")}>{r.hidden ? t.reviews.hidden : t.reviews.shown}</span>
                  <ConfirmButton action={setReviewHiddenAction.bind(null, r.id, !r.hidden)} variant="ghost" className="!min-h-8 !px-2.5 !text-[12px]">
                    {r.hidden ? t.reviews.show : t.reviews.hide}
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-5 text-[13px] leading-5 text-ink-muted">
          {t.reviews.googleNote} {t.reviews.askMore}
        </p>
      </Card>
    </div>
  );
}
