const RAMP = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95"];

function colorFor(count: number, max: number) {
  if (count === 0) return "var(--chart-gridline)";
  const idx = Math.min(RAMP.length - 1, Math.ceil((count / max) * RAMP.length) - 1);
  return RAMP[Math.max(0, idx)];
}

export function YearHeatmap({
  data,
}: {
  data: { year: number; count: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Noch keine Daten vorhanden.
      </p>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex flex-wrap gap-2">
      {data.map((d) => {
        const bg = colorFor(d.count, max);
        const strong = d.count / max > 0.55;
        return (
          <div
            key={d.year}
            title={`${d.count} neue${d.count === 1 ? "s" : ""} Land${d.count === 1 ? "" : " länder"} in ${d.year}`}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold tabular-nums"
              style={{
                backgroundColor: bg,
                color: strong ? "#ffffff" : "var(--text-secondary)",
              }}
            >
              {d.count}
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {d.year}
            </span>
          </div>
        );
      })}
    </div>
  );
}
