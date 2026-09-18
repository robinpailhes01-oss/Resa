import postgres, { type Sql } from "postgres";
import type {
  Attribution,
  BusinessType,
  EmailTask,
  EmailTaskKind,
  NewEntryInput,
  TeamSize,
  TokenLookup,
  TokenRecord,
  WaitlistEntry,
  WaitlistStatus,
  WaitlistStore,
} from "./types";

type EntryRow = {
  id: string;
  email_normalized: string;
  email_original: string;
  business_type: BusinessType | null;
  team_size: TeamSize | null;
  status: WaitlistStatus;
  created_at: Date;
  confirmed_at: Date | null;
  unsubscribed_at: Date | null;
  privacy_version: string;
  source: string;
  attribution: Attribution | null;
};

type TaskRow = {
  id: string;
  entry_id: string;
  kind: EmailTaskKind;
  status: EmailTask["status"];
  attempts: number;
  last_error: string | null;
  next_attempt_at: Date;
  created_at: Date;
  sent_at: Date | null;
};

type TokenRow = {
  token_hash: string;
  entry_id: string;
  purpose: TokenRecord["purpose"];
  created_at: Date;
  expires_at: Date | null;
  used_at: Date | null;
};

const mapEntry = (row: EntryRow): WaitlistEntry => ({
  id: row.id,
  emailNormalized: row.email_normalized,
  emailOriginal: row.email_original,
  businessType: row.business_type,
  teamSize: row.team_size,
  status: row.status,
  createdAt: row.created_at,
  confirmedAt: row.confirmed_at,
  unsubscribedAt: row.unsubscribed_at,
  privacyVersion: row.privacy_version,
  source: row.source,
  attribution: row.attribution,
});

const mapTask = (row: TaskRow): EmailTask => ({
  id: row.id,
  entryId: row.entry_id,
  kind: row.kind,
  status: row.status,
  attempts: row.attempts,
  lastError: row.last_error,
  nextAttemptAt: row.next_attempt_at,
  createdAt: row.created_at,
  sentAt: row.sent_at,
});

const mapToken = (row: TokenRow): TokenRecord => ({
  tokenHash: row.token_hash,
  entryId: row.entry_id,
  purpose: row.purpose,
  createdAt: row.created_at,
  expiresAt: row.expires_at,
  usedAt: row.used_at,
});

/** Implémentation PostgreSQL (requêtes paramétrées, transactions explicites). */
export class PostgresWaitlistStore implements WaitlistStore {
  constructor(private readonly sql: Sql) {}

  static fromUrl(url: string): PostgresWaitlistStore {
    const sql = postgres(url, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // compatible avec les poolers en mode transaction (Supabase, PgBouncer)
    });
    return new PostgresWaitlistStore(sql);
  }

  async findByEmail(emailNormalized: string): Promise<WaitlistEntry | null> {
    const rows = await this.sql<EntryRow[]>`select * from waitlist where email_normalized = ${emailNormalized} limit 1`;
    return rows[0] ? mapEntry(rows[0]) : null;
  }

  async createEntryWithTask(input: NewEntryInput, now: Date) {
    return this.sql.begin(async (tx) => {
      const [entry] = await tx<EntryRow[]>`
        insert into waitlist (email_normalized, email_original, business_type, team_size, status, created_at, privacy_version, source, attribution)
        values (${input.emailNormalized}, ${input.emailOriginal}, ${input.businessType}, ${input.teamSize}, 'pending', ${now}, ${input.privacyVersion}, ${input.source}, ${input.attribution ? tx.json(input.attribution) : null})
        returning *`;
      const [task] = await tx<TaskRow[]>`
        insert into waitlist_email_tasks (entry_id, kind, status, next_attempt_at, created_at)
        values (${entry.id}, 'confirmation', 'pending', ${now}, ${now})
        returning *`;
      return { entry: mapEntry(entry), task: mapTask(task) };
    });
  }

  async reopenEntryWithTask(entryId: string, input: NewEntryInput, now: Date) {
    return this.sql.begin(async (tx) => {
      const [entry] = await tx<EntryRow[]>`
        update waitlist set
          email_original = ${input.emailOriginal},
          business_type = ${input.businessType},
          team_size = ${input.teamSize},
          privacy_version = ${input.privacyVersion},
          source = ${input.source},
          attribution = ${input.attribution ? tx.json(input.attribution) : null},
          status = 'pending', created_at = ${now}, confirmed_at = null, unsubscribed_at = null
        where id = ${entryId}
        returning *`;
      if (!entry) throw new Error("Demande introuvable");
      const [task] = await tx<TaskRow[]>`
        insert into waitlist_email_tasks (entry_id, kind, status, next_attempt_at, created_at)
        values (${entryId}, 'confirmation', 'pending', ${now}, ${now})
        returning *`;
      return { entry: mapEntry(entry), task: mapTask(task) };
    });
  }

  async createTask(entryId: string, kind: EmailTaskKind, now: Date): Promise<EmailTask> {
    const [task] = await this.sql<TaskRow[]>`
      insert into waitlist_email_tasks (entry_id, kind, status, next_attempt_at, created_at)
      values (${entryId}, ${kind}, 'pending', ${now}, ${now})
      returning *`;
    return mapTask(task);
  }

  async countTasksSince(entryId: string, since: Date): Promise<number> {
    const [row] = await this.sql<Array<{ count: string }>>`
      select count(*)::text as count from waitlist_email_tasks where entry_id = ${entryId} and created_at >= ${since}`;
    return Number(row?.count ?? 0);
  }

  async claimDueTasks(limit: number, now: Date) {
    return this.sql.begin(async (tx) => {
      const tasks = await tx<TaskRow[]>`
        update waitlist_email_tasks set status = 'processing'
        where id in (
          select id from waitlist_email_tasks
          where status = 'pending' and next_attempt_at <= ${now}
          order by created_at
          limit ${limit}
          for update skip locked
        )
        returning *`;
      if (tasks.length === 0) return [];
      const entryIds = tasks.map((t) => t.entry_id);
      const entries = await tx<EntryRow[]>`select * from waitlist where id in ${tx(entryIds)}`;
      const byId = new Map(entries.map((e) => [e.id, mapEntry(e)]));
      return tasks
        .filter((t) => byId.has(t.entry_id))
        .map((t) => ({ task: mapTask(t), entry: byId.get(t.entry_id)! }));
    });
  }

  async markTaskSent(taskId: string, now: Date): Promise<void> {
    await this.sql`
      update waitlist_email_tasks set status = 'sent', sent_at = ${now}, attempts = attempts + 1, last_error = null
      where id = ${taskId}`;
  }

  async markTaskFailed(taskId: string, error: string, nextAttemptAt: Date | null, now: Date): Promise<void> {
    if (nextAttemptAt) {
      await this.sql`
        update waitlist_email_tasks set status = 'pending', attempts = attempts + 1, last_error = ${error}, next_attempt_at = ${nextAttemptAt}
        where id = ${taskId}`;
    } else {
      await this.sql`
        update waitlist_email_tasks set status = 'failed', attempts = attempts + 1, last_error = ${error}, next_attempt_at = ${now}
        where id = ${taskId}`;
    }
  }

  async saveToken(record: TokenRecord): Promise<void> {
    await this.sql`
      insert into waitlist_tokens (token_hash, entry_id, purpose, created_at, expires_at, used_at)
      values (${record.tokenHash}, ${record.entryId}, ${record.purpose}, ${record.createdAt}, ${record.expiresAt}, ${record.usedAt})`;
  }

  async findToken(tokenHash: string): Promise<TokenLookup | null> {
    const rows = await this.sql<Array<TokenRow & { entry: EntryRow }>>`
      select t.*, row_to_json(w.*) as entry
      from waitlist_tokens t join waitlist w on w.id = t.entry_id
      where t.token_hash = ${tokenHash} limit 1`;
    const row = rows[0];
    if (!row) return null;
    const entry = row.entry;
    return {
      token: mapToken(row),
      entry: mapEntry({
        ...entry,
        created_at: new Date(entry.created_at),
        confirmed_at: entry.confirmed_at ? new Date(entry.confirmed_at) : null,
        unsubscribed_at: entry.unsubscribed_at ? new Date(entry.unsubscribed_at) : null,
      }),
    };
  }

  async confirmEntry(entryId: string, tokenHash: string, now: Date): Promise<boolean> {
    return this.sql.begin(async (tx) => {
      const used = await tx`
        update waitlist_tokens set used_at = ${now}
        where token_hash = ${tokenHash} and entry_id = ${entryId} and used_at is null
        returning token_hash`;
      if (used.length === 0) return false;
      await tx`
        update waitlist set status = 'confirmed', confirmed_at = coalesce(confirmed_at, ${now}), unsubscribed_at = null
        where id = ${entryId} and status <> 'confirmed'`;
      return true;
    });
  }

  async unsubscribeEntry(entryId: string, tokenHash: string, now: Date): Promise<boolean> {
    return this.sql.begin(async (tx) => {
      const token = await tx`select 1 from waitlist_tokens where token_hash = ${tokenHash} and entry_id = ${entryId}`;
      if (token.length === 0) return false;
      await tx`
        update waitlist set status = 'unsubscribed', unsubscribed_at = ${now}
        where id = ${entryId} and status <> 'unsubscribed'`;
      return true;
    });
  }

  async rememberIdempotencyKey(key: string, expiresAt: Date, now: Date): Promise<boolean> {
    await this.sql`delete from waitlist_idempotency where expires_at <= ${now}`;
    const inserted = await this.sql`
      insert into waitlist_idempotency (key, expires_at) values (${key}, ${expiresAt})
      on conflict (key) do nothing
      returning key`;
    return inserted.length > 0;
  }

  async forgetIdempotencyKey(key: string): Promise<void> {
    await this.sql`delete from waitlist_idempotency where key = ${key}`;
  }

  async purge({ pendingBefore, confirmedBefore, now }: { pendingBefore: Date; confirmedBefore: Date | null; now: Date }): Promise<number> {
    return this.sql.begin(async (tx) => {
      const pending = await tx`delete from waitlist where status = 'pending' and created_at < ${pendingBefore} returning id`;
      const confirmed = confirmedBefore
        ? await tx`delete from waitlist where status = 'confirmed' and confirmed_at < ${confirmedBefore} returning id`
        : [];
      const tokens = await tx`delete from waitlist_tokens where expires_at is not null and expires_at < ${now} returning token_hash`;
      return pending.length + confirmed.length + tokens.length;
    });
  }

  async close(): Promise<void> {
    await this.sql.end({ timeout: 5 });
  }
}
