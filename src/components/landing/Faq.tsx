import { FaqAccordion } from "@/components/ui/faq-chat-accordion";
import { Section } from "@/components/ui/Section";
import { byMode, faq } from "@/content/fr/landing";

export function Faq() {
  const items = byMode(faq.items).map((item, index) => ({ id: index + 1, ...item }));
  return (
    <Section id="faq" labelledBy="faq-title" className="!pt-8 md:!pt-14">
      <div className="mx-auto max-w-2xl">
        <h2 id="faq-title" className="heading-2 mb-8 text-center md:mb-10">
          {faq.title}
        </h2>
        <FaqAccordion data={items} timestamp={byMode(faq.timestamp)} className="max-w-[700px]" />
      </div>
    </Section>
  );
}
