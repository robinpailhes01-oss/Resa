import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { offer } from "@/config/offer";
import { footer } from "@/content/fr/landing";

/** Pied de page léger : logo, liens de sections, liens légaux, signature. */
export function Footer() {
  const year = new Date().getFullYear();
  const linkClass = "inline-flex min-h-11 items-center text-[13px] text-ink-muted underline-offset-4 hover:text-ink hover:underline";
  return (
    <footer className="border-t border-line bg-page">
      <div className="container-page flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/" aria-label={`${offer.brandName} – accueil`} className="inline-flex w-fit rounded-md">
            <Logo height={24} />
          </Link>
          <p className="text-[13px] text-ink-muted">{footer.tagline}</p>
        </div>
        <nav aria-label="Liens de pied de page">
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
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
      <div className="container-page pb-8 text-[12px] text-ink-muted/80">{footer.copyright(year)}</div>
    </footer>
  );
}
