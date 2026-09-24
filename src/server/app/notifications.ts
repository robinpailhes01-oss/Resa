import "server-only";
import { googleWriteReviewUrl } from "@/lib/google-places";
import { offer } from "@/config/offer";
import {
  formatDateTimeFr,
  formatDuration,
  formatPriceCents,
  todayDateKey,
} from "@/lib/time";
import { alertOps } from "@/server/alerts";
import { getSql, type Db } from "@/server/db";
import { absoluteUrl, getEmailSender } from "@/server/email";
import type { EmailMessage } from "@/server/email/types";

export interface NotificationSettings {
  confirmationEnabled: boolean;
  reminderEnabled: boolean;
  reminderHours: number;
  reviewEnabled: boolean;
  reviewDelayHours: number;
  reviewSubject: string;
  reviewUrl: string | null;
  notifyProOnBooking: boolean;
}

type SettingsRow = {
  confirmation_enabled: boolean;
  reminder_enabled: boolean;
  reminder_hours: number;
  review_enabled: boolean;
  review_delay_hours: number;
  review_subject: string;
  review_url: string | null;
  notify_pro_on_booking: boolean;
};

const mapSettings = (r: SettingsRow): NotificationSettings => ({
  confirmationEnabled: r.confirmation_enabled,
  reminderEnabled: r.reminder_enabled,
  reminderHours: r.reminder_hours,
  reviewEnabled: r.review_enabled,
  reviewDelayHours: r.review_delay_hours,
  reviewSubject: r.review_subject,
  reviewUrl: r.review_url,
  notifyProOnBooking: r.notify_pro_on_booking,
});

export async function getNotificationSettings(
  establishmentId: string,
  tx: Db = getSql(),
): Promise<NotificationSettings> {
  const rows = await tx<
    SettingsRow[]
  >`select * from notification_settings where establishment_id = ${establishmentId}`;
  if (rows[0]) return mapSettings(rows[0]);
  const [created] = await tx<
    SettingsRow[]
  >`insert into notification_settings (establishment_id) values (${establishmentId}) on conflict (establishment_id) do update set updated_at = now() returning *`;
  return mapSettings(created);
}

export async function updateNotificationSettings(
  establishmentId: string,
  input: NotificationSettings,
): Promise<void> {
  await getSql()`
    insert into notification_settings (establishment_id, confirmation_enabled, reminder_enabled, reminder_hours, review_enabled, review_delay_hours, review_subject, review_url, notify_pro_on_booking)
    values (${establishmentId}, ${input.confirmationEnabled}, ${input.reminderEnabled}, ${input.reminderHours}, ${input.reviewEnabled}, ${input.reviewDelayHours}, ${input.reviewSubject}, ${input.reviewUrl}, ${input.notifyProOnBooking})
    on conflict (establishment_id) do update set
      confirmation_enabled = excluded.confirmation_enabled, reminder_enabled = excluded.reminder_enabled, reminder_hours = excluded.reminder_hours,
      review_enabled = excluded.review_enabled, review_delay_hours = excluded.review_delay_hours, review_subject = excluded.review_subject,
      review_url = excluded.review_url, notify_pro_on_booking = excluded.notify_pro_on_booking`;
}

export type EmailJobKind =
  | "booking_confirmation"
  | "booking_cancelled"
  | "pro_new_booking"
  | "pro_booking_cancelled"
  | "booking_reminder"
  | "review_request";

/**
 * Planifie les emails d'un rendez-vous selon les réglages de l'établissement.
 * Appelé dans la transaction de création du rendez-vous.
 */
export async function scheduleBookingEmails(
  tx: Db,
  params: {
    establishmentId: string;
    bookingId: string;
    startsAt: Date;
    endsAt: Date;
    source: "online" | "manual";
    hasClientEmail: boolean;
    manageToken?: string | null;
  },
): Promise<void> {
  const s = await getNotificationSettings(params.establishmentId, tx);
  const jobs: Array<{ kind: EmailJobKind; at: Date }> = [];
  const now = new Date();
  if (params.hasClientEmail && s.confirmationEnabled)
    jobs.push({ kind: "booking_confirmation", at: now });
  if (params.source === "online" && s.notifyProOnBooking)
    jobs.push({ kind: "pro_new_booking", at: now });
  if (params.hasClientEmail && s.reminderEnabled) {
    const at = new Date(params.startsAt.getTime() - s.reminderHours * 3600_000);
    if (at.getTime() > now.getTime() + 5 * 60_000)
      jobs.push({ kind: "booking_reminder", at });
  }
  if (params.hasClientEmail && s.reviewEnabled) {
    jobs.push({
      kind: "review_request",
      at: new Date(params.endsAt.getTime() + s.reviewDelayHours * 3600_000),
    });
  }
  for (const job of jobs) {
    const carriesToken =
      job.kind === "booking_confirmation" || job.kind === "booking_reminder";
    await tx`insert into email_jobs (establishment_id, booking_id, kind, scheduled_at, manage_token)
      values (${params.establishmentId}, ${params.bookingId}, ${job.kind}, ${job.at}, ${carriesToken ? (params.manageToken ?? null) : null})`;
  }
}

/** À l'annulation : annule les envois futurs et planifie l'email d'annulation. */
export async function onBookingCancelled(
  tx: Db,
  params: {
    establishmentId: string;
    bookingId: string;
    hasClientEmail: boolean;
    cancelledBy: "client" | "pro";
  },
): Promise<void> {
  await tx`update email_jobs set status = 'skipped' where booking_id = ${params.bookingId} and status = 'pending' and kind in ('booking_reminder','review_request','booking_confirmation')`;
  if (params.hasClientEmail && params.cancelledBy === "pro") {
    await tx`insert into email_jobs (establishment_id, booking_id, kind) values (${params.establishmentId}, ${params.bookingId}, 'booking_cancelled')`;
  }
  if (params.cancelledBy === "client") {
    const s = await getNotificationSettings(params.establishmentId, tx);
    if (s.notifyProOnBooking) {
      await tx`insert into email_jobs (establishment_id, booking_id, kind) values (${params.establishmentId}, ${params.bookingId}, 'pro_booking_cancelled')`;
    }
  }
}

// ------------------------------------------------------------------ gabarits

type JobContext = {
  kind: EmailJobKind;
  establishment: {
    name: string;
    slug: string;
    phone: string | null;
    publicEmail: string | null;
    addressLine: string | null;
    postalCode: string | null;
    city: string | null;
    timezone: string;
    bookingTerms: string | null;
    googlePlaceId?: string | null;
  };
  booking: {
    id: string;
    serviceName: string;
    startsAt: Date;
    endsAt: Date;
    durationMin: number;
    priceCents: number;
    status: string;
    manageUrl: string | null;
  };
  practitionerName: string;
  client: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  } | null;
  ownerEmail: string;
  settings: NotificationSettings;
};

function esc(v: string): string {
  return v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shell(title: string, salon: string, rows: string[]): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Manrope,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#27242a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;">
<tr><td style="padding:28px 28px 4px 28px;font-size:20px;font-weight:700;color:#493344;">${esc(salon)}</td></tr>
${rows.join("")}
<tr><td style="padding:20px 28px 28px 28px;font-size:12px;line-height:18px;color:#655b66;border-top:1px solid #eee;">Email envoyé par ${esc(offer.brandName)} pour ${esc(salon)}.</td></tr>
</table></td></tr></table></body></html>`;
}
const p = (t: string) =>
  `<tr><td style="padding:12px 28px 0 28px;font-size:16px;line-height:25px;">${t}</td></tr>`;
const detail = (label: string, value: string) =>
  `<tr><td style="padding:6px 28px 0 28px;font-size:15px;line-height:22px;"><span style="color:#655b66;">${esc(label)} :</span> <strong>${esc(value)}</strong></td></tr>`;
const note = (html: string) =>
  `<tr><td style="padding:16px 28px 0 28px;"><div style="background:#faf7f2;border-radius:12px;padding:12px 16px;font-size:13px;line-height:20px;color:#655b66;">${html}</div></td></tr>`;
const button = (href: string, label: string) =>
  `<tr><td style="padding:22px 28px 8px 28px;"><a href="${esc(href)}" style="display:inline-block;background:#493344;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;line-height:24px;padding:12px 24px;border-radius:12px;">${esc(label)}</a></td></tr>`;

function addressLine(e: JobContext["establishment"]): string | null {
  const parts = [
    e.addressLine,
    [e.postalCode, e.city].filter(Boolean).join(" "),
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function renderJobEmail(ctx: JobContext): EmailMessage | null {
  const {
    kind,
    establishment: e,
    booking: b,
    client,
    practitionerName,
    settings,
  } = ctx;
  const when = formatDateTimeFr(b.startsAt, e.timezone);
  const firstName = client?.firstName ?? "";
  const details = [
    detail("Prestation", b.serviceName),
    detail("Date", when),
    detail("Durée", formatDuration(b.durationMin)),
    detail("Avec", practitionerName),
    ...(b.priceCents > 0
      ? [detail("Prix", formatPriceCents(b.priceCents))]
      : []),
    ...(addressLine(e) ? [detail("Adresse", addressLine(e)!)] : []),
  ];
  const textDetails = [
    `Prestation : ${b.serviceName}`,
    `Date : ${when}`,
    `Durée : ${formatDuration(b.durationMin)}`,
    `Avec : ${practitionerName}`,
    ...(b.priceCents > 0 ? [`Prix : ${formatPriceCents(b.priceCents)}`] : []),
    ...(addressLine(e) ? [`Adresse : ${addressLine(e)}`] : []),
  ].join("\n");
  const replyTo = e.publicEmail ?? undefined;
  const fromName = `${e.name} via ${offer.brandName}`;
  const proTo = e.publicEmail ?? ctx.ownerEmail;
  const clientName = client
    ? `${client.firstName} ${client.lastName}`.trim()
    : "";
  const termsText = e.bookingTerms ? `\nConditions : ${e.bookingTerms}\n` : "";
  const termsHtml = e.bookingTerms
    ? [
        note(
          `<strong>Conditions</strong><br>${esc(e.bookingTerms).replaceAll("\n", "<br>")}`,
        ),
      ]
    : [];

  switch (kind) {
    case "booking_confirmation": {
      if (!client?.email) return null;
      const subject = `Votre rendez-vous chez ${e.name} est confirmé`;
      return {
        to: client.email,
        subject,
        replyTo,
        fromName,
        text: `Bonjour ${firstName},\n\nVotre rendez-vous est confirmé.\n\n${textDetails}\n${b.manageUrl ? `\nModifier ou annuler : ${b.manageUrl}\n` : ""}${termsText}\nÀ très bientôt,\n${e.name}`,
        html: shell(subject, e.name, [
          p(`Bonjour ${esc(firstName)},`),
          p("Votre rendez-vous est confirmé !"),
          ...details,
          ...(b.manageUrl
            ? [button(b.manageUrl, "Voir ou annuler mon rendez-vous")]
            : []),
          ...termsHtml,
          p(`À très bientôt,<br>${esc(e.name)}`),
        ]),
      };
    }
    case "booking_reminder": {
      if (!client?.email || b.status !== "confirmed") return null;
      const subject = `Rappel : votre rendez-vous chez ${e.name}`;
      return {
        to: client.email,
        subject,
        replyTo,
        fromName,
        text: `Bonjour ${firstName},\n\nPetit rappel de votre rendez-vous.\n\n${textDetails}\n${b.manageUrl ? `\nBesoin de modifier ? ${b.manageUrl}\n` : ""}\nÀ très bientôt,\n${e.name}`,
        html: shell(subject, e.name, [
          p(`Bonjour ${esc(firstName)},`),
          p("Petit rappel de votre rendez-vous."),
          ...details,
          ...(b.manageUrl ? [button(b.manageUrl, "Voir mon rendez-vous")] : []),
          p(`À très bientôt,<br>${esc(e.name)}`),
        ]),
      };
    }
    case "review_request": {
      if (!client?.email || b.status === "cancelled" || b.status === "no_show")
        return null;
      const subject =
        settings.reviewSubject || "Comment s’est passé votre rendez-vous ?";
      // Lien d'avis : celui choisi par le pro, sinon la fiche Google reliée.
      const link = settings.reviewUrl ?? (e.googlePlaceId ? googleWriteReviewUrl(e.googlePlaceId) : null);
      return {
        to: client.email,
        subject,
        replyTo,
        fromName,
        text: `Bonjour ${firstName},\n\nMerci pour votre visite chez ${e.name}. ${link ? `Votre avis nous aide à améliorer votre expérience : ${link}` : "Nous espérons vous revoir bientôt."}\n\nÀ bientôt,\n${e.name}`,
        html: shell(subject, e.name, [
          p(`Merci pour votre visite, ${esc(firstName)}`),
          p(
            `Nous espérons que vous avez apprécié votre moment chez ${esc(e.name)}.${link ? " Votre avis nous aide à améliorer votre expérience." : ""}`,
          ),
          ...(link ? [button(link, "Partager mon avis")] : []),
          p(`À bientôt,<br>l’équipe ${esc(e.name)}`),
        ]),
      };
    }
    case "booking_cancelled": {
      if (!client?.email) return null;
      const subject = `Votre rendez-vous chez ${e.name} a été annulé`;
      const rebook = absoluteUrl(`/r/${e.slug}`);
      return {
        to: client.email,
        subject,
        replyTo,
        fromName,
        text: `Bonjour ${firstName},\n\nVotre rendez-vous a été annulé.\n\n${textDetails}\n\nReprendre rendez-vous : ${rebook}\n\n${e.name}`,
        html: shell(subject, e.name, [
          p(`Bonjour ${esc(firstName)},`),
          p("Votre rendez-vous a été annulé. Nous en sommes désolés."),
          ...details,
          button(rebook, "Reprendre rendez-vous"),
          p(esc(e.name)),
        ]),
      };
    }
    case "pro_new_booking": {
      const subject = `Nouveau rendez-vous : ${clientName || "client"} · ${b.serviceName}`;
      const url = absoluteUrl(`/app/rendez-vous/${b.id}`);
      return {
        to: proTo,
        subject,
        fromName: offer.brandName,
        text: `Un nouveau rendez-vous a été pris en ligne.\n\nClient : ${client ? `${client.firstName} ${client.lastName}`.trim() : "—"}${client?.email ? ` (${client.email})` : ""}\n${textDetails}\n\nVoir dans l’agenda : ${url}`,
        html: shell(subject, e.name, [
          p("Un nouveau rendez-vous a été pris en ligne."),
          detail(
            "Client",
            client ? `${client.firstName} ${client.lastName}`.trim() : "—",
          ),
          ...(client?.email ? [detail("Email", client.email)] : []),
          ...details,
          button(url, "Voir dans l’agenda"),
        ]),
      };
    }
    case "pro_booking_cancelled": {
      const subject = `Annulation : ${clientName || "client"} · ${b.serviceName} · ${when}`;
      const url = absoluteUrl(
        `/app/agenda?date=${todayDateKey(e.timezone, b.startsAt)}`,
      );
      return {
        to: proTo,
        subject,
        fromName: offer.brandName,
        text: `${clientName || "Une cliente"} a annulé son rendez-vous en ligne.\n\n${textDetails}\n\nLe créneau est de nouveau disponible : ${url}`,
        html: shell(subject, e.name, [
          p(
            `${esc(clientName || "Une cliente")} a annulé son rendez-vous en ligne.`,
          ),
          ...(client?.email ? [detail("Email", client.email)] : []),
          ...(client?.phone ? [detail("Téléphone", client.phone)] : []),
          ...details,
          p("Le créneau est de nouveau disponible à la réservation."),
          button(url, "Voir l’agenda du jour"),
        ]),
      };
    }
  }
}

// ------------------------------------------------------------------ traitement

const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 3600_000];

type JobRow = {
  id: string;
  kind: EmailJobKind;
  attempts: number;
  establishment_id: string;
  booking_id: string | null;
  e_name: string;
  e_slug: string;
  e_phone: string | null;
  e_public_email: string | null;
  e_address_line: string | null;
  e_postal_code: string | null;
  e_city: string | null;
  e_timezone: string;
  e_booking_terms: string | null;
  e_google_place_id: string | null;
  owner_email: string;
  b_service_name: string | null;
  b_starts_at: Date | null;
  b_ends_at: Date | null;
  b_duration_min: number | null;
  b_price_cents: number | null;
  b_status: string | null;
  b_manage_token_hash: string | null;
  manage_token: string | null;
  p_name: string | null;
  c_first_name: string | null;
  c_last_name: string | null;
  c_email: string | null;
  c_phone: string | null;
};

/** Traite les emails dus : rendu, envoi, réessais avec backoff, alerte après échecs répétés. */
export async function processEmailJobs(
  limit = 25,
  now = new Date(),
): Promise<{ claimed: number; sent: number; failed: number; skipped: number }> {
  const sql = getSql();
  const summary = { claimed: 0, sent: 0, failed: 0, skipped: 0 };
  let sender;
  try {
    sender = getEmailSender();
  } catch (error) {
    console.error("[emails] fournisseur non configuré", error instanceof Error ? error.message : error);
    await alertOps(
      "Fournisseur email non configuré : emails de rendez-vous en attente",
      { error: String(error) },
    );
    return summary;
  }

  const jobs = await sql<JobRow[]>`
    with claimed as (
      update email_jobs set status = 'processing'
      where id in (select id from email_jobs where status = 'pending' and scheduled_at <= ${now} order by scheduled_at limit ${limit} for update skip locked)
      returning *
    )
    select j.id, j.kind, j.attempts, j.establishment_id, j.booking_id, j.manage_token,
      e.name as e_name, e.slug as e_slug, e.phone as e_phone, e.public_email as e_public_email, e.address_line as e_address_line,
      e.postal_code as e_postal_code, e.city as e_city, e.timezone as e_timezone, e.booking_terms as e_booking_terms, e.google_place_id as e_google_place_id,
      u.email as owner_email,
      b.service_name as b_service_name, b.starts_at as b_starts_at, b.ends_at as b_ends_at, b.duration_min as b_duration_min,
      b.price_cents as b_price_cents, b.status as b_status, b.manage_token_hash as b_manage_token_hash,
      pr.name as p_name, c.first_name as c_first_name, c.last_name as c_last_name, c.email as c_email, c.phone as c_phone
    from claimed j
    join establishments e on e.id = j.establishment_id
    join users u on u.id = e.owner_user_id
    left join bookings b on b.id = j.booking_id
    left join practitioners pr on pr.id = b.practitioner_id
    left join clients c on c.id = b.client_id`;
  summary.claimed = jobs.length;

  for (const job of jobs) {
    try {
      if (!job.booking_id || !job.b_starts_at) {
        await sql`update email_jobs set status = 'skipped' where id = ${job.id}`;
        summary.skipped += 1;
        continue;
      }
      const settings = await getNotificationSettings(job.establishment_id);
      const needsManageUrl =
        job.kind === "booking_confirmation" || job.kind === "booking_reminder";
      const manageUrl = !needsManageUrl
        ? null
        : job.manage_token
          ? absoluteUrl(`/rdv/${job.manage_token}`)
          : job.b_manage_token_hash
            ? await manageUrlForBooking(job.booking_id)
            : null;
      const message = renderJobEmail({
        kind: job.kind,
        establishment: {
          name: job.e_name,
          slug: job.e_slug,
          phone: job.e_phone,
          publicEmail: job.e_public_email,
          addressLine: job.e_address_line,
          postalCode: job.e_postal_code,
          city: job.e_city,
          timezone: job.e_timezone,
          bookingTerms: job.e_booking_terms,
          googlePlaceId: job.e_google_place_id,
        },
        booking: {
          id: job.booking_id,
          serviceName: job.b_service_name ?? "",
          startsAt: job.b_starts_at,
          endsAt: job.b_ends_at ?? job.b_starts_at,
          durationMin: job.b_duration_min ?? 0,
          priceCents: job.b_price_cents ?? 0,
          status: job.b_status ?? "confirmed",
          manageUrl,
        },
        practitionerName: job.p_name ?? "",
        client:
          job.c_first_name !== null
            ? {
                firstName: job.c_first_name,
                lastName: job.c_last_name ?? "",
                email: job.c_email,
                phone: job.c_phone,
              }
            : null,
        ownerEmail: job.owner_email,
        settings,
      });
      if (!message) {
        await sql`update email_jobs set status = 'skipped' where id = ${job.id}`;
        summary.skipped += 1;
        continue;
      }
      await sender.send(message);
      await sql`update email_jobs set status = 'sent', sent_at = now(), attempts = attempts + 1, last_error = null, manage_token = null where id = ${job.id}`;
      summary.sent += 1;
    } catch (error) {
      const attempts = job.attempts + 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[emails] envoi ${job.kind} échoué (tentative ${attempts})`, message);
      const next =
        attempts < MAX_ATTEMPTS
          ? new Date(
              now.getTime() +
                BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)],
            )
          : null;
      if (next) {
        await sql`update email_jobs set status = 'pending', attempts = ${attempts}, last_error = ${message.slice(0, 500)}, scheduled_at = ${next} where id = ${job.id}`;
      } else {
        await sql`update email_jobs set status = 'failed', attempts = ${attempts}, last_error = ${message.slice(0, 500)} where id = ${job.id}`;
        await alertOps("Email de rendez-vous abandonné après échecs répétés", {
          jobId: job.id,
          kind: job.kind,
        });
      }
      summary.failed += 1;
    }
  }
  return summary;
}

/**
 * Sans jeton porté par le job (cas rare : email planifié après coup), on en
 * régénère un ; l'ancien lien cesse alors de fonctionner. La table bookings ne
 * garde que l'empreinte du dernier jeton.
 */
async function manageUrlForBooking(bookingId: string): Promise<string | null> {
  const { rotateManageToken } = await import("./bookings");
  const raw = await rotateManageToken(bookingId);
  return raw ? absoluteUrl(`/rdv/${raw}`) : null;
}
