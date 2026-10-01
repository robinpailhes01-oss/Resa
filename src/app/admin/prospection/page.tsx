import type { Metadata } from "next";
import { SimplePage } from "@/components/pages/SimplePage";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { prospectionContent } from "@/content/fr/prospection";
import { providerLabels, shortEstablishmentName, type BookingProvider } from "@/lib/prospection";
import { followUpsAwaitingCheck, listContactedProspects, type ContactedProspect } from "@/server/prospection";
import { prospectionAdminAction } from "@/server/prospection/actions";
import { requireAdmin } from "@/server/prospection/admin";

export const metadata: Metadata = {
  title: "Suivi de la prospection",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const t = prospectionContent.admin;
const day = (d: Date | null) => (d ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Europe/Paris" }).format(d) : "");

function Row({ p }: { p: ContactedProspect }) {
  const provider = p.bookingProvider ? (providerLabels[p.bookingProvider as BookingProvider] ?? p.bookingProvider) : null;
  const open = p.status === "contacte" || p.status === "relance";
  const marked = p.status === "repondu" || p.status === "desinscrit";
  const followUp =
    p.status === "relance"
      ? `${t.followUpOn} ${day(p.followUpAt)}`
      : p.status === "contacte"
        ? p.followUpAllowed
          ? t.followUpScheduled
          : t.followUpBlocked
        : null;
  const button = (op: string, label: string, tone: string) => (
    <form action={prospectionAdminAction}>
      <input type="hidden" name="id" value={p.id} />
      <input type="hidden" name="op" value={op} />
      <button type="submit" className={`min-h-11 rounded-full px-4 text-[14px] font-semibold ${tone}`}>
        {label}
      </button>
    </form>
  );
  return (
    <li id={`p-${p.id}`} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold text-ink">{shortEstablishmentName(p.name)}</p>
        <p className="text-[14px] text-ink-muted">
          {p.city}
          {provider ? ` · ${provider}` : ""} · {p.email}
        </p>
        <p className="text-[13px] text-ink-muted">
          {t.firstEmail} {day(p.firstEmailAt)}
          {followUp ? ` · ${followUp}` : ""}
        </p>
        {p.lastReply ? <p className="mt-1 text-[13px] italic text-ink-muted">« {p.lastReply.slice(0, 160)} »</p> : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {open ? button("replied", t.markReplied, "bg-ink text-white") : null}
        {open ? button("declined", t.markDeclined, "border border-ink/15 bg-card text-ink") : null}
        {marked ? button("undo", t.undo, "border border-ink/15 bg-card text-ink") : null}
      </div>
    </li>
  );
}

function Group({ title, items }: { title: string; items: ContactedProspect[] }) {
  return (
    <section className="mt-10">
      <h2>
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-ink-muted">{t.empty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((p) => (
            <Row key={p.id} p={p} />
          ))}
        </ul>
      )}
    </section>
  );
}

/** Page de suivi de la prospection : réservée aux comptes administrateurs connectés. */
export default async function ProspectionAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  await requireAdmin("/admin/prospection");
  const ok = typeof params.ok === "string" ? params.ok : "";
  const [prospects, awaiting] = await Promise.all([listContactedProspects(), followUpsAwaitingCheck()]);
  const by = (statuses: string[]) => prospects.filter((p) => statuses.includes(p.status));

  return (
    <SimplePage title={t.title} intro={t.intro}>
      {ok && t.done[ok] ? <StatusMessage tone="success">{t.done[ok]}</StatusMessage> : null}

      <section className="mt-6 rounded-2xl border border-line bg-card p-5">
        <h2 className="!mt-0">{t.allowTitle}</h2>
        <p className="text-ink-muted">{t.allowHelp(awaiting)}</p>
        {awaiting > 0 ? (
          <form action={prospectionAdminAction} className="mt-4">
            <input type="hidden" name="op" value="allow" />
            <button type="submit" className="min-h-11 rounded-full bg-ink px-5 text-[15px] font-semibold text-white">
              {t.allowButton}
            </button>
          </form>
        ) : null}
      </section>

      <Group title={t.awaiting} items={by(["contacte"])} />
      <Group title={t.replied} items={by(["repondu"])} />
      <Group title={t.followedUp} items={by(["relance"])} />
      <Group title={t.declined} items={by(["desinscrit"])} />
      <Group title={t.signedUp} items={by(["inscrit"])} />
    </SimplePage>
  );
}
