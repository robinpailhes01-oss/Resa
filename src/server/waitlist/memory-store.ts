import { randomUUID } from "node:crypto";
import type {
  EmailTask,
  EmailTaskKind,
  NewEntryInput,
  TokenLookup,
  TokenRecord,
  WaitlistEntry,
  WaitlistStore,
} from "./types";

export interface MemorySnapshot {
  entries: WaitlistEntry[];
  tasks: EmailTask[];
  tokens: TokenRecord[];
  idempotency: Array<{ key: string; expiresAt: Date }>;
}

/**
 * Implémentation en mémoire du contrat de persistance.
 * Sert aux tests et, via FileWaitlistStore, au développement local.
 * Les opérations sont synchrones en interne, donc atomiques.
 */
export class MemoryWaitlistStore implements WaitlistStore {
  protected entries = new Map<string, WaitlistEntry>();
  protected tasks = new Map<string, EmailTask>();
  protected tokens = new Map<string, TokenRecord>();
  protected idempotency = new Map<string, Date>();

  /** Simule une panne de base pour les tests (F09). */
  failNext: Error | null = null;

  protected async persist(): Promise<void> {}

  private guard(): void {
    if (this.failNext) {
      const error = this.failNext;
      this.failNext = null;
      throw error;
    }
  }

  async findByEmail(emailNormalized: string): Promise<WaitlistEntry | null> {
    this.guard();
    for (const entry of this.entries.values()) {
      if (entry.emailNormalized === emailNormalized) return { ...entry };
    }
    return null;
  }

  async createEntryWithTask(input: NewEntryInput, now: Date) {
    this.guard();
    const entry: WaitlistEntry = {
      id: randomUUID(),
      ...input,
      status: "pending",
      createdAt: now,
      confirmedAt: null,
      unsubscribedAt: null,
    };
    this.entries.set(entry.id, entry);
    const task = this.newTask(entry.id, "confirmation", now);
    await this.persist();
    return { entry: { ...entry }, task: { ...task } };
  }

  async reopenEntryWithTask(entryId: string, input: NewEntryInput, now: Date) {
    this.guard();
    const entry = this.entries.get(entryId);
    if (!entry) throw new Error("Demande introuvable");
    Object.assign(entry, {
      emailOriginal: input.emailOriginal,
      businessType: input.businessType,
      teamSize: input.teamSize,
      privacyVersion: input.privacyVersion,
      source: input.source,
      attribution: input.attribution,
      status: "pending",
      createdAt: now,
      confirmedAt: null,
      unsubscribedAt: null,
    });
    const task = this.newTask(entry.id, "confirmation", now);
    await this.persist();
    return { entry: { ...entry }, task: { ...task } };
  }

  async createTask(entryId: string, kind: EmailTaskKind, now: Date): Promise<EmailTask> {
    this.guard();
    const task = this.newTask(entryId, kind, now);
    await this.persist();
    return { ...task };
  }

  private newTask(entryId: string, kind: EmailTaskKind, now: Date): EmailTask {
    const task: EmailTask = {
      id: randomUUID(),
      entryId,
      kind,
      status: "pending",
      attempts: 0,
      lastError: null,
      nextAttemptAt: now,
      createdAt: now,
      sentAt: null,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  async countTasksSince(entryId: string, since: Date): Promise<number> {
    this.guard();
    let count = 0;
    for (const task of this.tasks.values()) {
      if (task.entryId === entryId && task.createdAt >= since) count += 1;
    }
    return count;
  }

  async claimDueTasks(limit: number, now: Date) {
    this.guard();
    const due = [...this.tasks.values()]
      .filter((task) => task.status === "pending" && task.nextAttemptAt <= now)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, limit);
    const claimed: Array<{ task: EmailTask; entry: WaitlistEntry }> = [];
    for (const task of due) {
      const entry = this.entries.get(task.entryId);
      if (!entry) continue;
      task.status = "processing";
      claimed.push({ task: { ...task }, entry: { ...entry } });
    }
    await this.persist();
    return claimed;
  }

  async markTaskSent(taskId: string, now: Date): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.status = "sent";
    task.sentAt = now;
    task.attempts += 1;
    task.lastError = null;
    await this.persist();
  }

  async markTaskFailed(taskId: string, error: string, nextAttemptAt: Date | null, now: Date): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.attempts += 1;
    task.lastError = error;
    if (nextAttemptAt) {
      task.status = "pending";
      task.nextAttemptAt = nextAttemptAt;
    } else {
      task.status = "failed";
      task.nextAttemptAt = now;
    }
    await this.persist();
  }

  async saveToken(record: TokenRecord): Promise<void> {
    this.guard();
    this.tokens.set(record.tokenHash, { ...record });
    await this.persist();
  }

  async findToken(tokenHash: string): Promise<TokenLookup | null> {
    this.guard();
    const token = this.tokens.get(tokenHash);
    if (!token) return null;
    const entry = this.entries.get(token.entryId);
    if (!entry) return null;
    return { token: { ...token }, entry: { ...entry } };
  }

  async confirmEntry(entryId: string, tokenHash: string, now: Date): Promise<boolean> {
    this.guard();
    const token = this.tokens.get(tokenHash);
    const entry = this.entries.get(entryId);
    if (!token || !entry || token.usedAt || token.entryId !== entryId) return false;
    token.usedAt = now;
    if (entry.status !== "confirmed") {
      entry.status = "confirmed";
      entry.confirmedAt = now;
      entry.unsubscribedAt = null;
    }
    await this.persist();
    return true;
  }

  async unsubscribeEntry(entryId: string, tokenHash: string, now: Date): Promise<boolean> {
    this.guard();
    const token = this.tokens.get(tokenHash);
    const entry = this.entries.get(entryId);
    if (!token || !entry || token.entryId !== entryId) return false;
    if (entry.status !== "unsubscribed") {
      entry.status = "unsubscribed";
      entry.unsubscribedAt = now;
    }
    await this.persist();
    return true;
  }

  async rememberIdempotencyKey(key: string, expiresAt: Date, now: Date): Promise<boolean> {
    this.guard();
    for (const [k, exp] of this.idempotency) {
      if (exp <= now) this.idempotency.delete(k);
    }
    if (this.idempotency.has(key)) return false;
    this.idempotency.set(key, expiresAt);
    await this.persist();
    return true;
  }

  async forgetIdempotencyKey(key: string): Promise<void> {
    this.idempotency.delete(key);
    await this.persist();
  }

  async purge({ pendingBefore, confirmedBefore, now }: { pendingBefore: Date; confirmedBefore: Date | null; now: Date }): Promise<number> {
    this.guard();
    let removed = 0;
    for (const [id, entry] of this.entries) {
      const stalePending = entry.status === "pending" && entry.createdAt < pendingBefore;
      const staleConfirmed =
        confirmedBefore !== null && entry.status === "confirmed" && entry.confirmedAt !== null && entry.confirmedAt < confirmedBefore;
      if (stalePending || staleConfirmed) {
        this.entries.delete(id);
        removed += 1;
        for (const [taskId, task] of this.tasks) if (task.entryId === id) this.tasks.delete(taskId);
        for (const [hash, token] of this.tokens) if (token.entryId === id) this.tokens.delete(hash);
      }
    }
    for (const [hash, token] of this.tokens) {
      if (token.expiresAt && token.expiresAt < now) {
        this.tokens.delete(hash);
        removed += 1;
      }
    }
    await this.persist();
    return removed;
  }

  /** Accès de lecture pour les tests et l'outillage local. */
  snapshot(): MemorySnapshot {
    return {
      entries: [...this.entries.values()].map((e) => ({ ...e })),
      tasks: [...this.tasks.values()].map((t) => ({ ...t })),
      tokens: [...this.tokens.values()].map((t) => ({ ...t })),
      idempotency: [...this.idempotency].map(([key, expiresAt]) => ({ key, expiresAt })),
    };
  }

  load(snapshot: MemorySnapshot): void {
    this.entries = new Map(snapshot.entries.map((e) => [e.id, e]));
    this.tasks = new Map(snapshot.tasks.map((t) => [t.id, t]));
    this.tokens = new Map(snapshot.tokens.map((t) => [t.tokenHash, t]));
    this.idempotency = new Map(snapshot.idempotency.map((i) => [i.key, i.expiresAt]));
  }
}
