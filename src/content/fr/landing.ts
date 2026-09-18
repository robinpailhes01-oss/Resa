/**
 * Contenus français de la landing page (cahier des charges §4 à §9).
 *
 * Les textes sont ceux du cahier des charges, prêts à intégrer. Les variantes
 * pré-lancement / live sont fournies côte à côte ; le mode actif est choisi
 * par la configuration commerciale (src/config/offer.ts).
 */
import { offer, type LaunchMode } from "@/config/offer";
import {
  formatMonthlyPriceExVat,
  formatMonthlyPriceExVatCompact,
  formatPractitioners,
  formatPrice,
  NBSP,
} from "@/lib/format";

/** « 39 € HT / mois » (phrases) et « 39 € » (affichage grand format, unité séparée). */
const price = formatMonthlyPriceExVat(offer.monthlyPriceExVat, offer.currency);
const priceAmount = formatPrice(offer.monthlyPriceExVat, offer.currency);
const priceCompact = formatMonthlyPriceExVatCompact(offer.monthlyPriceExVat, offer.currency);
const practitioners = formatPractitioners(offer.practitionerLimit);
const brand = offer.brandName;

type ByMode<T> = Record<LaunchMode, T>;

export const nav = {
  links: [
    { href: "#fonctionnalites", label: "Fonctionnalités" },
    { href: "#tarif", label: "Tarif" },
    { href: "#faq", label: "FAQ" },
  ],
  skipToContent: "Aller au contenu",
  openMenu: "Ouvrir le menu",
  closeMenu: "Fermer le menu",
  /** Bouton compact du header mobile en pré-lancement. */
  compactCta: { prelaunch: "Me prévenir", live: "Créer mon compte" } satisfies ByMode<string>,
  login: "Connexion",
};

export const cta = {
  primary: {
    prelaunch: { label: "Être informé du lancement", href: "#inscription" },
    live: {
      label: offer.trialDays ? "Essayer gratuitement" : "Créer mon compte",
      href: offer.signupUrl ?? "#inscription",
    },
  } satisfies ByMode<{ label: string; href: string }>,
  secondary: { label: `Découvrir ${brand}`, href: "#apercu" },
};

export const hero = {
  eyebrow: "L’agenda en ligne des pros de la beauté",
  /** Deux segments : le retour à la ligne est un choix de mise en page, pas un <br> forcé. */
  title: ["Vos rendez-vous.", "Un prix tout simple."],
  intro: `Réservations en ligne, confirmations, rappels et demandes d’avis par email. ${brand} réunit l’essentiel pour organiser vos rendez-vous, dans une seule offre.`,
  pricePrefix: { prelaunch: "Tarif prévu", live: null } satisfies ByMode<string | null>,
  price: priceAmount,
  priceUnit: `HT${NBSP}/${NBSP}mois`,
  priceNote: `Un établissement. ${capitalize(practitioners)}.`,
  prelaunchNotice: `${brand} est en préparation. Le tarif et les fonctionnalités seront confirmés à l’ouverture.`,
  microcopy: {
    prelaunch: "Sans paiement. Nous vous préviendrons à l’ouverture.",
    live: "Sans engagement mensuel selon contrat.",
  } satisfies ByMode<string>,
  previewCaption: {
    prelaunch: "Aperçu du produit en préparation",
    live: "Capture de la version disponible",
  } satisfies ByMode<string>,
  previewBadge: "Rappel par email programmé",
  previewAlt: `Aperçu de l’agenda ${brand} avec trois praticiens`,
};

export const features = {
  eyebrow: { prelaunch: "Les fonctionnalités prévues", live: null } satisfies ByMode<string | null>,
  title: "L’essentiel pour gérer vos rendez-vous.",
  cards: [
    {
      icon: "calendar",
      title: "Réservation en ligne",
      text: "Partagez votre lien. Vos clients choisissent leur prestation et leur créneau, même lorsque vous êtes occupé.",
    },
    {
      icon: "mail",
      title: "Emails automatiques",
      text: "Confirmez les rendez-vous, envoyez un rappel et invitez vos clients à laisser un avis après leur visite.",
    },
    {
      icon: "users",
      title: "Agenda partagé",
      text: "Retrouvez les rendez-vous de votre équipe dans une vue claire, accessible sur ordinateur, tablette et mobile.",
    },
  ] as const,
};

export const preview = {
  title: `Un aperçu de votre quotidien avec ${brand}.`,
  intro: "Un agenda lisible, une réservation simple et des emails qui accompagnent chaque rendez-vous.",
  tabs: [
    {
      id: "agenda",
      label: "Agenda",
      caption: "Visualisez votre journée et retrouvez les informations de chaque rendez-vous.",
      alt: `Aperçu de l’agenda ${brand} avec trois praticiens et leurs rendez-vous de la journée`,
    },
    {
      id: "booking",
      label: "Réservation",
      caption: "Vos clients choisissent leur rendez-vous depuis votre lien de réservation.",
      alt: `Aperçu de la page de réservation ${brand} : choix d’une prestation puis d’un créneau`,
    },
    {
      id: "emails",
      label: "Emails",
      caption: "Confirmation, rappel et demande d’avis : les messages utiles au bon moment.",
      alt: `Aperçu des emails automatiques ${brand} : confirmation, rappel et demande d’avis`,
    },
  ] as const,
  prelaunchNote: {
    prelaunch: "Aperçus illustratifs du produit en préparation. Données fictives.",
    live: "Données fictives à titre d’illustration.",
  } satisfies ByMode<string>,
};

export type PreviewTabId = (typeof preview.tabs)[number]["id"];

export const howItWorks = {
  eyebrow: { prelaunch: `Comment ${brand} fonctionnera`, live: `Comment ${brand} fonctionne` } satisfies ByMode<string>,
  title: "Votre organisation, en trois étapes.",
  steps: [
    {
      title: "Configurez votre espace",
      text: "Ajoutez vos prestations, vos horaires et les membres de votre équipe.",
    },
    {
      title: "Partagez votre lien",
      text: "Placez votre lien de réservation sur votre site, vos réseaux sociaux ou dans vos messages.",
    },
    {
      title: "Retrouvez vos rendez-vous",
      text: "Consultez votre agenda et laissez les emails accompagner vos clients avant et après leur visite.",
    },
  ],
};

export const pricing = {
  title: "Une offre. Un prix clair.",
  intro: "Les fonctions essentielles pour vos rendez-vous, réunies dans un seul abonnement.",
  planName: brand,
  pricePrefix: { prelaunch: "Tarif prévu", live: null } satisfies ByMode<string | null>,
  price: priceAmount,
  priceUnit: `HT${NBSP}/${NBSP}mois`,
  scope: `Par établissement, ${practitioners}`,
  inclusionsTitle: "Ce qui est inclus",
  inclusions: [
    "Page de réservation et lien à partager",
    `Agenda pour ${practitioners}`,
    "Fichier clients et historique des rendez-vous",
    "Confirmations de réservation par email",
    "Rappels de rendez-vous par email",
    "Demandes d’avis par email après la visite",
    "Accès sur ordinateur, tablette et mobile",
  ],
  mentions: [
    `Sans commission de réservation prélevée par ${brand}.`,
    "SMS, caisse et terminal de paiement non inclus. Les éventuels frais de paiement en ligne sont distincts.",
  ],
  afterCta: {
    prelaunch: "Offre en préparation. Conditions définitives communiquées à l’ouverture.",
    live: "Sans engagement mensuel selon contrat.",
  } satisfies ByMode<string>,
};

export interface FaqItem {
  question: string;
  answer: string;
}

const faqPrelaunch: FaqItem[] = [
  {
    question: `À qui s’adresse ${brand} ?`,
    answer: `${brand} est conçu pour les professionnels de la beauté et du bien-être qui travaillent seuls ou en petite équipe : instituts, ongleries, spécialistes du regard et salons de soins notamment. L’offre prévue couvre un établissement et ${practitioners}.`,
  },
  {
    question: `Combien coûtera ${brand} ?`,
    answer: `Le tarif prévu est de ${price.replace(`${NBSP}/${NBSP}`, ` par `)} et par établissement, pour ${practitioners}. L’offre et ses conditions définitives seront confirmées lors de l’ouverture. Aucun paiement n’est demandé pour être informé du lancement.`,
  },
  {
    question: "Que comprennent les emails automatiques ?",
    answer:
      "Les fonctionnalités prévues comprennent la confirmation après réservation, le rappel avant le rendez-vous et la demande d’avis après une visite effectuée. Les SMS et les campagnes promotionnelles ne font pas partie de cette offre.",
  },
  {
    question: `${brand} prélèvera-t-il une commission sur mes rendez-vous ?`,
    answer: `L’offre est prévue sans commission de réservation prélevée par ${brand}. Si le paiement en ligne est proposé, les frais de son prestataire seront indiqués séparément avant activation.`,
  },
  {
    question: "Mes clients devront-ils télécharger une application ?",
    answer:
      "Non. La réservation est prévue depuis un lien accessible dans leur navigateur, sur téléphone ou ordinateur. Vous pourrez partager ce lien sur votre site et vos réseaux sociaux.",
  },
  {
    question: `${brand} apportera-t-il de nouveaux clients à mon établissement ?`,
    answer: `${brand} facilite la réservation des personnes qui découvrent déjà votre établissement. Le lancement ne prévoit pas de promettre l’audience d’une grande marketplace ni un nombre de nouveaux clients.`,
  },
  {
    question: `Est-ce que ${brand} remplace mon logiciel de caisse ?`,
    answer:
      "Non. L’offre présentée concerne la réservation, l’agenda et les emails liés aux rendez-vous. La caisse et le terminal de paiement ne sont pas inclus.",
  },
  {
    question: `Quand pourrai-je utiliser ${brand} ?`,
    answer: `${brand} est en préparation. Laissez votre email pour être informé de son ouverture. Nous communiquerons une date lorsque la disponibilité du service sera confirmée.`,
  },
];

const faqLive: FaqItem[] = [
  {
    question: `À qui s’adresse ${brand} ?`,
    answer: `${brand} est conçu pour les professionnels de la beauté et du bien-être qui travaillent seuls ou en petite équipe : instituts, ongleries, spécialistes du regard et salons de soins notamment. L’offre couvre un établissement et ${practitioners}.`,
  },
  {
    question: `Combien coûte ${brand} ?`,
    answer: `Le tarif est de ${price.replace(`${NBSP}/${NBSP}`, ` par `)} et par établissement, pour ${practitioners}. Les conditions commerciales sont indiquées avant la création de votre compte.`,
  },
  {
    question: "Que comprennent les emails automatiques ?",
    answer:
      "La confirmation après réservation, le rappel avant le rendez-vous et la demande d’avis après une visite effectuée. Les SMS et les campagnes promotionnelles ne font pas partie de cette offre.",
  },
  {
    question: `${brand} prélève-t-il une commission sur mes rendez-vous ?`,
    answer: `Non. ${brand} ne prélève aucune commission de réservation. Si le paiement en ligne est proposé, les frais de son prestataire sont indiqués séparément avant activation.`,
  },
  {
    question: "Mes clients doivent-ils télécharger une application ?",
    answer:
      "Non. La réservation se fait depuis un lien accessible dans leur navigateur, sur téléphone ou ordinateur. Vous pouvez partager ce lien sur votre site et vos réseaux sociaux.",
  },
  {
    question: `${brand} apporte-t-il de nouveaux clients à mon établissement ?`,
    answer: `${brand} facilite la réservation des personnes qui découvrent déjà votre établissement. Nous ne promettons pas l’audience d’une grande marketplace ni un nombre de nouveaux clients.`,
  },
  {
    question: `Est-ce que ${brand} remplace mon logiciel de caisse ?`,
    answer:
      "Non. L’offre concerne la réservation, l’agenda et les emails liés aux rendez-vous. La caisse et le terminal de paiement ne sont pas inclus.",
  },
  {
    question: "Comment commencer ?",
    answer: `Créez votre compte depuis le bouton « ${cta.primary.live.label} », ajoutez vos prestations et votre équipe, puis partagez votre lien de réservation.`,
  },
];

export const faq = {
  title: "Vos questions, nos réponses.",
  items: { prelaunch: faqPrelaunch, live: faqLive } satisfies ByMode<FaqItem[]>,
};

export const businessTypes = [
  { value: "institut", label: "Institut de beauté" },
  { value: "onglerie", label: "Onglerie" },
  { value: "regard_cils", label: "Regard et cils" },
  { value: "coiffure_barbier", label: "Coiffure et barbier" },
  { value: "spa_soins", label: "Spa et soins" },
  { value: "autre", label: "Autre" },
] as const;

export const teamSizes = [
  { value: "solo", label: "Je travaille seul" },
  { value: "2_3", label: "2 à 3 praticiens" },
  { value: "4_plus", label: "4 praticiens ou plus" },
] as const;

export const waitlist = {
  title: `Soyez informé de l’ouverture de ${brand}.`,
  intro: `Laissez votre email. Nous vous préviendrons lorsque vous pourrez découvrir ${brand}.`,
  fields: {
    email: { label: "Votre email professionnel", placeholder: "prenom@votre-institut.fr" },
    businessType: { label: "Votre activité (facultatif)", empty: "Sélectionnez une activité" },
    teamSize: { label: "Taille de votre équipe (facultatif)", empty: "Sélectionnez une taille" },
  },
  legal: {
    before: `En vous inscrivant, vous demandez à recevoir un email à l’ouverture de ${brand}. Vous pourrez retirer votre inscription à tout moment. `,
    linkLabel: "En savoir plus sur l’utilisation de vos données.",
    linkHref: "/confidentialite",
  },
  submit: "Me prévenir à l’ouverture",
  submitting: "Envoi en cours…",
  errors: {
    email: "Saisissez une adresse email valide.",
    generic: "Votre demande n’a pas pu être enregistrée. Réessayez dans quelques instants.",
    rateLimited: "Trop de tentatives. Merci de réessayer un peu plus tard.",
  },
  success:
    "Vérifiez votre boîte mail. Si cette adresse doit être confirmée, vous recevrez un lien pour valider votre inscription. Pensez aussi à vérifier les courriers indésirables.",
  /** Bloc affiché à la place du formulaire en mode live. */
  liveBlock: {
    title: `Commencez avec ${brand}.`,
    intro: "Créez votre compte et partagez votre lien de réservation à vos clients.",
  },
};

export const footer = {
  brand,
  tagline: "L’essentiel pour vos rendez-vous.",
  links: [
    { href: "#fonctionnalites", label: "Fonctionnalités" },
    { href: "#tarif", label: "Tarif" },
    { href: "#faq", label: "FAQ" },
  ],
  contactLabel: "Contact",
  legalLinks: [
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/confidentialite", label: "Confidentialité" },
  ],
  copyright: (year: number) => `© ${year} ${brand}`,
};

export const metadata = {
  title: `${brand} | Agenda en ligne beauté et bien-être`,
  description: {
    prelaunch: `Découvrez ${brand} : réservation en ligne, agenda partagé et emails automatiques pour les pros de la beauté. Offre prévue à ${priceCompact}.`,
    live: `${brand} réunit réservation en ligne, agenda partagé et emails automatiques pour les pros de la beauté. Une offre à ${priceCompact}.`,
  } satisfies ByMode<string>,
};

/** Données fictives et cohérentes des aperçus (§6). */
export const demo = {
  salon: "Maison Alba",
  salonType: "Institut de beauté",
  city: "Montpellier",
  practitioners: [
    { name: "Camille", role: "Esthéticienne", initials: "CA" },
    { name: "Sophie", role: "Esthéticienne", initials: "SO" },
    { name: "Manon", role: "Esthéticienne", initials: "MA" },
  ],
  date: { iso: "2026-09-21", long: "Lundi 21 septembre 2026", short: "Lun. 21 sept." },
  reference: {
    client: "Emma Laurent",
    service: "Soin du visage",
    start: "14:00",
    end: "15:00",
    duration: "1 h",
    price: "60 €".replace(" ", NBSP),
    practitioner: "Camille",
  },
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function byMode<T>(value: ByMode<T>, mode: LaunchMode = offer.launchMode): T {
  return value[mode];
}
