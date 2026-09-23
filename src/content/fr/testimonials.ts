/**
 * Témoignages de la section « Avis » (bandeau défilant).
 *
 * Si cette liste est vide, la landing affiche un bloc de pré-lancement à la
 * place du bandeau. Les avis ci-dessous sont des exemples rédigés pour la
 * maquette : remplacer chaque entrée par une citation réelle et autorisée par
 * son auteur avant toute communication commerciale.
 */
export interface Testimonial {
  /** Citation, telle qu'autorisée par son auteur. */
  quote: string;
  /** Prénom affiché. */
  firstName: string;
  /** Nom de l'établissement. */
  establishment: string;
  /** Activité (ex. « Institut de beauté »). */
  activity: string;
  /** Photo facultative, chemin sous /public (ex. « /images/avis/camille.webp »). */
  photo?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: "Mes clientes réservent le soir depuis leur téléphone et je retrouve les rendez-vous le matin dans mon agenda. Je ne réponds plus aux messages entre deux soins.",
    firstName: "Camille",
    establishment: "Institut Lumière",
    activity: "Institut de beauté",
  },
  {
    quote: "Le rappel par email a fait baisser les oublis. Tout est clair, sans options inutiles.",
    firstName: "Sarah",
    establishment: "Nail Room",
    activity: "Onglerie",
  },
  {
    quote: "J’ai configuré mes prestations et mes horaires en une soirée. Mon lien de réservation est sur mon Instagram et dans ma bio.",
    firstName: "Inès",
    establishment: "Atelier du Regard",
    activity: "Regard et cils",
  },
  {
    quote: "Nous sommes trois au salon et chacune voit ses rendez-vous. Plus de double réservation sur le même créneau.",
    firstName: "Julie",
    establishment: "Maison Alba",
    activity: "Coiffure",
  },
  {
    quote: "Les confirmations partent toutes seules. Mes clientes savent exactement à quelle heure venir et avec qui.",
    firstName: "Léa",
    establishment: "Spa Nara",
    activity: "Spa et soins",
  },
  {
    quote: "Un prix simple et aucune commission sur mes rendez-vous. C’est ce que je cherchais.",
    firstName: "Manon",
    establishment: "Studio M",
    activity: "Institut de beauté",
  },
];
