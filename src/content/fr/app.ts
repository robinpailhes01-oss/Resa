import { offer } from "@/config/offer";

const fee = `${offer.platformFeePercent.toLocaleString("fr-FR")} %`;
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

/** Page Paiements de l'espace pro (Mollie Connect : acompte ou paiement intégral à la réservation). */
export const paymentsPage = {
  title: "Paiements",
  intro: "Demandez un acompte ou le paiement complet au moment de la réservation. L’argent arrive directement sur votre compte Mollie.",
  unavailable: {
    title: "Bientôt disponible",
    text: "L’encaissement en ligne sera activé très prochainement sur votre espace. Nous vous préviendrons par email.",
  },
  connect: {
    eyebrow: "Encaissement en ligne",
    title: "Reliez votre compte Mollie",
    text: "Mollie est un prestataire de paiement agréé. Vos clients paient par carte, Apple Pay ou virement instantané, et l’argent est versé sur votre compte bancaire par Mollie.",
    points: [
      "Moins de rendez-vous oubliés : un acompte engage vos clients.",
      offer.platformFeePercent > 0
        ? `Commission ${offer.brandName} de ${fee} par paiement encaissé, en plus des frais Mollie. Rien sur les rendez-vous payés sur place.`
        : `Aucune commission ${offer.brandName} : seuls les frais Mollie s’appliquent, par transaction.`,
      "Pas encore de compte Mollie ? Vous le créez en quelques minutes pendant la connexion.",
    ],
    button: "Connecter mon compte Mollie",
    ownerOnly: "Seul le propriétaire du compte Reso peut relier le compte Mollie qui reçoit les paiements.",
  },
  account: {
    title: "Votre compte Mollie",
    organization: "Compte",
    profile: "Profil de paiement",
    connectedOn: "Relié le",
    ready: "Prêt à encaisser",
    needsData: "Informations à compléter",
    inReview: "Vérification en cours chez Mollie",
    notReady: "Pas encore activé",
    needsDataText: "Mollie a besoin de quelques informations (identité, IBAN, activité) avant de pouvoir encaisser. Complétez-les depuis votre tableau de bord Mollie, puis actualisez.",
    inReviewText: "Mollie vérifie vos informations. Cela prend en général un à deux jours ouvrés. Les paiements seront demandés dès que le compte sera activé.",
    noProfileText: "Aucun profil de paiement n’a été trouvé. Créez un profil (votre site ou votre établissement) dans Mollie, puis actualisez.",
    dashboard: "Ouvrir Mollie",
    refresh: "Actualiser",
    disconnect: "Déconnecter",
    disconnectConfirm: "Déconnecter votre compte Mollie ? Les réservations en ligne ne demanderont plus de paiement.",
    testmode: "Mode test : les paiements sont fictifs, aucun argent n’est prélevé.",
  },
  rule: {
    title: "À la réservation en ligne",
    intro: "Choisissez ce que vos clients règlent pour confirmer leur rendez-vous.",
    modes: {
      none: { label: "Rien en ligne", help: "Tout se règle sur place, comme aujourd’hui." },
      deposit: { label: "Un acompte", help: "Une partie du prix, le reste sur place." },
      full: { label: "La totalité", help: "La prestation est payée en ligne à la réservation." },
    },
    depositKind: "Type d’acompte",
    percent: "Pourcentage du prix",
    fixed: "Montant fixe",
    percentLabel: "Pourcentage",
    amountLabel: "Montant (€)",
    example: (price: string, due: string, rest: string) => `Exemple pour une prestation à ${price} : ${due} en ligne${rest ? `, ${rest} sur place` : ""}.`,
    noteFree: "Les prestations gratuites, ou dont le montant dû est inférieur à 1 €, restent sans paiement.",
    noteRefund: "Si vous annulez un rendez-vous, ou si votre client annule dans le délai autorisé, le paiement est remboursé automatiquement. En cas d’absence, l’acompte vous reste acquis.",
    noteFee:
      offer.platformFeePercent > 0
        ? `Sur chaque paiement encaissé en ligne, ${offer.brandName} perçoit une commission de ${fee}, prélevée par Mollie. Elle reste due si le paiement est ensuite remboursé.`
        : "",
    save: "Enregistrer",
    saved: "Réglage enregistré.",
    needsConnection: "Reliez d’abord votre compte Mollie.",
    inactiveWarning: "Votre compte Mollie n’est pas encore activé : les réservations restent sans paiement en attendant.",
  },
  history: {
    title: "Derniers paiements",
    empty: "Aucun paiement pour l’instant.",
    status: {
      paid: "Payé",
      refunded: "Remboursé",
      refund_failed: "À rembourser depuis Mollie",
      failed: "Échoué",
      canceled: "Abandonné",
      expired: "Expiré",
      open: "En cours",
    } as Record<string, string>,
    deposit: "Acompte",
    full: "Paiement",
  },
  notices: {
    ok: "Votre compte Mollie est relié.",
    actualise: "Statut actualisé.",
    deconnecte: "Compte Mollie déconnecté. Les réservations ne demandent plus de paiement.",
    refusee: "Connexion annulée depuis Mollie.",
    expiree: "Le lien de connexion a expiré. Recommencez.",
    proprietaire: "Seul le propriétaire du compte peut modifier la connexion Mollie.",
    indisponible: "L’encaissement en ligne n’est pas encore activé.",
    erreur: "Mollie n’a pas pu être joint. Réessayez dans quelques instants.",
  } as Record<string, string>,
};

/** Paiement à la réservation, côté client (page de réservation et page du rendez-vous). */
export const bookingPaymentCopy = {
  depositDue: (amount: string) => `Acompte de ${amount} à régler maintenant pour confirmer`,
  fullDue: (amount: string) => `Paiement de ${amount} à régler maintenant pour confirmer`,
  rest: (amount: string) => `Reste ${amount} à régler sur place.`,
  secure: "Paiement sécurisé par Mollie. Remboursé si vous annulez dans le délai autorisé.",
  submit: "Continuer vers le paiement",
  pending: "Paiement en cours de vérification. Cette page se met à jour dans quelques instants.",
  payNow: (amount: string) => `Payer ${amount}`,
  holdNotice: "Votre créneau est réservé quelques minutes, le temps du paiement.",
  paid: (label: string, amount: string) => `${label} de ${amount} réglé en ligne`,
  refunded: (amount: string) => `${amount} remboursés`,
  released: "Le paiement n’a pas abouti : le créneau a été libéré. Vous pouvez reprendre rendez-vous.",
  lateRefunded: "Le paiement est arrivé après la libération du créneau : il vous est remboursé automatiquement.",
  onSite: "paiement sur place",
};

/** Page « Ma page » : tout ce que voient les clients sur la page de réservation. */
export const pageEditor = {
  nav: "Ma page",
  title: "Ma page de réservation",
  intro: "Ce que voient vos clients avant de réserver : présentation, photos, prestations et avis.",
  view: "Voir ma page",
  about: {
    title: "Bio et présentation",
    help: "Votre bio s’affiche sous votre nom, en haut de votre page. La présentation, plus longue, apparaît dans « À propos ».",
    bioLabel: "Bio",
    bioHelp: "Une phrase courte, comme sur Instagram. 160 caractères maximum.",
    bioPlaceholder: "Ex. Soins visage & ongles · sur rendez-vous · Montpellier centre ✨",
    bioTooLong: "160 caractères maximum pour la bio.",
    label: "Présentation (À propos)",
    placeholder: "Ex. Institut de beauté au cœur de Montpellier : soins du visage, épilation et beauté des mains, dans un cadre calme et chaleureux.",
    save: "Enregistrer",
    saved: "Bio et présentation enregistrées.",
    tooLong: "600 caractères maximum.",
  },
  photos: {
    title: "Photos",
    help: (max: number) => `Votre salon, vos réalisations, votre équipe. La première photo sert de couverture. Jusqu’à ${max} photos.`,
    add: "Ajouter des photos",
    adding: (done: number, total: number) => `Envoi ${done}/${total}…`,
    empty: "Aucune photo pour l’instant. Les pages avec photos inspirent davantage confiance.",
    cover: "Couverture",
    makeCover: "Mettre en couverture",
    remove: "Retirer",
    removeConfirm: "Retirer cette photo de votre page ?",
    fromGoogle: "Google",
    done: (n: number) => (n > 1 ? `${n} photos ajoutées.` : "Photo ajoutée."),
    errors: {
      missing: "Aucune photo reçue.",
      tooBig: "Cette photo est trop lourde, même après compression.",
      format: "Format non pris en charge : utilisez une photo JPEG, PNG ou WebP.",
      limit: "Vous avez atteint le nombre maximum de photos. Retirez-en une pour en ajouter une autre.",
      read: "Cette photo n’a pas pu être lue. Essayez avec une autre.",
    },
  },
  services: {
    title: "Prestations",
    help: "Ce que vos clients peuvent réserver en ligne.",
    add: "Ajouter une prestation",
    manage: "Gérer les prestations",
    empty: "Aucune prestation : vos clients ne peuvent pas encore réserver.",
    hiddenTag: "Masquée",
    addPhoto: "Ajouter une photo",
    noPhoto: "Sans photo",
  },
  servicePhoto: {
    title: "Photo de la prestation",
    help: "Une photo du résultat ou du soin, affichée à côté de la prestation sur votre page de réservation.",
    add: "Ajouter une photo",
    replace: "Changer la photo",
    remove: "Retirer la photo",
    removeConfirm: "Retirer la photo de cette prestation ?",
    empty: "Aucune photo pour cette prestation.",
  },
  reviews: {
    title: "Avis clients",
    help: "Les avis de votre fiche Google, affichés tels quels sur votre page. Masquez ceux que vous ne souhaitez pas mettre en avant.",
    sync: "Actualiser mes avis Google",
    syncing: "Récupération…",
    synced: (n: number) => (n > 0 ? `${n} avis récupéré${n > 1 ? "s" : ""} depuis Google.` : "Aucun avis avec texte sur votre fiche Google pour l’instant."),
    syncError: "Google n’a pas pu être joint. Réessayez dans quelques instants.",
    noListing: "Reliez d’abord votre fiche Google dans les Paramètres.",
    linkListing: "Relier ma fiche Google",
    empty: "Aucun avis importé pour l’instant.",
    googleNote: "Google transmet jusqu’à 5 avis, choisis par Google parmi les plus pertinents.",
    shown: "Affiché",
    hidden: "Masqué",
    hide: "Masquer",
    show: "Afficher",
    askMore: "Plus d’avis ? Activez la demande d’avis automatique dans « Emails automatiques ».",
  },
  dashboard: {
    title: "Votre page de réservation",
    text: "Photos, présentation, prestations et avis : soignez ce que vos clients voient en premier.",
    edit: "Modifier ma page",
    photos: (n: number) => `${n} photo${n > 1 ? "s" : ""}`,
    services: (n: number) => `${n} prestation${n > 1 ? "s" : ""}`,
    reviews: (n: number) => `${n} avis`,
    about: (ok: boolean) => (ok ? "Bio rédigée" : "Bio à rédiger"),
  },
};

/** Section « Avis » de la page de réservation publique. */
export const publicReviewsCopy = {
  title: "Avis clients",
  basedOn: (count: number) => `sur ${count} avis Google`,
  source: "Avis publié sur Google",
  seeAll: "Voir tous les avis sur Google",
  stars: (n: number) => `${n} étoile${n > 1 ? "s" : ""} sur 5`,
};
