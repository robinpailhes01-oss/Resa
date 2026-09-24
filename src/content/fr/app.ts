import { offer } from "@/config/offer";
import { formatMonthlyPriceExVatCompact } from "@/lib/format";

const price = formatMonthlyPriceExVatCompact(offer.monthlyPriceExVat);

/**
 * Bandeau d'accès de l'espace pro (essai gratuit, abonnement).
 * Le paiement en ligne n'est pas encore branché : l'activation se fait avec
 * nous, par email, et aucune facturation n'est déclenchée sans prévenir.
 */
export const accessNotice = {
  trial: (daysLeft: number, endDate: string) => ({
    title: daysLeft > 1 ? `Essai gratuit · ${daysLeft} jours restants` : "Essai gratuit · dernier jour",
    text: `Votre essai se termine le ${endDate}. Ensuite, l’abonnement est de ${price}, payable par carte depuis votre espace. Rien n’est prélevé sans votre accord.`,
  }),
  expired: {
    title: "Essai gratuit terminé",
    text: `Votre page de réservation en ligne est suspendue et vos clientes ne peuvent plus réserver. Votre agenda et vos données restent accessibles. Pour continuer avec ${offer.brandName} (${price}), souscrivez l’abonnement : paiement sécurisé par carte, réactivation immédiate.`,
  },
  cancelled: {
    title: "Abonnement arrêté",
    text: `Votre page de réservation en ligne est suspendue. Votre agenda et vos données restent accessibles. Pour reprendre, contactez-nous${offer.supportEmail ? ` à ${offer.supportEmail}` : ""}.`,
  },
  active: (paidUntil: string | null) => ({
    title: "Abonnement actif",
    text: paidUntil ? `Votre abonnement est à jour jusqu’au ${paidUntil}. Le renouvellement vous sera proposé quelques jours avant.` : "Votre abonnement est actif.",
  }),
  pastDue: (paidUntil: string | null) => ({
    title: "Paiement en attente",
    text: `${paidUntil ? `Votre période payée s’est terminée le ${paidUntil}. ` : ""}Votre page de réservation en ligne est suspendue jusqu’au règlement du mois en cours (${price}). Votre agenda et vos données restent accessibles.`,
  }),
  cta: "Gérer mon abonnement",
};

/** Bloc d'import de la fiche Google à l'onboarding. */
export const googleImport = {
  title: "Gagnez du temps : importez votre fiche Google",
  intro: "Nom, adresse, téléphone, activité, horaires, présentation et photos sont récupérés depuis votre fiche Google. Vous pourrez tout ajuster ensuite.",
  label: "Nom de votre établissement et ville, ou lien de votre fiche Google",
  placeholder: "Ex. Maison Alba Montpellier, ou le lien Partager de Google Maps",
  button: "Rechercher",
  searching: "Recherche…",
  resultsLabel: "Fiches trouvées",
  empty: "Aucune fiche trouvée. Essayez avec le nom exact suivi de la ville (ex. « Maison Alba Montpellier »), ou collez le lien « Partager » de votre fiche dans Google Maps.",
  applied: "Fiche importée :",
  hoursImported: "horaires d’ouverture récupérés",
  photosImported: "photos",
  remove: "Retirer",
};

/** Widget de retours dans l'espace pro. */
export const feedbackWidget = {
  open: "Un avis ?",
  title: "Aidez-nous à améliorer Reso",
  intro: "Une idée, un blocage, un détail qui vous agace ? Dites-le nous, nous lisons tout.",
  moods: [
    { value: "happy", label: "Ça me plaît", emoji: "😊" },
    { value: "neutral", label: "Une idée", emoji: "💡" },
    { value: "sad", label: "Un problème", emoji: "😕" },
  ] as const,
  placeholder: "Votre message…",
  send: "Envoyer",
  sending: "Envoi…",
  thanks: "Merci ! Votre retour est bien arrivé.",
  again: "Envoyer un autre retour",
  close: "Fermer",
  tooShort: "Écrivez au moins quelques mots.",
};

/** Bloc Google dans les Paramètres. */
export const googleSettings = {
  title: "Ma fiche Google",
  introLinked: (rating: number | null, count: number | null, syncedAt: string | null) =>
    `Fiche reliée${rating !== null ? ` · note ${rating.toLocaleString("fr-FR")} ★ (${count ?? 0} avis)` : ""}${syncedAt ? ` · mise à jour le ${syncedAt}` : ""}. La note et le nombre d’avis Google s’affichent sur votre page de réservation, et l’email de demande d’avis renvoie vers votre fiche.`,
  introUnlinked: "Reliez votre fiche Google pour afficher votre note et vos avis sur votre page de réservation, récupérer vos photos, votre présentation et vos horaires, et envoyer vos clientes déposer un avis Google.",
  search: "Rechercher ma fiche",
  refresh: "Actualiser depuis Google",
  options: {
    photos: "Ajouter les photos de la fiche (6 maximum au total)",
    description: "Remplacer ma présentation par celle de Google",
    hours: "Remplacer mes horaires par ceux de Google",
  },
  submit: "Relier cette fiche",
  found: "Fiche choisie :",
  change: "Changer",
};
