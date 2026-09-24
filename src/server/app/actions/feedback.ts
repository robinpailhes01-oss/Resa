"use server";

import { z } from "zod";
import { offer } from "@/config/offer";
import { getEmailSender } from "@/server/email";
import { getUserEstablishment, requireUser } from "@/server/auth/guards";
import { getSql } from "@/server/db";
import { SlidingWindowRateLimiter } from "@/server/rate-limit";
import { after } from "next/server";
import { notifyTelegram, telegramEvents } from "@/server/telegram";

const schema = z.object({
  mood: z.enum(["happy", "neutral", "sad"]),
  message: z.string().trim().min(3, "Écrivez au moins quelques mots.").max(2000),
  page: z.string().trim().max(200).optional(),
});

export type FeedbackResult = { ok: true } | { ok: false; error: string };

// 10 retours par utilisateur et par heure.
const limiter = new SlidingWindowRateLimiter(10, 60 * 60_000);

/** Enregistre un retour produit et le transmet à l'adresse de support si elle est configurée. */
export async function sendFeedbackAction(input: { mood: string; message: string; page?: string }): Promise<FeedbackResult> {
  const user = await requireUser();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Message invalide." };
  if (!limiter.hit(`feedback:${user.id}`)) return { ok: false, error: "Trop de retours d’un coup. Réessayez plus tard." };
  const establishment = await getUserEstablishment(user.id);
  try {
    await getSql()`
      insert into feedback (user_id, establishment_id, mood, message, page)
      values (${user.id}, ${establishment?.id ?? null}, ${parsed.data.mood}, ${parsed.data.message}, ${parsed.data.page ?? null})`;
  } catch (error) {
    console.error("[feedback] enregistrement", error instanceof Error ? error.message : error);
    return { ok: false, error: "Impossible d’envoyer votre retour pour le moment." };
  }
  const moodLabel = { happy: "Ça me plaît", neutral: "Une idée", sad: "Un problème" }[parsed.data.mood];
  after(() =>
    notifyTelegram(
      telegramEvents.feedback({ moodLabel, message: parsed.data.message, fullName: user.fullName, email: user.email, establishment: establishment?.name ?? null, page: parsed.data.page ?? null }),
    ),
  );
  if (offer.supportEmail) {
    const subject = `[${offer.brandName}] Nouveau retour · ${moodLabel} · ${user.fullName}${establishment ? ` (${establishment.name})` : ""}`;
    const body = [
      parsed.data.message,
      "",
      "— Qui : " + `${user.fullName} <${user.email}>`,
      establishment ? `— Établissement : ${establishment.name} (${offer.siteUrl.replace(/\/$/, "")}/r/${establishment.slug})` : null,
      parsed.data.page ? `— Page : ${parsed.data.page}` : null,
      `— Type : ${moodLabel}`,
      "",
      "Répondez directement à cet email pour recontacter la personne.",
    ]
      .filter((line): line is string => line !== null)
      .join("\n");
    await getEmailSender()
      .send({ to: offer.supportEmail, subject, text: body, html: `<pre style="font:14px/1.5 sans-serif;white-space:pre-wrap">${body.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] ?? c)}</pre>`, replyTo: user.email })
      .catch((error) => console.error("[feedback] email support non envoyé", error instanceof Error ? error.message : error));
  }
  return { ok: true };
}
