import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Accès à la page de suivi : le secret interne (INTERNAL_TASKS_SECRET) passé dans l'URL. */
export function isProspectionAdminToken(token: string | null | undefined): boolean {
  const secret = process.env.INTERNAL_TASKS_SECRET?.trim();
  if (!secret || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
