import { checkPassword, clearedCookie, isAuthenticated, sessionCookie } from "./_lib/auth.js";

/**
 * GET    : l'équipe est-elle connectée ?
 * POST   : connexion avec le mot de passe d'équipe { password }.
 * DELETE : déconnexion.
 */
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.status(200).json({ authenticated: isAuthenticated(req) });
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearedCookie());
    return res.status(200).json({ ok: true });
  }
  if (req.method === "POST") {
    if (checkPassword(req.body?.password)) {
      res.setHeader("Set-Cookie", sessionCookie());
      return res.status(200).json({ ok: true });
    }
    // Ralentit les essais en série.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }
  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Méthode non autorisée." });
}
