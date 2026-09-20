import { formatDateKeyShort } from "@/lib/time";

type Point = { dateKey: string; count: number };

/**
 * Rendez-vous par jour : barres fines, une seule teinte, texte en encre.
 * Rendu côté serveur en SVG ; le survol affiche la valeur via <title>.
 */
export function BookingsChart({
  data,
  todayKey,
}: {
  data: Point[];
  todayKey: string;
}) {
  const width = 640;
  const height = 180;
  const padTop = 16;
  const padBottom = 28;
  const padLeft = 28;
  const padRight = 8;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const max = Math.max(1, ...data.map((d) => d.count));
  const ticks =
    max <= 4
      ? Array.from({ length: max + 1 }, (_, i) => i)
      : [0, Math.round(max / 2), max];
  const slot = plotW / Math.max(1, data.length);
  const barW = Math.max(3, Math.min(14, slot * 0.6));
  const labelEvery = data.length > 14 ? 7 : data.length > 7 ? 2 : 1;
  const y = (v: number) => padTop + plotH - (v / max) * plotH;
  const total = data.reduce((a, d) => a + d.count, 0);

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Rendez-vous par jour, ${total} au total`}
        className="h-auto w-full"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padLeft}
              x2={width - padRight}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--color-line)"
              strokeWidth={t === 0 ? 1 : 0.5}
              strokeDasharray={t === 0 ? undefined : "2 4"}
            />
            <text
              x={padLeft - 6}
              y={y(t) + 3.5}
              textAnchor="end"
              fontSize={10}
              fill="var(--color-ink-muted)"
            >
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padLeft + i * slot + (slot - barW) / 2;
          const h = (d.count / max) * plotH;
          const isToday = d.dateKey === todayKey;
          const future = d.dateKey > todayKey;
          const r = Math.min(4, barW / 2, h / 2);
          return (
            <g key={d.dateKey}>
              <title>{`${formatDateKeyShort(d.dateKey)} : ${d.count} rendez-vous`}</title>
              <rect
                x={padLeft + i * slot}
                y={padTop}
                width={slot}
                height={plotH}
                fill="transparent"
              />
              {d.count > 0 ? (
                <path
                  d={`M${x} ${padTop + plotH} v${-(h - r)} a${r} ${r} 0 0 1 ${r} ${-r} h${barW - 2 * r} a${r} ${r} 0 0 1 ${r} ${r} v${h - r} z`}
                  fill={future ? "var(--color-soft)" : "var(--color-brand)"}
                  stroke={isToday ? "var(--color-accent)" : "none"}
                  strokeWidth={isToday ? 2 : 0}
                />
              ) : null}
              {i % labelEvery === 0 ? (
                <text
                  x={padLeft + i * slot + slot / 2}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--color-ink-muted)"
                  fontWeight={isToday ? 700 : 400}
                >
                  {d.dateKey.slice(8)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rounded-sm bg-brand"
            aria-hidden="true"
          />{" "}
          Rendez-vous passés
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rounded-sm bg-soft"
            aria-hidden="true"
          />{" "}
          À venir
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rounded-sm ring-2 ring-accent"
            aria-hidden="true"
          />{" "}
          Aujourd’hui
        </span>
      </figcaption>
    </figure>
  );
}
