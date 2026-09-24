/**
 * Textes des emails de prospection (B2B, professionnels de la beauté).
 * Règles : expéditeur identifié, objet lié à l'activité du destinataire,
 * désinscription en un clic, aucune promesse au-delà des fonctions réelles.
 */

export interface ProspectionEmailInput {
  /** Nom de l'établissement tel qu'affiché sur sa fiche Google. */
  establishmentName: string;
  /** Libellé pluriel de la catégorie (« salons de coiffure »). */
  categoryPlural: string;
  /** Outil de réservation détecté (« Planity »), ou null. */
  providerLabel: string | null;
  /** Lien d'essai (landing avec paramètres de suivi). */
  trialUrl: string;
  /** Lien de désinscription en un clic. */
  unsubscribeUrl: string;
  /** Prix mensuel affiché (« 39 € HT »). */
  priceLabel: string;
  /** Durée d'essai en jours, ou null si désactivée. */
  trialDays: number | null;
  senderName: string;
  brandName: string;
  legalEntity: string;
}

export const prospectionContent = {
  senderName: "Robin Pailhes",
  fromName: "Robin de Reso",
  subjects: {
    withProvider: (name: string, provider: string) => `Une alternative à ${provider} pour ${name} ?`,
    generic: (name: string) => `Réservation en ligne pour ${name}, sans commission`,
    followUp: (name: string) => `Re : réservation en ligne pour ${name}`,
  },
  first: (i: ProspectionEmailInput): string[] => [
    "Bonjour,",
    `Je suis ${i.senderName}, fondateur de ${i.brandName}, un outil de réservation en ligne pensé pour les ${i.categoryPlural} indépendants.`,
    i.providerLabel
      ? `J’ai vu que ${i.establishmentName} propose la réservation via ${i.providerLabel}. ${i.brandName} couvre le même besoin (agenda, page de réservation, confirmations et rappels par email, demandes d’avis Google) pour ${i.priceLabel} par mois, sans engagement ni commission sur vos rendez-vous.`
      : `${i.brandName} donne à ${i.establishmentName} une page de réservation en ligne, un agenda, des confirmations et rappels par email et des demandes d’avis Google, pour ${i.priceLabel} par mois, sans engagement ni commission sur vos rendez-vous.`,
    "Votre fiche Google s’importe en un clic (photos, horaires, adresse) : l’espace est prêt en dix minutes.",
    i.trialDays ? `${i.trialDays} jours d’essai gratuit, sans carte bancaire : ${i.trialUrl}` : `Découvrir : ${i.trialUrl}`,
    "Si ce n’est pas le moment, répondez simplement « non merci » et je ne vous relancerai pas.",
    `Bonne journée,\n${i.senderName}\n${i.brandName}`,
  ],
  followUp: (i: ProspectionEmailInput): string[] => [
    "Bonjour,",
    `Je me permets une courte relance : la réservation en ligne est-elle un sujet pour ${i.establishmentName} en ce moment ?`,
    `${i.brandName}, c’est ${i.priceLabel} par mois, sans engagement, avec votre fiche Google importée en un clic.${i.trialDays ? ` L’essai de ${i.trialDays} jours est gratuit et sans carte bancaire : ${i.trialUrl}` : ""}`,
    "Un simple « non merci » en réponse et je ne reviendrai pas vers vous.",
    `Bonne journée,\n${i.senderName}\n${i.brandName}`,
  ],
  footer: (i: ProspectionEmailInput): string =>
    `${i.brandName} est édité par ${i.legalEntity}. Vous recevez cet email professionnel parce que ${i.establishmentName} est référencé publiquement (fiche Google, site internet). Ne plus recevoir d’emails : ${i.unsubscribeUrl}`,
  unsubscribePage: {
    title: "Ne plus recevoir d’emails",
    intro: "Confirmez pour que nous ne vous écrivions plus. Aucune autre information ne vous sera demandée.",
    button: "Ne plus me contacter",
    doneTitle: "C’est noté",
    done: "Vous ne recevrez plus d’email de prospection de notre part.",
    invalidTitle: "Lien invalide",
    invalid: "Ce lien de désinscription n’est pas reconnu. Répondez simplement à l’email reçu et nous ferons le nécessaire.",
  },
} as const;
