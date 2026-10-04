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
  /** Prix mensuel affiché (« 29 € TTC »). */
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
  /** Campagnes ponctuelles : texte validé tel quel par l'équipe. */
  campaigns: {
    "herault-shooting": {
      fromName: "Ludivine & Robin · Reso",
      subject: (name: string) => `Un shooting photo offert pour ${name} 📸`,
      paragraphs: (siteUrl: string): string[] => [
        "Bonjour ! C’est Ludivine et Robin 👋 Avec mon équipe, on a créé Reso ici à Montpellier pour aider les salons à gérer leurs rendez-vous plus simplement.",
        "Pour faire découvrir l’appli aux salons du coin, on offre un shooting photo de votre salon pour toute inscription 📸 Et vous pouvez la tester une semaine gratuitement, sans carte bancaire.",
        `Je vous laisse le lien pour jeter un œil : ${siteUrl}`,
      ],
    },
  } as Record<string, { fromName: string; subject: (name: string) => string; paragraphs: (siteUrl: string) => string[] }>,
  /** Pas de pied de page : un « non » en réponse suffit, il est reconnu et respecté (plus aucun contact). */
  footer: (_i: ProspectionEmailInput): string => "",
  admin: {
    title: "Suivi de la prospection",
    intro: "Cochez les salons qui vous ont répondu : ils ne seront jamais relancés. Les autres peuvent être relancés une fois les réponses vérifiées.",
    awaiting: "En attente de réponse",
    replied: "Ont répondu",
    declined: "Pas intéressés",
    signedUp: "Inscrits",
    followedUp: "Relancés",
    empty: "Aucun salon dans cette catégorie.",
    markReplied: "A répondu",
    markDeclined: "Pas intéressé",
    undo: "Annuler",
    firstEmail: "Email le",
    followUpOn: "Relancé le",
    followUpBlocked: "Relance en attente de votre feu vert",
    followUpScheduled: "Relance prévue",
    allowTitle: "Relancer ceux qui n’ont pas répondu",
    allowHelp: (n: number) =>
      n > 0
        ? `${n} salon${n > 1 ? "s" : ""} en attente. Vérifiez d’abord votre boîte contact@ et marquez ceux qui ont répondu. La relance part ensuite au prochain envoi du matin, 5 jours après le premier email, jours ouvrés seulement.`
        : "Aucune relance en attente de votre feu vert.",
    allowButton: "Autoriser la relance des autres",
    done: {
      replied: "Marqué « a répondu » : aucune relance.",
      declined: "Marqué « pas intéressé » : plus aucun contact.",
      undo: "Annulé : le salon est de nouveau en attente.",
      allow: "Relance autorisée pour les salons restés sans réponse.",
    } as Record<string, string>,
  },
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
