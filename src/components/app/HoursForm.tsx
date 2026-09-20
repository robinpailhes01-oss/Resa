import { ActionForm } from "@/components/app/ActionForm";
import { FieldError } from "@/components/app/FormContext";
import { frenchWeekdayName, minutesToHHMM } from "@/lib/time";
import type { OpeningHourRow } from "@/server/app/hours";
import { saveOpeningHoursAction } from "@/server/app/actions/establishment";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Grille hebdomadaire : jusqu'à deux plages par jour (matin / après-midi). */
export function HoursForm({
  hours,
  practitionerId,
  intro,
}: {
  hours: OpeningHourRow[];
  practitionerId: string | null;
  intro?: string;
}) {
  const byDay = new Map<number, OpeningHourRow[]>();
  for (const h of hours)
    byDay.set(h.weekday, [...(byDay.get(h.weekday) ?? []), h]);
  return (
    <ActionForm
      action={saveOpeningHoursAction}
      submitLabel="Enregistrer les horaires"
    >
      <>
        {practitionerId ? (
          <input type="hidden" name="practitionerId" value={practitionerId} />
        ) : null}
        {intro ? <p className="text-[14px] text-ink-muted">{intro}</p> : null}
        <div className="overflow-hidden rounded-xl ring-1 ring-line">
          {ORDER.map((weekday) => {
            const ranges = byDay.get(weekday) ?? [];
            const open = ranges.length > 0;
            return (
              <div
                key={weekday}
                className="grid gap-3 border-b border-line bg-card px-4 py-3 last:border-b-0 sm:grid-cols-[130px_1fr] sm:items-center"
              >
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name={`open-${weekday}`}
                    defaultChecked={open}
                    className="size-5 accent-brand"
                  />
                  <span className="text-[15px] font-semibold capitalize text-ink">
                    {frenchWeekdayName(weekday)}
                  </span>
                </label>
                <div className="flex flex-wrap items-center gap-2 text-[14px]">
                  {[0, 1].map((n) => (
                    <span key={n} className="inline-flex items-center gap-1.5">
                      {n === 1 ? (
                        <span className="mx-1 text-ink-muted">et</span>
                      ) : null}
                      <input
                        type="time"
                        name={`start-${weekday}-${n}`}
                        defaultValue={
                          ranges[n]
                            ? minutesToHHMM(ranges[n].startMin)
                            : n === 0
                              ? "09:00"
                              : ""
                        }
                        step={300}
                        className="min-h-10 rounded-field border border-control bg-card px-2 text-[14px] text-ink"
                        aria-label={`${frenchWeekdayName(weekday)} plage ${n + 1} début`}
                      />
                      <span className="text-ink-muted">–</span>
                      <input
                        type="time"
                        name={`end-${weekday}-${n}`}
                        defaultValue={
                          ranges[n]
                            ? minutesToHHMM(ranges[n].endMin)
                            : n === 0
                              ? "19:00"
                              : ""
                        }
                        step={300}
                        className="min-h-10 rounded-field border border-control bg-card px-2 text-[14px] text-ink"
                        aria-label={`${frenchWeekdayName(weekday)} plage ${n + 1} fin`}
                      />
                    </span>
                  ))}
                  <FieldError
                    name={`day-${weekday}`}
                    className="basis-full text-small font-medium text-error"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-small text-ink-muted">
          Décochez un jour pour le fermer. La deuxième plage sert par exemple à
          une pause déjeuner (9:00–12:30 et 14:00–19:00).
        </p>
      </>
    </ActionForm>
  );
}
