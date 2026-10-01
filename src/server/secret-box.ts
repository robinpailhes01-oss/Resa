import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * Chiffrement symétrique des jetons Mollie Connect (AES-256-GCM).
 * Clé : MOLLIE_TOKEN_ENCRYPTION_KEY (au moins 32 caractères aléatoires),
 * dérivée en 256 bits par SHA-256. Format stocké : v1.<iv>.<tag>.<chiffré>.
 */
const PREFIX = "v1";

export function hasEncryptionKey(env: Record<string, string | undefined> = process.env): boolean {
  return (env.MOLLIE_TOKEN_ENCRYPTION_KEY?.trim().length ?? 0) >= 32;
}

function key(env: Record<string, string | undefined> = process.env): Buffer {
  const raw = env.MOLLIE_TOKEN_ENCRYPTION_KEY?.trim() ?? "";
  if (raw.length < 32) throw new Error("MOLLIE_TOKEN_ENCRYPTION_KEY manquante ou trop courte (32 caractères minimum).");
  return createHash("sha256").update(raw).digest();
}

export function seal(plain: string, env?: Record<string, string | undefined>): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(env), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [PREFIX, iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export function open(sealed: string, env?: Record<string, string | undefined>): string {
  const [prefix, iv, tag, data] = sealed.split(".");
  if (prefix !== PREFIX || !iv || !tag || data === undefined) throw new Error("Jeton chiffré illisible.");
  const decipher = createDecipheriv("aes-256-gcm", key(env), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
