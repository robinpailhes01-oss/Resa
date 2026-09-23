import { FaqAccordion } from "@/components/ui/faq-chat-accordion";
import { Section } from "@/components/ui/Section";
import { byMode, faq } from "@/content/fr/landing";

export function Faq() {
  const items = byMode(faq.items).map((item, index) => ({ id: index + 1, ...item }));
  return (
    <Section id="faq" labelledBy="faq-title" className="!pt-4 md:!pt-8">
      <div className="mx-auto max-w-2xl">
        <div className="reveal reveal-blur mb-8 flex flex-col items-center gap-3 text-center md:mb-10">
          <p className="eyebrow">{faq.label}</p>
          <h2 id="faq-title" className="heading-2">
            {faq.title}
          </h2>
        </div>
        <FaqAccordion data={items} timestamp={byMode(faq.timestamp)} className="max-w-[700px]" />
      </div>
    </Section>
  );
}
