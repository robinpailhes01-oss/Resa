import { readDatabaseUrl } from "@/server/database-url";
import path from "node:path";
import { FileWaitlistStore } from "./file-store";
import { MemoryWaitlistStore } from "./memory-store";
import { PostgresWaitlistStore } from "./postgres-store";
import { StoreUnavailableError, type WaitlistStore } from "./types";

type Holder = { store?: WaitlistStore; init?: Promise<WaitlistStore> };
const holder = globalThis as unknown as { __resoWaitlistStore?: Holder };

/**
 * Sélection du store :
 * - DATABASE_URL (ou POSTGRES_URL, intégration Supabase de Vercel) défini → PostgreSQL ;
 * - sinon, hors production ou si WAITLIST_FILE est défini → fichier JSON local ;
 * - sinon → StoreUnavailableError (le formulaire répond 503, jamais un faux succès).
 */
export async function getWaitlistStore(): Promise<WaitlistStore> {
  const h = (holder.__resoWaitlistStore ??= {});
  if (h.store) return h.store;
  if (!h.init) {
    h.init = (async () => {
      const url = readDatabaseUrl();
      if (url) {
        h.store = PostgresWaitlistStore.fromUrl(url);
        return h.store;
      }
      if (process.env.NODE_ENV === "test") {
        h.store = new MemoryWaitlistStore();
        return h.store;
      }
      // Fichier local : par défaut hors production, ou explicitement via WAITLIST_FILE (recette locale).
      const explicitFile = process.env.WAITLIST_FILE?.trim();
      if (explicitFile || process.env.NODE_ENV !== "production") {
        const file = new FileWaitlistStore(explicitFile || path.join(process.cwd(), ".data", "waitlist.json"));
        await file.init();
        h.store = file;
        return h.store;
      }
      throw new StoreUnavailableError("DATABASE_URL ou POSTGRES_URL manquant en production");
    })();
  }
  return h.init;
}

/** Réservé aux tests : remplace le store partagé. */
export function setWaitlistStoreForTests(store: WaitlistStore | null): void {
  holder.__resoWaitlistStore = store ? { store } : {};
}
