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
const unlimitedAgendas = offer.practitionerLimit === null;
/** Message clé du tarif : le prix ne dépend pas du nombre d'agendas. */
const samePrice = "Même prix, quel que soit le nombre d’agendas";
const teamScope = unlimitedAgendas ? "quel que soit le nombre de praticiens" : `pour ${practitioners}`;
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

/** Signature de marque (visuel logo Instagram). */
export const brandLine = {
  tagline: "Beauty business simplified",
  note: "pour les pros beauté",
};

export const hero = {
  /** Étiquette d'index, reprise des visuels (« [001] »). */
  index: "[001]",
  note: brandLine.note,
  /** Deux lignes, en minuscules comme sur les visuels. */
  title: ["vos rendez-vous,", "sans décrocher."],
  trades: ["coiffure", "barber", "esthétique", "onglerie"],
  /** Pastille animée : « Pour » puis un métier après l'autre. */
  rotator: { lead: "Pour", words: ["la coiffure", "les barbers", "l’esthétique", "les ongleries", "le massage", "les cils"] },
  intro: "Vos clients réservent en ligne, jour et nuit. Rappel par email avant le rendez-vous, demande d’avis Google après la visite.",
  /** Ligne de réassurance sous les boutons. */
  reassurance: {
    prelaunch: [priceCompact, "Un établissement", capitalize(practitioners)],
    live: offer.trialDays ? [trialLabel, "Sans carte bancaire", `${priceCompact} ensuite`] : [priceCompact, "Un établissement", capitalize(practitioners)],
  } satisfies ByMode<string[]>,
  reassuranceCaption: { prelaunch: "Tarif prévu au lancement", live: null } satisfies ByMode<string | null>,
  imageAlt: "Nature morte sur un socle crème : flacon, peigne, brosses, ciseaux, coton et vernis lavande sur un plateau chromé ; au premier plan, un combiné de téléphone décroché.",
  secondary: { label: "Voir la démo", href: "/demo" },
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

/**
 * Vidéo de présentation (paysage, voix off) sous le hero. Elle cite l'essai
 * gratuit et le tarif : affichée seulement en mode live.
 */
export const promoVideo = {
  visible: { prelaunch: false, live: true } satisfies ByMode<boolean>,
  eyebrow: "En vidéo",
  title: `${brand} en 40 secondes.`,
  text: "Votre page de réservation, l’agenda, le tableau de bord et les emails automatiques : tout ce que fait l’application, montré sur la démo.",
  /** H.264 d’abord (Safari, Chrome), VP9 en secours (Chromium sans codecs propriétaires). */
  sources: [
    { src: "/videos/reso-presentation.mp4", type: "video/mp4" },
    { src: "/videos/reso-presentation.webm", type: "video/webm" },
  ],
  poster: "/videos/reso-presentation-poster.webp",
  captions: { src: "/videos/reso-presentation.fr.vtt", label: "Français" },
  playLabel: "Lancer la vidéo",
  duration: "0:38",
  ariaLabel: `Vidéo de présentation de ${brand}, avec voix off et sous-titres`,
  caption: "Démo avec des données d’exemple.",
};

/** Bloc « l'agenda » sous le hero. */
export const productShowcase = {
  index: "[002]",
  eyebrow: "L’agenda",
  title: "Toute la journée du salon, sur un seul écran.",
  text: "Chaque praticien a sa colonne. Les réservations en ligne arrivent d’elles-mêmes, celles prises au téléphone s’ajoutent en deux gestes.",
};

export const features = {
  index: "[003]",
  eyebrow: { prelaunch: "Ce que prépare Reso", live: "Fonctionnalités" } satisfies ByMode<string>,
  title: "Le téléphone sonne moins. L’agenda se remplit quand même.",
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
      title: "Vos clients réservent quand elles le souhaitent.",
      text: "Partagez votre lien de réservation et laissez vos clients choisir leur prestation et leur créneau.",
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
  /** Encaissement en ligne avec Mollie (facultatif). */
  payments: {
    eyebrow: "Partenaire de paiement : Mollie",
    title: "Acomptes et paiements en ligne, sans vous en occuper.",
    text: "Demandez un acompte ou le paiement complet au moment de la réservation. Vos clients paient par carte ou Apple Pay chez Mollie, notre partenaire de paiement agréé, et l’argent arrive directement sur votre compte.",
    points: ["Acompte en pourcentage ou montant fixe", "Remboursement automatique si vous annulez", "Moins de rendez-vous oubliés"],
  },
  /** Bandeau image : les avis Google. */
  reviews: {
    title: "Des avis Google, sans avoir à les demander.",
    text: "Après chaque visite, votre client reçoit un lien direct vers votre fiche Google. Votre note se construit rendez-vous après rendez-vous.",
    alt: "Plateau chromé avec peigne, brosses, ciseaux, coton et vernis lavande, sur un socle crème devant un mur bleu poudré.",
  },
};

export const howItWorks = {
  index: "[005]",
  eyebrow: "Comment ça marche",
  title: "Dix minutes pour démarrer.",
  stepLabel: "étape",
  steps: [
    {
      title: "Importez votre fiche Google",
      text: "Photos, adresse et horaires arrivent en un clic. Ajoutez vos prestations et votre équipe.",
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

/** Section « Côté pro / Côté client » : le même rendez-vous vu des deux côtés. */
export const twoSides = {
  index: "[004]",
  eyebrow: "Deux côtés, une seule app",
  title: "Ce que vous voyez. Ce que vos clients voient.",
  intro: "Basculez d’un côté à l’autre : votre journée dans votre espace pro, et la page où vos clients réservent.",
  tabs: { pro: "Côté pro", client: "Côté client" },
  demo: "Voir la démo complète",
  pro: {
    salon: "Maison Alba",
    subtitle: "Compte et réglages",
    today: "Aujourd’hui",
    week: "Cette semaine",
    date: "Jeudi 2 octobre",
    nextIn: "Dans 1 h 20",
    next: { time: "13:00", name: "Julien Marchand", service: "Soin visage éclat", deposit: "Acompte de 20 € reçu" },
    actions: { call: "Appeler", open: "Voir la fiche" },
    done: [
      { time: "09:00", name: "Camille Berger", price: "45 €" },
      { time: "10:30", name: "Nadia Toussaint", price: "60 €" },
    ],
    later: [
      { time: "15:00", name: "Sofia Renaud", service: "Pose semi-permanent", price: "40 €" },
      { time: "16:30", name: "Hugo Lemoine", service: "Beauté des mains", price: "30 €" },
    ],
    end: { time: "19:00", label: "Fin de journée" },
  },
  client: {
    back: "Maison Alba",
    bio: "Soins visage & ongles · Montpellier centre",
    deposit: "Acompte de 30 % à la réservation",
    filters: ["Tout", "Visage", "Ongles", "Regard"],
    services: [
      { name: "Soin visage éclat", text: "Nettoyage, gommage, masque et modelage.", meta: "1 h · 65 €", image: "/demo/soin-visage.webp" },
      { name: "Pose semi-permanent", text: "Sur ongles naturels, tenue trois semaines.", meta: "1 h · 40 €", image: "/demo/ongles.webp" },
      { name: "Beauté des mains", text: "Limage, cuticules, soin et vernis.", meta: "45 min · 30 €", image: "/demo/mains.webp" },
      { name: "Rehaussement de cils", text: "Avec teinture, regard ouvert.", meta: "1 h 15 · 55 €", image: "/demo/cils.webp" },
    ],
    add: "Ajouter",
  },
  caption: "Aperçu avec des données fictives.",
};

/** Section « On vous installe tout » : un appel avec l'équipe pour démarrer. */
export const setupCall = {
  eyebrow: "Installation offerte",
  title: "Pas le temps ? On vous installe tout.",
  text: "Un appel de 20 minutes avec l’équipe : on crée votre page, on importe vos prestations, vos horaires et vos photos, on règle vos rappels et votre lien de réservation. Ensuite, on reste joignables.",
  points: ["Votre page prête en un appel", "Vos prestations et horaires importés", "Un contact à Montpellier, pas un robot"],
  button: "Prendre un appel avec l’équipe",
  note: "Gratuit, sans engagement.",
  whatsappMessage: `Bonjour, j’aimerais un appel pour qu’on m’aide à installer ${brand}.`,
  emailSubject: `Appel pour installer ${brand}`,
};

/** Carte « Vous préférez qu'on vous montre ? » : démo en visio WhatsApp. */
export const demoCall = {
  title: "Vous préférez qu’on vous montre ?",
  text: "Ludivine vous fait la démo en visio WhatsApp, 20 minutes, un soir à 21\u00a0h. Gratuit, sans engagement.",
  button: "Réserver une visio avec Ludivine",
  whatsappMessage: `Bonjour Ludivine, j’aimerais une démo de ${brand} en visio.`,
  emailSubject: `Démo de ${brand} en visio avec Ludivine`,
};

export const testimonialsSection = {
  index: "[007]",
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
  index: "[006]",
  label: "Une offre simple",
  title: ["Tout l’essentiel.", "Un prix clair."],
  intro: unlimitedAgendas
    ? "Un seul tarif, quel que soit votre profil et le nombre d’agendas : seule ou à dix praticiens, vous payez le même prix."
    : "Un seul tarif, quel que soit votre profil. Choisissez le vôtre pour voir ce que Reso vous apporte au quotidien.",
  selectorLabel: "Votre profil",
  /** Pastille au-dessus de la carte : le prix ne dépend pas du nombre d'agendas (null si plafonné). */
  samePriceBadge: unlimitedAgendas ? "1 agenda ou 10 agendas : même prix" : null,
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
        "Acomptes en ligne avec Mollie (facultatif)",
        `Sans commission de réservation prélevée par ${brand}`,
      ],
    },
    {
      value: "avenir",
      label: "À venir",
      name: "Ce qu’on prépare pour vous",
      description: "Voici les prochaines nouveautés que nous préparons, pensées pour remplir votre agenda et fidéliser vos clientes.",
      features: [
        "Création de stories Instagram personnalisées",
        "Relances aidées par l’IA",
        "Carte de fidélité automatisée",
        "Cartes cadeaux",
        "Et bien plus encore",
      ],
    },
  ] satisfies PricingProfile[],
  priceCaption: { prelaunch: "Tarif prévu au lancement", live: null } satisfies ByMode<string | null>,
  price: priceAmount,
  priceUnit: `HT${NBSP}/${NBSP}mois`,
  billing: { prelaunch: "Un établissement, facturé chaque mois", live: "Facturé chaque mois, sans engagement de durée" } satisfies ByMode<string>,
  scope: unlimitedAgendas ? `Un établissement${NBSP}· ${samePrice}` : `Un établissement${NBSP}· ${capitalize(practitioners)}`,
  highlights: [
    "Agenda et réservation en ligne",
    "Confirmations, rappels et demandes d’avis par email",
    unlimitedAgendas ? samePrice : capitalize(practitioners),
    `Sans commission de réservation prélevée par ${brand}`,
  ],
  badge: { prelaunch: "Tout inclus", live: offer.trialDays ? trialLabel : "Tout inclus" } satisfies ByMode<string>,
  inclusionsTitle: "Ce qui est inclus",
  inclusions: [
    "Page de réservation et lien à partager",
    unlimitedAgendas ? "Agendas illimités : un par praticien, au même prix" : `Agenda pour ${practitioners}`,
    "Fichier clients et historique des rendez-vous",
    "Confirmations de réservation par email",
    "Rappels de rendez-vous par email",
    "Demandes d’avis par email après la visite",
    "Accès sur ordinateur, tablette et mobile",
  ],
  mentions: [
    "SMS, caisse et terminal de paiement non inclus.",
    `Paiement en ligne facultatif : frais Mollie${offer.platformFeePercent > 0 ? ` et ${offer.platformFeePercent.toLocaleString("fr-FR")} % par paiement encaissé` : ""}, uniquement sur les acomptes et paiements.`,
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
    answer: `${brand} est conçu pour les professionnels de la beauté et du bien-être qui travaillent seuls ou en petite équipe : instituts, ongleries, spécialistes du regard et salons de soins notamment. L’offre prévue couvre un établissement, ${unlimitedAgendas ? "avec autant d’agendas que de praticiens, au même prix" : practitioners}.`,
  },
  {
    question: `Combien coûtera ${brand} ?`,
    answer: `Le tarif prévu est de ${price.replace(`${NBSP}/${NBSP}`, ` par `)} et par établissement, ${teamScope}. L’offre et ses conditions définitives seront confirmées lors de l’ouverture. Aucun paiement n’est demandé pour être informé du lancement.`,
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
    answer: `${brand} est conçu pour les professionnels de la beauté et du bien-être qui travaillent seuls ou en petite équipe : instituts, ongleries, spécialistes du regard et salons de soins notamment. L’offre couvre un établissement, ${unlimitedAgendas ? "avec autant d’agendas que de praticiens, au même prix" : practitioners}.`,
  },
  {
    question: `Combien coûte ${brand} ?`,
    answer: `Le tarif est de ${price.replace(`${NBSP}/${NBSP}`, ` par `)} et par établissement, ${teamScope}. Que vous travailliez seule ou à dix, le prix est le même. Les conditions commerciales sont indiquées avant la création de votre compte.`,
  },
  {
    question: "Que comprennent les emails automatiques ?",
    answer:
      "La confirmation après réservation, le rappel avant le rendez-vous et la demande d’avis après une visite effectuée. Les SMS et les campagnes promotionnelles ne font pas partie de cette offre.",
  },
  {
    question: `${brand} prélève-t-il une commission sur mes rendez-vous ?`,
    answer: `Non. ${brand} ne prélève aucune commission sur les rendez-vous. Seul l’encaissement en ligne d’un acompte, facultatif, comporte ${offer.platformFeePercent > 0 ? `une commission de ${offer.platformFeePercent.toLocaleString("fr-FR")} % sur la somme encaissée, en plus des` : "uniquement les"} frais de Mollie, affichés avant activation.`,
  },
  {
    question: "Puis-je demander un acompte à la réservation ?",
    answer: `Oui, si vous le souhaitez. Reliez votre compte Mollie, notre partenaire de paiement, depuis votre espace : vous choisissez un acompte (en pourcentage ou en montant fixe) ou le paiement complet. Vos clients paient par carte ou Apple Pay, l’argent arrive directement sur votre compte, et le remboursement est automatique si vous annulez le rendez-vous.${offer.platformFeePercent > 0 ? ` Frais : ceux de Mollie, plus ${offer.platformFeePercent.toLocaleString("fr-FR")} % par paiement encaissé.` : ""}`,
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
  index: "[008]",
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
  tagline: brandLine.tagline,
  closing: {
    title: "Raccrochez. Vos clients réservent en ligne.",
    text: offer.trialDays ? `${trialLabel}, sans carte bancaire. Ensuite ${priceCompact}, sans engagement.` : `${priceCompact}, sans engagement.`,
    imageAlt: "Ciseaux chromés et serviette éponge sur un socle crème, devant un mur bleu poudré.",
  },
  links: [
    { href: "/#produit", label: "Produit" },
    { href: "/#fonctionnalites", label: "Fonctionnalités" },
    { href: "/#tarif", label: "Tarif" },
    { href: "/#avis", label: "Avis" },
    { href: "/#faq", label: "FAQ" },
  ],
  contactLabel: "Contact",
  legalLinks: [
    { href: "/cgv", label: "CGV" },
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/confidentialite", label: "Confidentialité" },
  ],
  copyright: (year: number) => `© ${year} ${brand}`,
  madeIn: "Fabriqué à Montpellier avec authenticité",
  proLink: { label: "Devenir pro", href: offer.launchMode === "live" ? (offer.signupUrl ?? "/inscription") : "/preinscription" },
  followUs: "Suivez-nous",
  social: {
    instagram: `${brand} sur Instagram`,
    tiktok: `${brand} sur TikTok`,
    facebook: `${brand} sur Facebook`,
    linkedin: `${brand} sur LinkedIn`,
  },
  booking: {
    poweredBy: `Réservation propulsée par ${brand}`,
    timezone: "Les horaires sont affichés à l’heure de Paris.",
    pro: `Vous êtes pro ? Découvrez ${brand}`,
  },
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
