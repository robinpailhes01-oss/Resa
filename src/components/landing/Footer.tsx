import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { offer } from "@/config/offer";
import { footer } from "@/content/fr/landing";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-brand text-white">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo height={24} tone="white" />
          <p className="mt-3 text-white/70">{footer.tagline}</p>
        </div>
        <nav aria-label="Liens de pied de page">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
            {footer.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="font-medium text-white/90 underline-offset-4 hover:text-white hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
            {offer.supportEmail ? (
              <li>
                <a href={`mailto:${offer.supportEmail}`} className="font-medium text-white/90 underline-offset-4 hover:text-white hover:underline">
                  {footer.contactLabel}
                </a>
              </li>
            ) : null}
            {footer.legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-medium text-white/90 underline-offset-4 hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container-page border-t border-white/10 py-5 text-small text-white/60">{footer.copyright(year)}</div>
    </footer>
  );
}
