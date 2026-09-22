/**
 * Témoignages réels et autorisés (section « Avis »).
 *
 * Tant que cette liste est vide, la landing affiche un bloc de pré-lancement.
 * Dès qu'un avis est ajouté, les cartes s'affichent automatiquement et le bloc
 * d'attente disparaît. N'ajouter que des citations autorisées par leur auteur ;
 * aucun avis, note ou logo fictif.
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

export const testimonials: Testimonial[] = [];
