/**
 * Accès aux pages internes (suivi de la prospection) : réservé aux comptes Reso
 * dont l'adresse figure ici. RESO_ADMIN_EMAILS (séparées par des virgules) remplace la liste.
 */
export const defaultAdminEmails = ["robin.pailhes01@gmail.com"];

export function adminEmails(env: Record<string, string | undefined> = process.env): string[] {
  const raw = env.RESO_ADMIN_EMAILS?.trim();
  const list = raw ? raw.split(/[\s,;]+/) : defaultAdminEmails;
  return list.map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@"));
}
