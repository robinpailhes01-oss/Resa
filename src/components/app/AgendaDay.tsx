import Link from "next/link";
import { toZonedParts, minutesToHHMM } from "@/lib/time";
import type { Booking } from "@/server/app/bookings";
import type { Practitioner } from "@/server/app/practitioners";
import { cn } from "@/lib/cn";

const tones = {
  soft: { bg: "bg-soft-tint hover:bg-soft", bar: "bg-[#B9A6CB]" },
  accent: { bg: "bg-accent-tint hover:bg-[#f3d9c6]", bar: "bg-accent" },
  success: { bg: "bg-success-tint hover:bg-[#d9ece1]", bar: "bg-[#8FC7A9]" },
} as const;

const statusLabel: Record<Booking["status"], string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
  no_show: "Absent",
};

type Props = {
  timeZone: string;
  practitioners: Practitioner[];
  bookings: Booking[];
  /** Bornes d'affichage en minutes locales. */
  startMin: number;
  endMin: number;
};

/** Vue jour de l'agenda : une colonne par praticien, rendez-vous positionnés à l'heure. */
export function AgendaDay({
  timeZone,
  practitioners,
  bookings,
  startMin,
  endMin,
}: Props) {
  const rowHeight = 56; // px par heure
  const hours: number[] = [];
  for (let m = startMin; m <= endMin; m += 60) hours.push(m);
  const height = ((endMin - startMin) / 60) * rowHeight;

  return (
    <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-line">
      <div className="min-w-[640px]">
        <div
          className="grid border-b border-line"
          style={{
            gridTemplateColumns: `56px repeat(${practitioners.length}, minmax(0, 1fr))`,
          }}
        >
          <div />
          {practitioners.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 border-l border-line px-3 py-3"
            >
              <span
                className={cn("size-2.5 rounded-full", tones[p.color].bar)}
                aria-hidden="true"
              />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[14px] font-semibold text-ink">
                  {p.name}
                </div>
                {p.roleTitle ? (
                  <div className="truncate text-[12px] text-ink-muted">
                    {p.roleTitle}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `56px repeat(${practitioners.length}, minmax(0, 1fr))`,
            height: height + 8,
          }}
        >
          <div className="relative">
            {hours.map((m, i) => (
              <div
                key={m}
                className="absolute right-2 text-[11px] text-ink-muted"
                style={{ top: i * rowHeight - 6 }}
              >
                {minutesToHHMM(m)}
              </div>
            ))}
          </div>
          {practitioners.map((p) => {
            const items = bookings.filter((b) => b.practitionerId === p.id);
            return (
              <div key={p.id} className="relative border-l border-line">
                {hours.slice(0, -1).map((m, i) => (
                  <div
                    key={m}
                    className="absolute inset-x-0 border-t border-line/70"
                    style={{ top: i * rowHeight }}
                  >
                    <div className="absolute inset-x-0 top-[28px] border-t border-dashed border-line/50" />
                  </div>
                ))}
                {items.map((b) => {
                  const start = toZonedParts(b.startsAt, timeZone).minutesOfDay;
                  const end = start + b.durationMin;
                  const top =
                    ((Math.max(start, startMin) - startMin) / 60) * rowHeight +
                    2;
                  const bottom =
                    ((Math.min(end, endMin) - startMin) / 60) * rowHeight - 2;
                  const cancelled =
                    b.status === "cancelled" || b.status === "no_show";
                  const tone = tones[p.color];
                  return (
                    <Link
                      key={b.id}
                      href={`/app/rendez-vous/${b.id}`}
                      className={cn(
                        "absolute inset-x-1.5 flex overflow-hidden rounded-lg text-[12px] leading-[15px] ring-1 ring-black/[0.03] transition-colors",
                        cancelled
                          ? "bg-page text-ink-muted line-through"
                          : tone.bg,
                      )}
                      style={{ top, height: Math.max(bottom - top, 22) }}
                    >
                      <span
                        className={cn(
                          "w-1 shrink-0",
                          cancelled ? "bg-line" : tone.bar,
                        )}
                      />
                      <span className="min-w-0 px-2 py-1">
                        <span className="block truncate font-semibold text-ink">
                          {b.serviceName}
                        </span>
                        <span className="block text-ink-muted">
                          {minutesToHHMM(start)} – {minutesToHHMM(end)}
                          {b.status !== "confirmed"
                            ? ` · ${statusLabel[b.status]}`
                            : ""}
                        </span>
                        {b.client ? (
                          <span className="block truncate text-ink-muted">
                            {`${b.client.firstName} ${b.client.lastName}`.trim()}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
