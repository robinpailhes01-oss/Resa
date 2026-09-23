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

// Aide au diagnostic : sur Supabase, seule l'URL du pooler (aws-…pooler.supabase.com,
// port 6543 ou 5432) est joignable depuis Vercel ; « db.<ref>.supabase.co » n'a pas
// d'adresse IPv4 et « <ref>.supabase.co » n'héberge pas PostgreSQL.
function supabaseHint(connectionString, message = "") {
  try {
    const host = new URL(connectionString).hostname;
    if (host.endsWith(".pooler.supabase.com") && /tenant|user .* not found/i.test(message)) {
      return [
        `Le pooler « ${host} » ne connaît pas ce projet : la région dans l'hôte ne correspond pas.`,
        "Copiez la chaîne exacte affichée par Supabase (bouton Connect → Transaction pooler), sans la retaper :",
        "la partie « aws-X-<region>.pooler.supabase.com » doit être celle de votre projet.",
      ].join("\n");
    }
    if (host.endsWith(".supabase.co")) {
      const ref = host.replace(/^db\./, "").split(".")[0];
      return [
        `L'hôte « ${host} » n'est pas joignable depuis Vercel.`,
        "Utilisez la chaîne « Transaction pooler » du bouton Connect de Supabase, de la forme :",
        `postgresql://postgres.${ref}:[MOT_DE_PASSE]@aws-0-<region>.pooler.supabase.com:6543/postgres`,
      ].join("\n");
    }
  } catch {
    /* URL illisible : pas d'indice supplémentaire */
  }
  return null;
}

// Vérification de la forme de l'URL avant toute connexion : le mot de passe
// n'est jamais affiché, seulement la structure (protocole, utilisateur, hôte, port, base).
function describeUrl(raw) {
  const start = raw.slice(0, 14).replace(/[^\x20-\x7e]/g, "?");
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, message: `La valeur ne ressemble pas à une URL (elle commence par « ${start}… », ${raw.length} caractères).` };
  }
  const problems = [];
  if (!/^postgres(ql)?:$/.test(parsed.protocol)) problems.push(`le préfixe est « ${parsed.protocol}// » au lieu de « postgresql:// »`);
  if (!parsed.hostname) problems.push("l'hôte est vide");
  if (!parsed.username) problems.push("l'utilisateur est vide");
  if (/^[a-z]+:\/\/[^@]*[\[\]][^@]*@/i.test(raw)) problems.push("le mot de passe contient encore des crochets « [ ] »");
  if (/\s/.test(raw)) problems.push("la valeur contient un espace ou un retour à la ligne");
  const shape = `${parsed.protocol}//${parsed.username || "?"}:${parsed.password ? "•••" : "(vide)"}@${parsed.hostname || "?"}:${parsed.port || "(défaut)"}${parsed.pathname || ""}`;
  return { ok: problems.length === 0, message: `Forme lue : ${shape}${problems.length ? `\nProblèmes : ${problems.join(" ; ")}.` : ""}` };
}

const shape = describeUrl(url);
if (!shape.ok) {
  console.error("DATABASE_URL / POSTGRES_URL invalide.");
  console.error(shape.message);
  console.error(
    [
      "Attendu : postgresql://postgres.<ref>:<mot de passe>@<hôte>.pooler.supabase.com:6543/postgres",
      "Vérifiez : pas de guillemets, pas de « DATABASE_URL= » devant, pas d'espace, mot de passe sans crochets.",
      "Si le mot de passe contient @ # % / ? ou &, encodez-le (@ → %40, # → %23, % → %25, / → %2F, ? → %3F, & → %26).",
    ].join("\n"),
  );
  process.exit(1);
}
console.log(`Base : ${shape.message}`);

const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 15, onnotice: () => {} });
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
} catch (error) {
  console.error(`Migration impossible : ${error?.message ?? error}`);
  const hint = supabaseHint(url, String(error?.message ?? ""));
  if (hint) console.error(hint);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
