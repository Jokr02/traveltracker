"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Search } from "lucide-react";
import type { CountryStatus } from "@/lib/countries";

export type CountryListEntry = {
  id: string;
  name: string;
  continent: string;
  flagEmoji: string | null;
  status: CountryStatus;
  visitCount: number;
};

const STATUS_LABEL: Record<CountryStatus, string> = {
  visited: "Besucht",
  planned: "Geplant",
  wishlist: "Wunschliste",
  unvisited: "Nicht besucht",
};

const STATUS_DOT: Record<CountryStatus, string> = {
  visited: "bg-[var(--status-visited)]",
  planned: "bg-[var(--status-planned)]",
  wishlist: "bg-[var(--status-wishlist)]",
  unvisited: "bg-zinc-300 dark:bg-zinc-700",
};

const STATUS_ORDER: CountryStatus[] = [
  "visited",
  "planned",
  "wishlist",
  "unvisited",
];

export function CountriesList({
  countries,
  continents,
}: {
  countries: CountryListEntry[];
  continents: string[];
}) {
  const [query, setQuery] = useState("");
  const [continent, setContinent] = useState<string>("all");
  const [status, setStatus] = useState<CountryStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return countries.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (continent !== "all" && c.continent !== continent) return false;
      if (status !== "all" && c.status !== status) return false;
      return true;
    });
  }, [countries, query, continent, status]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Land suchen…"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <select
          value={continent}
          onChange={(e) => setContinent(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="all">Alle Kontinente</option>
          {continents.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setStatus("all")}
          className={clsx(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            status === "all"
              ? "border-teal-600 bg-teal-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800",
          )}
        >
          Alle ({countries.length})
        </button>
        {STATUS_ORDER.map((s) => {
          const count = countries.filter((c) => c.status === s).length;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={clsx(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                status === s
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800",
              )}
            >
              <span className={clsx("h-2 w-2 rounded-full", STATUS_DOT[s])} />
              {STATUS_LABEL[s]} ({count})
            </button>
          );
        })}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {filtered.length} {filtered.length === 1 ? "Land" : "Länder"}
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/countries/${c.id}`}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition-colors hover:border-teal-300 hover:bg-teal-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-teal-800 dark:hover:bg-teal-900/10"
          >
            <span className="text-2xl">{c.flagEmoji ?? "🏳️"}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {c.name}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {c.continent}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={clsx(
                  "h-2.5 w-2.5 rounded-full",
                  STATUS_DOT[c.status],
                )}
              />
              {c.visitCount > 0 && (
                <span className="text-[10px] text-zinc-400">
                  {c.visitCount}×
                </span>
              )}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Keine Länder gefunden.
          </p>
        )}
      </div>
    </div>
  );
}
