import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "crm_session";
const MAX_AGE_S = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.CRM_SECRET;
  if (!value || value.length < 32) throw new Error("CRM_SECRET manquant ou trop court");
  return value;
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Le mot de passe saisi correspond-il au mot de passe d'équipe ? */
export function checkPassword(input) {
  const expected = process.env.CRM_PASSWORD;
  if (!expected) return false;
  // Comparaison sur des empreintes de même longueur, en temps constant.
  return safeEqual(sign(String(input ?? "")), sign(expected));
}

export function sessionCookie() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  const value = `${exp}.${sign(String(exp))}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_S}`;
}

export function clearedCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function isAuthenticated(req) {
  const raw = String(req.headers.cookie ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`));
  if (!raw) return false;
  const [exp, mac] = raw.slice(COOKIE.length + 1).split(".");
  if (!exp || !mac || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(mac, sign(exp));
}

/** Refuse la requête (401) si l'équipe n'est pas connectée. */
export function requireAuth(req, res) {
  if (isAuthenticated(req)) return true;
  res.status(401).json({ error: "Connexion requise" });
  return false;
}
