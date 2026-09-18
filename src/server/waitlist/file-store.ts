import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { MemoryWaitlistStore, type MemorySnapshot } from "./memory-store";

const DATE_KEYS = new Set(["createdAt", "confirmedAt", "unsubscribedAt", "nextAttemptAt", "sentAt", "expiresAt", "usedAt"]);

function reviver(key: string, value: unknown): unknown {
  if (DATE_KEYS.has(key) && typeof value === "string") return new Date(value);
  return value;
}

/**
 * Persistance locale de développement : le store mémoire est sérialisé en
 * JSON dans un fichier (par défaut .data/waitlist.json, ignoré par Git).
 * Ne convient pas à la production (pas de verrou multi-processus).
 */
export class FileWaitlistStore extends MemoryWaitlistStore {
  private loaded = false;
  private writing: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {
    super();
  }

  async init(): Promise<void> {
    if (this.loaded) return;
    try {
      const raw = await readFile(this.filePath, "utf8");
      this.load(JSON.parse(raw, reviver) as MemorySnapshot);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    this.loaded = true;
  }

  protected override async persist(): Promise<void> {
    const snapshot = JSON.stringify(this.snapshot(), null, 2);
    this.writing = this.writing.then(async () => {
      await mkdir(dirname(this.filePath), { recursive: true });
      const tmp = `${this.filePath}.tmp`;
      await writeFile(tmp, snapshot, "utf8");
      await rename(tmp, this.filePath);
    });
    await this.writing;
  }
}
