"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface FaqChatItem {
  id: number | string;
  question: string;
  answer: ReactNode;
  /** Petite icône ou émoji affiché à côté de la question. */
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

type FaqAccordionProps = {
  data: FaqChatItem[];
  className?: string;
  questionClassName?: string;
  answerClassName?: string;
  /** Petit horodatage centré, comme dans une conversation. */
  timestamp?: string;
  /** Une seule réponse ouverte à la fois (défaut) ou plusieurs. */
  multiple?: boolean;
};

/**
 * FAQ en forme de conversation : la question est un message reçu, la réponse
 * un message envoyé qui se déplie en dessous. Une seule dépendance : React.
 * Les réponses restent dans le HTML ; sans JavaScript elles sont visibles.
 */
export function FaqAccordion({ data, className, questionClassName, answerClassName, timestamp, multiple = false }: FaqAccordionProps) {
  const [open, setOpen] = useState<Set<FaqChatItem["id"]>>(() => new Set());
  const baseId = useId();

  const toggle = (id: FaqChatItem["id"]) =>
    setOpen((current) => {
      const next = new Set(multiple ? current : []);
      if (current.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={cn("mx-auto w-full", className)}>
      {timestamp ? <p className="mb-4 text-center text-[12px] text-ink-muted">{timestamp}</p> : null}
      <ul className="flex flex-col gap-3">
        {data.map((item) => {
          const isOpen = open.has(item.id);
          const panelId = `${baseId}-${item.id}`;
          const buttonId = `${panelId}-question`;
          return (
            <li key={item.id} className="flex flex-col gap-2">
              <h3 className="max-w-[88%] text-[15px] leading-6 md:max-w-[80%] md:text-[16px]">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "group inline-flex min-h-11 items-center gap-2.5 rounded-2xl rounded-bl-md border border-line bg-card px-4 py-2.5 text-left font-medium text-ink shadow-card transition-colors hover:border-ink/20",
                    isOpen && "border-ink/20",
                    questionClassName,
                  )}
                >
                  {item.icon && item.iconPosition !== "right" ? <span aria-hidden="true" className="shrink-0 text-[15px]">{item.icon}</span> : null}
                  <span>{item.question}</span>
                  {item.icon && item.iconPosition === "right" ? <span aria-hidden="true" className="shrink-0 text-[15px]">{item.icon}</span> : null}
                  <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 text-ink-muted transition-transform duration-300", isOpen && "rotate-180")} />
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} data-open={isOpen} className="faq-panel">
                <div className="flex justify-end">
                  <p className={cn("max-w-[88%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-[15px] leading-6 text-white md:max-w-[80%] md:text-[16px]", answerClassName)}>
                    {item.answer}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
