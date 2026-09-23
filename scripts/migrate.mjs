// Applique les migrations SQL de db/migrations dans l'ordre, une seule fois chacune.
// Usage : DATABASE_URL=postgres://... node scripts/migrate.mjs
// Avec --if-configured (build Vercel), l'absence de DATABASE_URL n'est pas une erreur.
import postgres from "postgres";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// DATABASE_URL, ou POSTGRES_URL injectée par l'intégration Supabase de Vercel.
const url = process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
if (!url) {
  if (process.argv.includes("--if-configured")) {
    console.warn("DATABASE_URL / POSTGRES_URL absent : migrations ignorées (l'application nécessitera une base).");
    process.exit(0);
  }
  console.error("DATABASE_URL ou POSTGRES_URL manquant.");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
const dir = path.join(process.cwd(), "db", "migrations");

try {
  await sql`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const applied = new Set((await sql`select name from schema_migrations`).map((r) => r.name));
  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const body = await readFile(path.join(dir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into schema_migrations (name) values (${file})`;
    });
    console.log(`appliquée : ${file}`);
    count += 1;
  }
  console.log(count === 0 ? "Base à jour." : `${count} migration(s) appliquée(s).`);
} finally {
  await sql.end();
}
