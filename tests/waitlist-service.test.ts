import { beforeEach, describe, expect, it } from "vitest";
import { ConsoleEmailSender } from "@/server/email/console-sender";
import { setEmailSenderForTests } from "@/server/email";
import { EmailProviderError, type EmailMessage, type EmailSender } from "@/server/email/types";
import { MemoryWaitlistStore } from "@/server/waitlist/memory-store";
import {
  CONFIRM_TOKEN_TTL_MS,
  confirmWaitlistSignup,
  peekConfirmToken,
  processEmailTasks,
  purgeWaitlist,
  requestWaitlistSignup,
  unsubscribeFromWaitlist,
} from "@/server/waitlist/service";
import { hashToken } from "@/server/waitlist/tokens";

const base = { email: "Marie@Institut.fr", privacyVersion: "2026-09-18", locale: "fr" as const, source: "landing" as const };

let store: MemoryWaitlistStore;
let sender: ConsoleEmailSender;
let clock: Date;
const now = () => clock;

function extractToken(message: EmailMessage): string {
  const match = message.text.match(/token=([A-Za-z0-9_-]+)/);
  if (!match) throw new Error("jeton absent de l'email");
  return match[1];
}

beforeEach(() => {
  store = new MemoryWaitlistStore();
  sender = new ConsoleEmailSender();
  setEmailSenderForTests(sender);
  clock = new Date("2026-09-18T10:00:00Z");
});

describe("demande d'inscription (F07, F08)", () => {
  it("enregistre la demande et sa tâche email dans la même opération", async () => {
    const outcome = await requestWaitlistSignup(base, { store, now });
    expect(outcome).toEqual({ kind: "accepted", taskCreated: true });
    const snap = store.snapshot();
    expect(snap.entries).toHaveLength(1);
    expect(snap.entries[0].emailNormalized).toBe("marie@institut.fr");
    expect(snap.entries[0].emailOriginal).toBe("Marie@Institut.fr");
    expect(snap.entries[0].status).toBe("pending");
    expect(snap.tasks).toHaveLength(1);
  });

  it("n'écrit pas le jeton en clair et envoie l'email de confirmation exact", async () => {
    await requestWaitlistSignup(base, { store, now });
    const summary = await processEmailTasks(10, { store, now });
    expect(summary).toEqual({ claimed: 1, sent: 1, failed: 0 });
    expect(sender.sent).toHaveLength(1);
    const message = sender.sent[0];
    expect(message.subject).toBe("Confirmez votre inscription au lancement de Reso");
    expect(message.text).toContain("Ce lien est valable pendant 48 heures");
    expect(message.html).not.toContain("<img");
    const raw = extractToken(message);
    const snap = store.snapshot();
    expect(snap.tokens[0].tokenHash).toBe(hashToken(raw));
    expect(JSON.stringify(snap)).not.toContain(raw);
  });

  it("ne crée qu'un seul prospect pour un doublon et plafonne les envois", async () => {
    for (let i = 0; i < 5; i += 1) {
      const outcome = await requestWaitlistSignup({ ...base, email: " marie@institut.fr " }, { store, now });
      expect(outcome.kind).toBe("accepted");
    }
    const snap = store.snapshot();
    expect(snap.entries).toHaveLength(1);
    expect(snap.tasks).toHaveLength(3); // 3 emails / heure par adresse
  });

  it("neutralise un réessai navigateur avec la même clé d'idempotence", async () => {
    const first = await requestWaitlistSignup({ ...base, idempotencyKey: "abcdefgh12345678" }, { store, now });
    const second = await requestWaitlistSignup({ ...base, idempotencyKey: "abcdefgh12345678" }, { store, now });
    expect(first.taskCreated).toBe(true);
    expect(second.taskCreated).toBe(false);
    expect(store.snapshot().tasks).toHaveLength(1);
  });

  it("n'envoie rien de plus à une adresse déjà confirmée", async () => {
    await requestWaitlistSignup(base, { store, now });
    await processEmailTasks(10, { store, now });
    await confirmWaitlistSignup(extractToken(sender.sent[0]), { store, now });
    const outcome = await requestWaitlistSignup(base, { store, now });
    expect(outcome).toEqual({ kind: "accepted", taskCreated: false });
    expect(store.snapshot().tasks).toHaveLength(1);
  });

  it("propage une panne de base sans faux succès et libère la clé d'idempotence (F09)", async () => {
    store.failNext = new Error("connexion perdue");
    await expect(requestWaitlistSignup({ ...base, idempotencyKey: "cle-de-reessai-0001" }, { store, now })).rejects.toThrow("connexion perdue");
    // Le réessai avec la même clé doit aboutir.
    const retry = await requestWaitlistSignup({ ...base, idempotencyKey: "cle-de-reessai-0001" }, { store, now });
    expect(retry.taskCreated).toBe(true);
  });
});

describe("confirmation (F11)", () => {
  async function signupAndGetToken(): Promise<string> {
    await requestWaitlistSignup(base, { store, now });
    await processEmailTasks(10, { store, now });
    return extractToken(sender.sent[sender.sent.length - 1]);
  }

  it("la lecture ne confirme pas ; le POST confirme une seule fois", async () => {
    const raw = await signupAndGetToken();
    expect(await peekConfirmToken(raw, { store, now })).toBe("valid");
    expect(store.snapshot().entries[0].status).toBe("pending");

    expect(await confirmWaitlistSignup(raw, { store, now })).toBe("confirmed");
    const entry = store.snapshot().entries[0];
    expect(entry.status).toBe("confirmed");
    expect(entry.confirmedAt).toEqual(clock);

    expect(await confirmWaitlistSignup(raw, { store, now })).toBe("already_confirmed");
    expect(store.snapshot().tokens.filter((t) => t.purpose === "unsubscribe")).toHaveLength(1);
  });

  it("refuse un jeton expiré ou inconnu", async () => {
    const raw = await signupAndGetToken();
    clock = new Date(clock.getTime() + CONFIRM_TOKEN_TTL_MS + 1000);
    expect(await confirmWaitlistSignup(raw, { store, now })).toBe("expired");
    expect(await confirmWaitlistSignup("x".repeat(43), { store, now })).toBe("invalid");
    expect(await confirmWaitlistSignup("court", { store, now })).toBe("invalid");
  });
});

describe("désinscription (F12)", () => {
  it("retire l'inscription sans compte et arrête les notifications", async () => {
    await requestWaitlistSignup(base, { store, now });
    await processEmailTasks(10, { store, now });
    await confirmWaitlistSignup(extractToken(sender.sent[0]), { store, now });

    const unsubscribeHash = store.snapshot().tokens.find((t) => t.purpose === "unsubscribe")!.tokenHash;
    // Le jeton brut n'est pas stocké : on simule en insérant un jeton connu.
    const raw = "A".repeat(43);
    await store.saveToken({ tokenHash: hashToken(raw), entryId: store.snapshot().entries[0].id, purpose: "unsubscribe", createdAt: clock, expiresAt: null, usedAt: null });
    expect(unsubscribeHash).not.toBe(hashToken(raw));

    expect(await unsubscribeFromWaitlist(raw, { store, now })).toBe("unsubscribed");
    expect(store.snapshot().entries[0].status).toBe("unsubscribed");

    // Une nouvelle demande réactive la fiche avec un nouvel email de confirmation.
    const outcome = await requestWaitlistSignup(base, { store, now });
    expect(outcome.taskCreated).toBe(true);
    expect(store.snapshot().entries[0].status).toBe("pending");
  });

  it("un jeton de confirmation ne permet pas la désinscription", async () => {
    await requestWaitlistSignup(base, { store, now });
    await processEmailTasks(10, { store, now });
    const raw = extractToken(sender.sent[0]);
    expect(await unsubscribeFromWaitlist(raw, { store, now })).toBe("invalid");
  });
});

describe("panne email (F10)", () => {
  class FlakySender implements EmailSender {
    readonly name = "flaky";
    failures = 0;
    constructor(private readonly failTimes: number, private readonly retryable = true) {}
    async send(): Promise<void> {
      if (this.failures < this.failTimes) {
        this.failures += 1;
        throw new EmailProviderError("indisponible", this.retryable);
      }
    }
  }

  it("conserve la tâche et la rejoue avec backoff", async () => {
    const flaky = new FlakySender(1);
    setEmailSenderForTests(flaky);
    await requestWaitlistSignup(base, { store, now });

    const first = await processEmailTasks(10, { store, now });
    expect(first).toEqual({ claimed: 1, sent: 0, failed: 1 });
    let task = store.snapshot().tasks[0];
    expect(task.status).toBe("pending");
    expect(task.attempts).toBe(1);
    expect(task.nextAttemptAt.getTime()).toBe(clock.getTime() + 60_000);

    // Pas encore due.
    expect(await processEmailTasks(10, { store, now })).toEqual({ claimed: 0, sent: 0, failed: 0 });

    clock = new Date(clock.getTime() + 61_000);
    const second = await processEmailTasks(10, { store, now });
    expect(second).toEqual({ claimed: 1, sent: 1, failed: 0 });
    task = store.snapshot().tasks[0];
    expect(task.status).toBe("sent");
  });

  it("abandonne après le nombre maximal de tentatives", async () => {
    setEmailSenderForTests(new FlakySender(99));
    await requestWaitlistSignup(base, { store, now });
    for (let i = 0; i < 5; i += 1) {
      await processEmailTasks(10, { store, now });
      clock = new Date(clock.getTime() + 3 * 60 * 60_000);
    }
    const task = store.snapshot().tasks[0];
    expect(task.status).toBe("failed");
    expect(task.attempts).toBe(5);
  });

  it("n'insiste pas sur une erreur non réessayable", async () => {
    setEmailSenderForTests(new FlakySender(99, false));
    await requestWaitlistSignup(base, { store, now });
    await processEmailTasks(10, { store, now });
    expect(store.snapshot().tasks[0].status).toBe("failed");
  });
});

describe("purge", () => {
  it("supprime les demandes non confirmées après 7 jours et les jetons expirés", async () => {
    await requestWaitlistSignup(base, { store, now });
    await processEmailTasks(10, { store, now });
    clock = new Date(clock.getTime() + 8 * 24 * 60 * 60_000);
    const removed = await purgeWaitlist({ store, now });
    expect(removed).toBeGreaterThanOrEqual(1);
    expect(store.snapshot().entries).toHaveLength(0);
    expect(store.snapshot().tokens).toHaveLength(0);
  });
});
