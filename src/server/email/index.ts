import { offer } from "@/config/offer";
import { ConsoleEmailSender } from "./console-sender";
import { ResendEmailSender } from "./resend-sender";
import type { EmailSender } from "./types";

let sender: EmailSender | null = null;

/**
 * Sélection de l'expéditeur :
 * - RESEND_API_KEY + EMAIL_FROM définis → Resend ;
 * - EMAIL_PROVIDER=console (recette locale) ou hors production → console ;
 * - sinon → erreur explicite (aucun envoi silencieux en production).
 */
export function getEmailSender(): EmailSender {
  if (sender) return sender;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const forcedConsole = process.env.EMAIL_PROVIDER?.trim() === "console";
  if (apiKey && from && !forcedConsole) {
    sender = new ResendEmailSender({ apiKey, from });
  } else if (forcedConsole || process.env.NODE_ENV !== "production") {
    sender = new ConsoleEmailSender();
  } else {
    throw new Error("Aucun fournisseur email configuré (RESEND_API_KEY et EMAIL_FROM requis en production).");
  }
  return sender;
}

/** Réservé aux tests : injecte un expéditeur. */
export function setEmailSenderForTests(next: EmailSender | null): void {
  sender = next;
}

export function absoluteUrl(path: string): string {
  return new URL(path, offer.siteUrl).toString();
}
