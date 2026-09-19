import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, faq } from "@/content/fr/landing";
import { FaqItem } from "./FaqItem";

export function Faq() {
  const items = byMode(faq.items);
  return (
    <Section id="faq" labelledBy="faq-title" tone="page">
      <SectionHeading id="faq-title" title={faq.title} />
      <ul className="mx-auto max-w-3xl border-t border-line">
        {items.map((item) => (
          <FaqItem key={item.question} question={item.question} answer={item.answer} />
        ))}
      </ul>
    </Section>
  );
}
