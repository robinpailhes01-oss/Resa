import Image from "next/image";
import { Check, Phone } from "lucide-react";
import { setupCall as t } from "@/content/fr/landing";
import { teamContactHref } from "@/lib/contact";

/** « Pas le temps ? On vous installe tout » : un appel avec l'équipe pour démarrer. */
export function SetupCall() {
  const href = teamContactHref(t.whatsappMessage, t.emailSubject);
  if (!href) return null;
  return (
    <section id="installation" aria-labelledby="installation-title" className="pb-4 md:pb-8">
      <div className="container-page">
        <div className="reveal panel-dark grain relative grid overflow-hidden rounded-[22px] text-page md:grid-cols-12 md:rounded-[28px]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-9 md:col-span-7 md:px-10 md:py-12">
            <p className="eyebrow !text-page/75">{t.eyebrow}</p>
            <h2 id="installation-title" className="heading-2 mt-3 max-w-[16ch] !text-page">
              {t.title}
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-page/90 md:text-[16px] md:leading-7">{t.text}</p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {t.points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-[15px] text-page">
                  <span aria-hidden="true" className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-page/15">
                    <Check className="size-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn inline-flex min-h-12 items-center gap-2 rounded-button bg-page px-6 text-[15px] font-semibold text-ink shadow-[0_8px_24px_-12px_rgba(20,28,38,0.5)] hover:bg-card"
              >
                <Phone aria-hidden="true" className="size-[18px]" /> {t.button}
              </a>
              <span className="text-[14px] text-page/80">{t.note}</span>
            </div>
          </div>
          <div className="relative md:col-span-5">
            <Image src="/demo/salon.webp" alt="" width={1269} height={952} sizes="(min-width: 768px) 40vw, 100vw" className="h-full max-h-[320px] w-full object-cover md:max-h-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
