import "server-only";

/**
 * Notifications Telegram de l'équipe Reso (inscriptions, retours, récap).
 * Configuration : TELEGRAM_BOT_TOKEN (BotFather) et TELEGRAM_CHAT_ID (votre
 * conversation avec le bot). Sans ces variables, rien n'est envoyé.
 */
export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim());
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
}

/** Envoie un message (HTML Telegram). Ne lève jamais : un échec est journalisé. */
export async function notifyTelegram(html: string, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;
  try {
    const response = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: html.slice(0, 4000), parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error("[telegram] envoi refusé", response.status, (await response.text().catch(() => "")).slice(0, 200));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[telegram] envoi impossible", error instanceof Error ? error.message : error);
    return false;
  }
}

/** Événements métier notifiés en temps réel. */
export const telegramEvents = {
  signup: (user: { fullName: string; email: string }) =>
    `🆕 <b>Nouvelle inscription</b>\n${escapeHtml(user.fullName)} · ${escapeHtml(user.email)}`,
  establishment: (e: { name: string; businessType: string; city: string | null; slug: string }, siteUrl: string) =>
    `🏪 <b>Nouvel établissement</b>\n${escapeHtml(e.name)} · ${escapeHtml(e.businessType)}${e.city ? ` · ${escapeHtml(e.city)}` : ""}\n${siteUrl}/r/${e.slug}`,
  feedback: (f: { moodLabel: string; message: string; fullName: string; email: string; establishment: string | null; page: string | null }) =>
    `💬 <b>Nouveau retour</b> · ${escapeHtml(f.moodLabel)}\n« ${escapeHtml(f.message.slice(0, 600))} »\n— ${escapeHtml(f.fullName)} · ${escapeHtml(f.email)}${f.establishment ? ` · ${escapeHtml(f.establishment)}` : ""}${f.page ? `\nPage : ${escapeHtml(f.page)}` : ""}`,
  payment: (p: { establishment: string; amountLabel: string }) =>
    `💳 <b>Nouveau paiement</b>\n${escapeHtml(p.establishment)} · ${escapeHtml(p.amountLabel)}`,
};
