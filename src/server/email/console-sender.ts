import type { EmailMessage, EmailSender } from "./types";

/**
 * Expéditeur de développement : écrit le message sur la sortie standard.
 * Jamais utilisé en production (voir src/server/email/index.ts).
 */
export class ConsoleEmailSender implements EmailSender {
  readonly name = "console";
  readonly sent: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<void> {
    this.sent.push(message);
    if (process.env.NODE_ENV !== "test") {
      console.info(`\n[email:console] À : ${message.to}\n[email:console] Objet : ${message.subject}\n${message.text}\n`);
    }
  }
}
