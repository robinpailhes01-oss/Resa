import { offer } from "@/config/offer";

/**
 * Lien pour joindre l'équipe : WhatsApp (message pré-rempli) si un numéro est
 * configuré, sinon téléphone, sinon email de contact ; null si rien n'est configuré.
 */
export function teamContactHref(message: string, subject: string): string | null {
  if (offer.demoWhatsapp) return `https://wa.me/${offer.demoWhatsapp}?text=${encodeURIComponent(message)}`;
  if (offer.supportPhone) return `tel:${offer.supportPhone.replace(/[^+0-9]/g, "")}`;
  if (offer.supportEmail) return `mailto:${offer.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  return null;
}
