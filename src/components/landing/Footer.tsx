import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { offer } from "@/config/offer";
import { footer } from "@/content/fr/landing";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-page">
      <div className="container-page flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between">
        <Logo height={22} />
        <nav aria-label="Liens de pied de page">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            {footer.legalLinks.map((link) => (
              <li key={link.href}>
                {link.href.startsWith("#") ? (
                  <a href={link.href} className="text-ink-muted underline-offset-4 hover:text-brand hover:underline">
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className="text-ink-muted underline-offset-4 hover:text-brand hover:underline">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
            {offer.supportEmail ? (
              <li>
                <a href={`mailto:${offer.supportEmail}`} className="text-ink-muted underline-offset-4 hover:text-brand hover:underline">
                  {footer.contactLabel}
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
        <p className="text-[13px] text-ink-muted">{footer.tagline}</p>
      </div>
      <div className="container-page pb-6 text-[12px] text-ink-muted/80">{footer.copyright(year)}</div>
    </footer>
  );
}
