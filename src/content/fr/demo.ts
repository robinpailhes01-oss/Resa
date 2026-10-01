import type { Establishment } from "@/server/auth/guards";
import type { OpeningHourRow } from "@/server/app/hours";
import type { EstablishmentPhoto } from "@/server/app/photos";
import type { Practitioner } from "@/server/app/practitioners";
import type { Service } from "@/server/app/services";

/**
 * Page de démonstration (/demo) : un établissement fictif, présenté exactement
 * comme la page de réservation d'un vrai salon. Toutes les données sont inventées.
 */
export const demoCopy = {
  title: "Démo · Maison Alba",
  banner: "Démo : voici la page que vos clients verront. Les données sont fictives.",
  cta: "Créer ma page",
  nextStep: {
    title: "Ici, votre client choisit son créneau",
    text: "Sur votre vraie page, il choisit le praticien, le jour et l’heure, laisse ses coordonnées, et reçoit sa confirmation par email. Vous, vous voyez le rendez-vous arriver dans votre agenda.",
    back: "Revenir à la page",
  },
};

const E = "demo-maison-alba";

export const demoEstablishment: Establishment = {
  id: E,
  ownerUserId: "demo",
  name: "Maison Alba",
  slug: "demo",
  businessType: "institut",
  addressLine: "12 rue de l’Aiguillerie",
  postalCode: "34000",
  city: "Montpellier",
  phone: "04 67 00 00 00",
  publicEmail: null,
  description:
    "Institut de beauté au cœur de l’Écusson. Soins du visage, beauté des mains et du regard, dans un cadre calme et lumineux. Produits français, rendez-vous sans attente.",
  bio: "Soins visage & ongles · sur rendez-vous · Montpellier centre ✨",
  bookingTerms: "Merci de prévenir 24 h à l’avance en cas d’empêchement.",
  timezone: "Europe/Paris",
  bookingEnabled: true,
  slotStepMin: 15,
  minLeadMin: 60,
  maxHorizonDays: 60,
  cancellationHours: 24,
  subscriptionStatus: "active",
  trialEndsAt: null,
  paidUntil: null,
  cancelAtPeriodEnd: false,
  googlePlaceId: null,
  googleRating: 4.9,
  googleRatingCount: 128,
  googleMapsUrl: null,
  paymentMode: "deposit",
  depositKind: "percent",
  depositValue: 30,
};

export const demoPhotos: EstablishmentPhoto[] = [
  { id: "p1", url: "/brand/nature-morte.webp", source: "manual", sortOrder: 0 },
  { id: "p2", url: "/brand/outils.webp", source: "manual", sortOrder: 1 },
  { id: "p3", url: "/brand/ciseaux.webp", source: "manual", sortOrder: 2 },
];

const service = (id: string, name: string, description: string, durationMin: number, priceCents: number, photoUrl: string | null, sortOrder: number): Service => ({
  id,
  establishmentId: E,
  name,
  description,
  durationMin,
  bufferMin: 0,
  priceCents,
  active: true,
  sortOrder,
  practitionerIds: [],
  photoUrl,
});

export const demoServices: Service[] = [
  service("s1", "Soin visage éclat", "Nettoyage, gommage, masque et modelage relaxant.", 60, 6500, "/brand/outils.webp", 0),
  service("s2", "Pose semi-permanent", "Sur ongles naturels, tenue trois semaines.", 60, 4000, "/brand/nature-morte.webp", 1),
  service("s3", "Rehaussement de cils", "Avec teinture, pour un regard ouvert sans mascara.", 75, 5500, null, 2),
  service("s4", "Beauté des mains", "Limage, cuticules, soin hydratant et vernis.", 45, 3000, "/brand/ciseaux.webp", 3),
];

export const demoPractitioners: Practitioner[] = [
  { id: "pr1", establishmentId: E, name: "Camille", roleTitle: "Esthéticienne", color: "soft", active: true, sortOrder: 0 },
  { id: "pr2", establishmentId: E, name: "Inès", roleTitle: "Prothésiste ongulaire", color: "accent", active: true, sortOrder: 1 },
];

export const demoHours: OpeningHourRow[] = [1, 2, 3, 4, 5, 6].map((weekday) => ({
  id: `h${weekday}`,
  practitionerId: null,
  weekday,
  startMin: 9 * 60 + 30,
  endMin: weekday === 6 ? 17 * 60 : 19 * 60,
}));

export const demoReviews = [
  { id: "r1", authorName: "Léa M.", authorUrl: null, authorPhotoUrl: null, rating: 5, text: "Un vrai moment de calme. Camille prend le temps d’expliquer chaque étape, ma peau n’a jamais été aussi belle.", relativeTime: "il y a 2 semaines" },
  { id: "r2", authorName: "Sophie D.", authorUrl: null, authorPhotoUrl: null, rating: 5, text: "Réservation en ligne super pratique, rappel la veille, accueil adorable. Je recommande !", relativeTime: "il y a 1 mois" },
  { id: "r3", authorName: "Karim B.", authorUrl: null, authorPhotoUrl: null, rating: 5, text: "Ponctuel, soigné, et le salon est magnifique. Inès est très douée pour le semi-permanent.", relativeTime: "il y a 1 mois" },
  { id: "r4", authorName: "Nadia T.", authorUrl: null, authorPhotoUrl: null, rating: 4, text: "Très bon rehaussement de cils, résultat naturel. Un peu d’attente à l’accueil, rien de grave.", relativeTime: "il y a 2 mois" },
];
