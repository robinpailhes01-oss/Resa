import "server-only";
import { notFound, redirect } from "next/navigation";
import { adminEmails } from "@/config/admin";
import { getCurrentUser, type SessionUser } from "@/server/auth/session";

/** Le compte connecté est-il administrateur de Reso ? */
export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && adminEmails().includes(email.trim().toLowerCase()));
}

/**
 * Pages internes : il faut être connecté avec un compte administrateur.
 * Non connecté → page de connexion ; connecté sans droit → 404 (la page n'existe pas pour lui).
 */
export async function requireAdmin(next: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?next=${encodeURIComponent(next)}`);
  if (!isAdminEmail(user.email) || !user.emailVerifiedAt) notFound();
  return user;
}
