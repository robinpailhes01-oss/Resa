/**
 * Alertes internes (§10, §13) : journal serveur + webhook facultatif
 * (ALERT_WEBHOOK_URL). Aucune donnée personnelle dans les messages.
 */
export async function alertOps(message: string, meta: Record<string, string | number> = {}): Promise<void> {
  console.error(`[alerte] ${message}`, meta);
  const url = process.env.ALERT_WEBHOOK_URL?.trim();
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `[Reso] ${message}`, meta }),
    });
  } catch {
    // Une alerte qui échoue ne doit pas interrompre le traitement.
  }
}
