import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { offer } from "@/config/offer";
import { byMode, cta, footer } from "@/content/fr/landing";
import { CtaLink } from "./CtaLink";
import { SocialLinks } from "@/components/ui/SocialLinks";

/**
 * Fin de page : le visuel de marque recomposé (« reso® », filet, « BEAUTY BUSINESS
 * SIMPLIFIED », ciseaux sur la pierre) et un dernier appel sur la landing (`closing`),
 * puis les liens, sur toutes les pages.
 */
export function Footer({ closing = false }: { closing?: boolean }) {
  const year = new Date().getFullYear();
  const primary = byMode(cta.primary);
  const linkClass =
    "inline-flex min-h-11 items-center text-[13px] text-ink-muted underline-offset-4 hover:text-ink hover:underline";
  return (
    <footer
      className={
        closing ? "bg-page pt-6 md:pt-10" : "border-t border-line bg-page"
      }
    >
      {closing ? (
        <div className="container-page !px-3 sm:!px-5 md:!px-8">
          <section
            aria-labelledby="fin-title"
            className="powder-panel grain relative isolate overflow-hidden rounded-[22px] md:rounded-[28px]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] bg-[radial-gradient(ellipse_at_50%_35%,rgba(38,52,66,0.3),transparent_70%)]"
            />
            <div className="relative z-10 flex flex-col items-center px-5 pb-4 pt-14 text-center md:pt-20">
              <Logo
                tone="white"
                registered
                height={72}
                className="h-14 w-auto md:h-[88px]"
                title={offer.brandName}
              />
              <span aria-hidden="true" className="rule-short mt-6 text-page" />
              <p className="eyebrow mt-5 !text-page/90">{footer.tagline}</p>
              <h2
                id="fin-title"
                className="heading-2 mt-10 max-w-[20ch] !text-[30px] md:!text-[44px]"
              >
                {footer.closing.title}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-6 text-page md:text-[16px]">
                {footer.closing.text}
              </p>
              <CtaLink
                href={primary.href}
                placement="footer"
                signup={offer.launchMode === "live"}
                variant="inverse"
                className="mt-7"
              >
                {primary.label}
              </CtaLink>
            </div>
            <Image
              src="/brand/ciseaux.webp"
              alt={footer.closing.imageAlt}
              width={974}
              height={494}
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="blend-top -mt-4 h-auto w-full md:-mt-20"
            />
          </section>
        </div>
      ) : null}

      <div className="container-page flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          aria-label={`${offer.brandName} – accueil`}
          className="inline-flex w-fit rounded-md"
        >
          <Logo height={22} />
        </Link>
        <nav aria-label="Liens de pied de page">
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <a href={footer.proLink.href} className={`${linkClass} font-semibold !text-ink`}>
                {footer.proLink.label}
              </a>
            </li>
            {footer.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
            {footer.legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
            {offer.supportEmail ? (
              <li>
                <a href={`mailto:${offer.supportEmail}`} className={linkClass}>
                  {footer.contactLabel}
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
      <div className="container-page flex flex-col gap-4 pb-8 text-[12px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{footer.copyright(year)}</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-ink">{footer.madeIn}</span>
        </p>
        <SocialLinks withLabel className="-ml-2 sm:ml-0" />
      </div>
    </footer>
  );
}
