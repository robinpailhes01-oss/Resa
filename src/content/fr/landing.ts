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
    { href: "/#produit", label: "Produit" },
    { href: "/#fonctionnalites", label: "Fonctionnalités" },
    { href: "/#tarif", label: "Tarif" },
    { href: "/#avis", label: "Avis" },
    { href: "/#faq", label: "FAQ" },
  ],
  skipToContent: "Aller au contenu",
  openMenu: "Ouvrir le menu",
  closeMenu: "Fermer le menu",
  /** Bouton compact du header mobile en pré-lancement. */
  compactCta: { prelaunch: "Me prévenir", live: offer.trialDays ? "Essai gratuit" : "Créer mon compte" } satisfies ByMode<string>,
  login: "Connexion",
};

/** « 7 jours d’essai gratuit » (vide sans essai configuré). */
export const trialLabel = offer.trialDays ? `${offer.trialDays} jours d’essai gratuit` : "";

export const cta = {
  primary: {
    prelaunch: { label: "Me prévenir du lancement", href: "/preinscription" },
    live: {
      label: offer.trialDays ? "Essayer gratuitement" : "Créer mon compte",
      href: offer.signupUrl ?? "/preinscription",
    },
  } satisfies ByMode<{ label: string; href: string }>,
  secondary: { label: `Découvrir ${brand}`, href: "/#produit" },
};

export const hero = {
  eyebrow: "Pensé pour les professionnels de la beauté",
  /** Deux lignes, sur tous les écrans. */
  title: ["Votre agenda.", "L’esprit libre."],
  intro: "Réservations en ligne, agenda partagé et emails automatiques. Tout ce qu’il faut pour organiser votre activité, dans une seule offre.",
  /** Ligne de réassurance sous les boutons. */
  reassurance: {
    prelaunch: [priceCompact, "Un établissement", capitalize(practitioners)],
    live: offer.trialDays ? [trialLabel, "Sans carte bancaire", `${priceCompact} ensuite`] : [priceCompact, "Un établissement", capitalize(practitioners)],
  } satisfies ByMode<string[]>,
  reassuranceCaption: { prelaunch: "Tarif prévu au lancement", live: null } satisfies ByMode<string | null>,
  previewCaption: {
    prelaunch: "Aperçu illustratif du produit en préparation, données fictives.",
    live: "Aperçu avec des données fictives.",
  } satisfies ByMode<string>,
  /** Carte flottante posée sur l'aperçu ; état fictif du produit. */
  floatingCard: { title: "Rappel par email envoyé", text: "Julie Martin · demain 09:00" },
  /** Seconde carte flottante : une réservation qui vient d'arriver (fictif). */
  floatingPill: { title: "Nouvelle réservation en ligne", text: "Il y a 2 minutes" },
  previewAlt: `Aperçu illustratif de l’agenda ${brand} : la journée de Camille chez Maison Alba, un établissement fictif.`,
};

export const features = {
  eyebrow: { prelaunch: "Ce que prépare Reso", live: "Fonctionnalités" } satisfies ByMode<string>,
  main: {
    title: "Votre journée, en un regard.",
    text: "Retrouvez vos rendez-vous, vos praticiens et les informations utiles dans un agenda clair, pensé pour votre quotidien.",
    alt: `Vue rapprochée de l’agenda ${brand} : la journée de Camille et ses trois rendez-vous, données fictives.`,
    /** Pastille posée sur l'aperçu (fictif). */
    chip: { title: "3 rendez-vous", text: "aujourd’hui" },
  },
  cards: [
    {
      id: "booking",
      title: "Vos clientes réservent quand elles le souhaitent.",
      text: "Partagez votre lien de réservation et laissez vos clientes choisir leur prestation et leur créneau.",
      alt: `Aperçu de la page de réservation ${brand} : choix d’une prestation puis d’un créneau, données fictives.`,
      chip: { title: "Réservation en ligne", text: "24h/24 et 7j/7" },
    },
    {
      id: "emails",
      title: "Les bons emails, au bon moment.",
      text: "Confirmation, rappel et demande d’avis sont envoyés automatiquement.",
      alt: `Aperçu d’un email de confirmation envoyé par ${brand} au nom d’un établissement fictif.`,
      chip: { title: "Emails automatiques", text: "Sans effort" },
      steps: ["Confirmation", "Rappel", "Demande d’avis"],
    },
  ] as const,
};

export const howItWorks = {
  eyebrow: "Comment ça marche",
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
      text: "Consultez votre agenda et laissez les emails accompagner vos clientes avant et après leur visite.",
    },
  ],
};

export const testimonialsSection = {
  label: "Les avis",
  title: "Ce qu’en disent les professionnels.",
  /** Bloc affiché tant qu'aucun témoignage réel n'est publié (src/content/fr/testimonials.ts). */
  pending: {
    title: "Les premiers retours arrivent bientôt.",
    text: `${brand} est en préparation. Les témoignages des professionnels seront publiés après leurs premières utilisations.`,
  },
};

export interface PricingProfile {
  value: string;
  /** Libellé du sélecteur. */
  label: string;
  /** Titre de la carte. */
  name: string;
  description: string;
  features: string[];
}

export const pricing = {
  label: "Une offre simple",
  title: ["Tout l’essentiel.", "Un prix clair."],
  intro: "Un seul tarif, quel que soit votre profil. Choisissez le vôtre pour voir ce que Reso vous apporte au quotidien.",
  selectorLabel: "Votre profil",
  /** Même offre, même prix : seule la présentation change selon le profil. */
  profiles: [
    {
      value: "solo",
      label: "Solo",
      name: "Vous travaillez seule",
      description: "Votre agenda, votre page de réservation et vos emails automatiques, sans rien à installer ni à paramétrer chaque jour.",
      features: [
        "Page de réservation et lien à partager",
        "Agenda clair sur téléphone et ordinateur",
        "Fichier clients et historique des rendez-vous",
        "Confirmations et rappels par email",
        "Demandes d’avis par email après la visite",
        `Sans commission de réservation prélevée par ${brand}`,
      ],
    },
    {
      value: "equipe",
      label: "Petite équipe",
      name: "Vous êtes plusieurs au salon",
      description: "Chaque praticien a son agenda, vous gardez la vue d’ensemble, et vos clientes choisissent avec qui réserver.",
      features: [
        `Agenda pour ${practitioners}, au même prix`,
        "Un agenda par praticien et une vue d’ensemble",
        "Prestations réalisées par un ou plusieurs praticiens",
        "Vos clientes choisissent avec qui réserver",
        "Confirmations, rappels et demandes d’avis par email",
        `Sans commission de réservation prélevée par ${brand}`,
      ],
    },
  ] satisfies PricingProfile[],
  priceCaption: { prelaunch: "Tarif prévu au lancement", live: null } satisfies ByMode<string | null>,
  price: priceAmount,
  priceUnit: `HT${NBSP}/${NBSP}mois`,
  billing: { prelaunch: "Un établissement, facturé chaque mois", live: "Facturé chaque mois, sans engagement de durée" } satisfies ByMode<string>,
  scope: `Un établissement${NBSP}· ${capitalize(practitioners)}`,
  highlights: [
    "Agenda et réservation en ligne",
    "Confirmations, rappels et demandes d’avis par email",
    capitalize(practitioners),
    `Sans commission de réservation prélevée par ${brand}`,
  ],
  badge: { prelaunch: "Tout inclus", live: offer.trialDays ? trialLabel : "Tout inclus" } satisfies ByMode<string>,
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
    "SMS, caisse et terminal de paiement non inclus.",
    "Les éventuels frais de paiement en ligne sont distincts.",
  ],
  afterCta: {
    prelaunch: "Offre en préparation. Conditions définitives communiquées à l’ouverture.",
    live: offer.trialDays
      ? `${trialLabel}, sans carte bancaire. Ensuite ${priceCompact}, sans engagement de durée.`
      : "Sans engagement mensuel selon contrat.",
  } satisfies ByMode<string>,
  help: { text: "Une question sur l’offre ?", label: "Voir les questions fréquentes", href: "/#faq" },
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
    question: "Comment fonctionne l’essai gratuit ?",
    answer: offer.trialDays
      ? `Vous disposez de ${offer.trialDays} jours pour utiliser ${brand} avec toutes ses fonctionnalités, sans carte bancaire. À la fin de l’essai, votre page de réservation en ligne est suspendue tant que l’abonnement (${priceCompact}) n’est pas activé ; votre agenda et vos données restent accessibles.`
      : `Créez votre compte et utilisez ${brand} avec toutes ses fonctionnalités. Les conditions de l’abonnement (${priceCompact}) sont indiquées avant la création de votre compte.`,
  },
  {
    question: "Comment commencer ?",
    answer: `Créez votre compte depuis le bouton « ${cta.primary.live.label} », ajoutez vos prestations et votre équipe, puis partagez votre lien de réservation.`,
  },
];

export const faq = {
  label: "Questions fréquentes",
  title: "Vos questions, nos réponses.",
  /** Petit horodatage de la conversation. */
  timestamp: { prelaunch: "Réponses mises à jour avant l’ouverture", live: "Réponses mises à jour régulièrement" } satisfies ByMode<string>,
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
  tagline: "Les rendez-vous qui font rayonner votre métier.",
  links: [
    { href: "/#produit", label: "Produit" },
    { href: "/#fonctionnalites", label: "Fonctionnalités" },
    { href: "/#tarif", label: "Tarif" },
    { href: "/#avis", label: "Avis" },
    { href: "/#faq", label: "FAQ" },
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
    { name: "Camille", role: "Coiffeuse", initials: "CA" },
    { name: "Sophie", role: "Esthéticienne", initials: "SO" },
    { name: "Manon", role: "Prothésiste ongulaire", initials: "MA" },
  ],
  date: { iso: "2026-09-21", long: "Lundi 21 septembre 2026", short: "Lundi 21 septembre" },
  /** Journée de Camille telle que montrée dans l'aperçu (fictif). */
  camilleDay: [
    { start: 9, end: 10, title: "Coupe & brushing", client: "Julie Martin", tone: "soft" },
    { start: 11, end: 12.5, title: "Coloration", client: "Élodie Bernard", tone: "accent" },
    { start: 14, end: 15, title: "Soin capillaire", client: "Sophie Leroy", tone: "success" },
  ] as const,
  reference: {
    client: "Emma Laurent",
    service: "Soin du visage",
    start: "14:00",
    end: "15:00",
    duration: "1 h",
    price: "60 €".replace(" ", NBSP),
    practitioner: "Sophie",
  },
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function byMode<T>(value: ByMode<T>, mode: LaunchMode = offer.launchMode): T {
  return value[mode];
}
