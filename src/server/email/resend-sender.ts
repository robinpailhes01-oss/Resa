import { EmailProviderError, type EmailMessage, type EmailSender } from "./types";

type ResendOptions = {
  apiKey: string;
  /** Expéditeur affiché : « Reso <bonjour@domaine-configure> ». */
  from: string;
  fetchImpl?: typeof fetch;
};

/**
 * Compose l'en-tête From : `fromName` remplace le nom affiché d'EMAIL_FROM,
 * l'adresse (entre chevrons ou nue) est conservée.
 */
export function composeFrom(configured: string, fromName?: string): string {
  if (!fromName) return configured;
  const match = configured.match(/<([^>]+)>\s*$/);
  const address = (match ? match[1] : configured).trim();
  const name = fromName.replace(/["<>\r\n]/g, "").trim();
  return name ? `${name} <${address}>` : configured;
}

/** Adaptateur Resend (https://resend.com) via son API HTTP, sans SDK. */
export class ResendEmailSender implements EmailSender {
  readonly name = "resend";
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: ResendOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async send(message: EmailMessage): Promise<void> {
    const response = await this.fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: composeFrom(this.options.from, message.fromName),
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        reply_to: message.replyTo,
      }),
    });

    if (response.ok) return;
    const retryable = response.status === 429 || response.status >= 500;
    const detail = (await response.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 200);
    throw new EmailProviderError(`Resend a répondu ${response.status}${detail ? ` : ${detail}` : ""}`, retryable);
  }
}
