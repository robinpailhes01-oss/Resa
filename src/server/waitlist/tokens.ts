import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** Jeton aléatoire de forte entropie (32 octets), encodé base64url. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Empreinte SHA-256 hexadécimale : seule valeur stockée en base. */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Forme attendue d'un jeton brut (évite de hacher n'importe quelle chaîne). */
export function looksLikeToken(raw: string): boolean {
  return /^[A-Za-z0-9_-]{40,48}$/.test(raw);
}

export function safeEqualHash(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
