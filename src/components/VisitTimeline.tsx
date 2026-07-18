import Link from "next/link";
import { Star } from "lucide-react";

export type TimelineEntry = {
  visitId: string;
  countryId: string;
  countryName: string;
  flagEmoji: string | null;
  startDate: Date;
  endDate: Date | null;
  rating: number | null;
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "short",
});

export function VisitTimeline({ items }: { items: TimelineEntry[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Noch keine Reisen eingetragen.
      </p>
    );
  }

  const chronological = [...items].sort(
    (a, b) => b.startDate.getTime() - a.startDate.getTime(),
  );

  const byYear = new Map<number, TimelineEntry[]>();
  for (const item of chronological) {
    const year = item.startDate.getFullYear();
    const arr = byYear.get(year) ?? [];
    arr.push(item);
    byYear.set(year, arr);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...byYear.entries()].map(([year, entries]) => (
        <div key={year}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {year}
          </h3>
          <ol className="flex flex-col gap-2 border-l border-zinc-200 pl-4 dark:border-zinc-800">
            {entries.map((item) => (
              <li key={item.visitId} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-[var(--status-visited)]" />
                <Link
                  href={`/countries/${item.countryId}`}
                  className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <span className="text-base">{item.flagEmoji ?? "🏳️"}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {item.countryName}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {dateFormatter.format(item.startDate)}
                    {item.endDate && ` – ${dateFormatter.format(item.endDate)}`}
                  </span>
                  {item.rating && (
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
