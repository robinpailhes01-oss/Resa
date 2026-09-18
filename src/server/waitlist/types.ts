/** Modèle de données minimal de la liste d'attente (cahier des charges §10). */

export type WaitlistStatus = "pending" | "confirmed" | "unsubscribed";

export type BusinessType = "institut" | "onglerie" | "regard_cils" | "coiffure_barbier" | "spa_soins" | "autre";
export type TeamSize = "solo" | "2_3" | "4_plus";

/** Clés UTM autorisées ; valeurs tronquées, jamais d'identifiant personnel. */
export type Attribution = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_content", string>>;

export interface WaitlistEntry {
  id: string;
  emailNormalized: string;
  emailOriginal: string;
  businessType: BusinessType | null;
  teamSize: TeamSize | null;
  status: WaitlistStatus;
  createdAt: Date;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
  privacyVersion: string;
  source: string;
  attribution: Attribution | null;
}

export type EmailTaskKind = "confirmation";
export type EmailTaskStatus = "pending" | "processing" | "sent" | "failed";

export interface EmailTask {
  id: string;
  entryId: string;
  kind: EmailTaskKind;
  status: EmailTaskStatus;
  attempts: number;
  lastError: string | null;
  nextAttemptAt: Date;
  createdAt: Date;
  sentAt: Date | null;
}

export type TokenPurpose = "confirm" | "unsubscribe";

export interface TokenRecord {
  /** SHA-256 hexadécimal du jeton brut ; le jeton brut n'est jamais stocké. */
  tokenHash: string;
  entryId: string;
  purpose: TokenPurpose;
  createdAt: Date;
  /** `null` pour un jeton sans expiration (désinscription). */
  expiresAt: Date | null;
  usedAt: Date | null;
}

export interface NewEntryInput {
  emailNormalized: string;
  emailOriginal: string;
  businessType: BusinessType | null;
  teamSize: TeamSize | null;
  privacyVersion: string;
  source: string;
  attribution: Attribution | null;
}

export interface TokenLookup {
  token: TokenRecord;
  entry: WaitlistEntry;
}

/**
 * Contrat de persistance. Chaque méthode qui touche plusieurs lignes doit
 * être atomique dans l'implémentation (transaction SQL).
 */
export interface WaitlistStore {
  findByEmail(emailNormalized: string): Promise<WaitlistEntry | null>;

  /** Crée la demande et sa tâche d'envoi dans une même transaction. */
  createEntryWithTask(input: NewEntryInput, now: Date): Promise<{ entry: WaitlistEntry; task: EmailTask }>;

  /** Remet une demande en attente (après désinscription) et crée une tâche d'envoi. */
  reopenEntryWithTask(entryId: string, input: NewEntryInput, now: Date): Promise<{ entry: WaitlistEntry; task: EmailTask }>;

  /** Crée une nouvelle tâche d'envoi pour une demande en attente. */
  createTask(entryId: string, kind: EmailTaskKind, now: Date): Promise<EmailTask>;

  /** Nombre de tâches créées pour cette demande depuis `since`. */
  countTasksSince(entryId: string, since: Date): Promise<number>;

  /** Réserve les tâches dues, par ordre de création. */
  claimDueTasks(limit: number, now: Date): Promise<Array<{ task: EmailTask; entry: WaitlistEntry }>>;
  markTaskSent(taskId: string, now: Date): Promise<void>;
  markTaskFailed(taskId: string, error: string, nextAttemptAt: Date | null, now: Date): Promise<void>;

  saveToken(record: TokenRecord): Promise<void>;
  findToken(tokenHash: string): Promise<TokenLookup | null>;

  /** Consomme le jeton et confirme l'inscription en une transaction. Retourne false si déjà consommé. */
  confirmEntry(entryId: string, tokenHash: string, now: Date): Promise<boolean>;

  /** Retire l'inscription en une transaction. */
  unsubscribeEntry(entryId: string, tokenHash: string, now: Date): Promise<boolean>;

  /** Mémorise une clé d'idempotence ; retourne true si elle est nouvelle. */
  rememberIdempotencyKey(key: string, expiresAt: Date, now: Date): Promise<boolean>;
  forgetIdempotencyKey(key: string): Promise<void>;

  /** Purge : demandes non confirmées trop anciennes et jetons expirés. Retourne le nombre de lignes supprimées. */
  purge(options: { pendingBefore: Date; confirmedBefore: Date | null; now: Date }): Promise<number>;
}

export class StoreUnavailableError extends Error {
  constructor(message = "Base de données indisponible") {
    super(message);
    this.name = "StoreUnavailableError";
  }
}
