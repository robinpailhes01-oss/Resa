/**
 * Chaîne de connexion PostgreSQL.
 *
 * `DATABASE_URL` en priorité ; sinon `POSTGRES_URL`, injectée automatiquement par
 * l'intégration Supabase du marketplace Vercel (pooler en mode transaction).
 * Fonction sans dépendance, partagée avec le script de migration.
 */
export function readDatabaseUrl(env: Record<string, string | undefined> = process.env): string | null {
  const url = env.DATABASE_URL?.trim() || env.POSTGRES_URL?.trim();
  return url ? url : null;
}
