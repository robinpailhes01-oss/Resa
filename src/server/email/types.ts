export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface EmailSender {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

export class EmailProviderError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "EmailProviderError";
  }
}
