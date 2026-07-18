import Link from "next/link";
import { getAllCountriesWithStatus } from "@/lib/countries";
import { getStats } from "@/lib/stats";
import { WorldMap } from "@/components/WorldMap";
import { StatTile } from "@/components/StatTile";
import { ArrowRight, Globe2, Map as MapIcon, Route, Trophy } from "lucide-react";

export default async function DashboardPage() {
  const [countries, stats] = await Promise.all([
    getAllCountriesWithStatus(),
    getStats(),
  ]);

  const unlockedAchievements = stats.achievements.filter((a) => a.unlocked);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Ein Überblick über deine bereisten Länder.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={Globe2}
          label="Besuchte Länder"
          value={`${stats.visitedCount}`}
          hint={`von ${stats.totalCountries}`}
        />
        <StatTile
          icon={MapIcon}
          label="Weltfläche"
          value={`${stats.areaCoveragePct.toFixed(1)}%`}
          hint="abgedeckt"
        />
        <StatTile
          icon={Route}
          label="Reisedistanz"
          value={stats.totalKm.toLocaleString("de-DE")}
          hint="km (Luftlinie, geschätzt)"
        />
        <StatTile
          icon={Trophy}
          label="Achievements"
          value={`${unlockedAchievements.length}`}
          hint={`von ${stats.achievements.length}`}
        />
      </div>

      <WorldMap
        countries={countries.map((c) => ({
          id: c.id,
          ccn3: c.ccn3,
          name: c.name,
          status: c.status,
          visitCount: c.visitCount,
        }))}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Abdeckung pro Kontinent
            </h2>
            <Link
              href="/stats"
              className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
            >
              Alle Statistiken <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {stats.continentBreakdown.map((c) => (
              <div key={c.continent} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  {c.continent}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-[var(--status-visited)]"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {c.visited}/{c.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Letzte Achievements
          </h2>
          {unlockedAchievements.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Noch keine Achievements freigeschaltet — trag deinen ersten
              Besuch ein!
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {unlockedAchievements.slice(-4).reverse().map((a) => (
                <li key={a.id} className="flex items-start gap-2.5">
                  <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {a.label}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {a.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
