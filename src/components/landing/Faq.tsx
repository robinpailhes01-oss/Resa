import { Section } from "@/components/ui/Section";
import { byMode, faq } from "@/content/fr/landing";
import { FaqItem } from "./FaqItem";

export function Faq() {
  const items = byMode(faq.items);
  return (
    <Section id="faq" labelledBy="faq-title" className="!pt-8 md:!pt-14">
      <div className="mx-auto max-w-2xl">
        <h2 id="faq-title" className="heading-2 mb-6 text-center md:mb-8">
          {faq.title}
        </h2>
        <ul className="border-t border-line">
          {items.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </ul>
      </div>
    </Section>
  );
}
