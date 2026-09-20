import postgres, { type Sql, type TransactionSql } from "postgres";

/** Connexion ou transaction : les modules acceptent les deux. */
export type Db = Sql | TransactionSql;

const holder = globalThis as unknown as { __resoSql?: Sql };

export class DatabaseUnavailableError extends Error {
  constructor(message = "Base de données non configurée (DATABASE_URL manquant)") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

/**
 * Connexion PostgreSQL partagée (postgres.js). Requêtes paramétrées uniquement.
 * `prepare: false` reste compatible avec les poolers en mode transaction.
 */
export function getSql(): Sql {
  if (holder.__resoSql) return holder.__resoSql;
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new DatabaseUnavailableError();
  holder.__resoSql = postgres(url, {
    max: 8,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    transform: { undefined: null },
  });
  return holder.__resoSql;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
