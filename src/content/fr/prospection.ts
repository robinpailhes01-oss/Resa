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
    followUp: (name: string, provider: string | null) => `Re : ${provider ? `Une alternative à ${provider} pour ${name} ?` : `réservation en ligne pour ${name}`}`,
  },
  first: (i: ProspectionEmailInput): string[] => [
    "Bonjour,",
    `Je suis ${i.senderName.split(" ")[0]}, fondateur de ${i.brandName}. J’ai vu que ${i.establishmentName} utilise ${i.providerLabel ?? "un outil de réservation"}.`,
    `${i.brandName} fait la même chose (agenda, réservation en ligne, rappels, avis Google) pour ${i.priceLabel} par mois, sans engagement ni commission.`,
    i.trialDays ? `Envie de tester ? ${i.trialDays} jours gratuits, sans carte : ${i.trialUrl}` : `Envie de voir ? ${i.trialUrl}`,
    "Si ce n’est pas le moment, un simple « non merci » suffit.",
    `${i.senderName}\n${i.brandName}`,
  ],
  followUp: (i: ProspectionEmailInput): string[] => [
    "Bonjour,",
    `Petite relance : la réservation en ligne est-elle un sujet pour ${i.establishmentName} en ce moment ?`,
    `${i.brandName}, c’est ${i.priceLabel} par mois, sans engagement.${i.trialDays ? ` Essai de ${i.trialDays} jours gratuit : ${i.trialUrl}` : ""}`,
    "Un « non merci » et je ne reviens pas vers vous.",
    `${i.senderName}\n${i.brandName}`,
  ],
  /** Une seule ligne : le lien de désinscription, obligatoire pour la prospection par email. */
  footer: (i: ProspectionEmailInput): string => `Ne plus recevoir d’emails : ${i.unsubscribeUrl}`,
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
