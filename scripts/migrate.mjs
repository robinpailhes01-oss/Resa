// Applique les migrations SQL de db/migrations dans l'ordre, une seule fois chacune.
// Usage : DATABASE_URL=postgres://... node scripts/migrate.mjs
import postgres from "postgres";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL manquant.");
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
