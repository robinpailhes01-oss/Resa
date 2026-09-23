import { offer } from "@/config/offer";
import { formatMonthlyPriceExVatCompact } from "@/lib/format";

const price = formatMonthlyPriceExVatCompact(offer.monthlyPriceExVat);
const contact = offer.supportEmail ? ` Écrivez-nous à ${offer.supportEmail}.` : " Nous vous contacterons par email.";

/**
 * Bandeau d'accès de l'espace pro (essai gratuit, abonnement).
 * Le paiement en ligne n'est pas encore branché : l'activation se fait avec
 * nous, par email, et aucune facturation n'est déclenchée sans prévenir.
 */
export const accessNotice = {
  trial: (daysLeft: number, endDate: string) => ({
    title: daysLeft > 1 ? `Essai gratuit · ${daysLeft} jours restants` : "Essai gratuit · dernier jour",
    text: `Votre essai se termine le ${endDate}. Ensuite, l’abonnement est de ${price}. Aucune carte bancaire n’est demandée pendant l’essai et rien n’est prélevé sans votre accord.${contact}`,
  }),
  expired: {
    title: "Essai gratuit terminé",
    text: `Votre page de réservation en ligne est suspendue et vos clientes ne peuvent plus réserver. Votre agenda et vos données restent accessibles. Pour continuer avec ${offer.brandName} (${price}), activez votre abonnement avec nous.${contact}`,
  },
  cancelled: {
    title: "Abonnement arrêté",
    text: `Votre page de réservation en ligne est suspendue. Votre agenda et vos données restent accessibles. Pour reprendre, contactez-nous.${contact}`,
  },
  active: {
    title: "Abonnement actif",
    text: "Le paiement en ligne n’est pas encore activé : nous vous préviendrons par email avant toute mise en place de la facturation.",
  },
};
