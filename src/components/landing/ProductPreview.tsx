import { AgendaPreview } from "@/components/previews/AgendaPreview";
import { BookingPreview } from "@/components/previews/BookingPreview";
import { EmailsPreview } from "@/components/previews/EmailsPreview";
import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, preview } from "@/content/fr/landing";
import { ProductTabs } from "./ProductTabs";

export function ProductPreview() {
  const [agenda, booking, emails] = preview.tabs;
  return (
    <Section id="apercu" labelledBy="apercu-title" tone="card">
      <SectionHeading id="apercu-title" title={preview.title} intro={preview.intro} />
      <div className="mx-auto max-w-5xl">
        <ProductTabs
          panels={{
            agenda: <AgendaPreview alt={agenda.alt} />,
            booking: <BookingPreview alt={booking.alt} />,
            emails: <EmailsPreview alt={emails.alt} />,
          }}
        />
        <p className="mt-8 text-center text-small text-ink-muted">{byMode(preview.prelaunchNote)}</p>
      </div>
    </Section>
  );
}
