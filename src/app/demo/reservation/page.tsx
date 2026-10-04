import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BookingShell } from "@/components/booking/BookingShell";
import { EstablishmentPage } from "@/components/booking/EstablishmentPage";
import { Button } from "@/components/ui/Button";
import { offer } from "@/config/offer";
import { demoCategories, demoCopy, demoEstablishment, demoHours, demoPhotos, demoPractitioners, demoReviews, demoServices } from "@/content/fr/demo";
import { byMode, cta } from "@/content/fr/landing";
import { formatPriceCents } from "@/lib/time";
import { describePaymentRule } from "@/lib/booking-payment";
import { DemoCallCard } from "@/components/landing/DemoCallCard";

export const metadata: Metadata = {
  title: demoCopy.title,
  description: demoCopy.banner,
  robots: { index: false, follow: true },
};

/** Démo publique : la page de réservation d'un salon fictif, telle que la voient les clients. */
export default async function DemoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const primary = byMode(cta.primary);
  const chosen = typeof query.service === "string" ? demoServices.find((s) => s.id === query.service) : undefined;

  return (
    <>
      <div className="bg-ink text-page">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 text-[13px]">
          <p className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="size-4 shrink-0 text-accent" />
            {demoCopy.banner}
          </p>
          <Link href={primary.href} className="rounded-full bg-page px-3.5 py-1.5 text-[13px] font-semibold text-ink hover:bg-card">
            {offer.launchMode === "live" ? demoCopy.cta : primary.label}
          </Link>
        </div>
      </div>
      <BookingShell establishment={demoEstablishment} hideTitle>
        {chosen ? (
          <div className="mx-auto max-w-xl rounded-[24px] bg-card p-6 text-center ring-1 ring-line md:p-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {chosen.name} · {formatPriceCents(chosen.priceCents)}
            </p>
            <h1 className="mt-3 text-[26px] leading-8">{demoCopy.nextStep.title}</h1>
            <p className="mt-3 text-[15px] leading-6 text-ink-muted">{demoCopy.nextStep.text}</p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button href={primary.href}>{offer.launchMode === "live" ? demoCopy.cta : primary.label}</Button>
              <Button href="/demo/reservation" variant="ghost">
                <ArrowLeft aria-hidden="true" /> {demoCopy.nextStep.back}
              </Button>
            </div>
          </div>
        ) : (
          <EstablishmentPage
            establishment={demoEstablishment}
            services={demoServices}
            categories={demoCategories}
            practitioners={demoPractitioners}
            hours={demoHours}
            photos={demoPhotos}
            base="/demo/reservation"
            todayWeekday={new Date().getDay()}
            paymentLabel={describePaymentRule({ mode: "deposit", depositKind: "percent", depositValue: 30 }, formatPriceCents)}
            reviews={demoReviews}
          />
        )}
        <DemoCallCard className="mx-auto mt-10 max-w-xl" />
      </BookingShell>
    </>
  );
}
