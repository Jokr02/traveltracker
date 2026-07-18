import { getStats } from "@/lib/stats";
import { getTravelScore } from "@/lib/travelScore";
import { StatTile } from "@/components/StatTile";
import { ContinentBarChart } from "@/components/ContinentBarChart";
import { YearHeatmap } from "@/components/YearHeatmap";
import { VisitTimeline } from "@/components/VisitTimeline";
import { AchievementsGrid } from "@/components/AchievementsGrid";
import { TravelScoreCard } from "@/components/TravelScoreCard";
import { Globe2, Map as MapIcon, Route, Trophy } from "lucide-react";

export default async function StatsPage() {
  const stats = await getStats();
  const score = await getTravelScore();
  const unlockedCount = stats.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Statistik
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Alle Zahlen und Meilensteine rund um deine Reisen.
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
          value={`${unlockedCount}`}
          hint={`von ${stats.achievements.length}`}
        />
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Travel Score
        </h2>
        <TravelScoreCard score={score} />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Abdeckung pro Kontinent
        </h2>
        <ContinentBarChart data={stats.continentBreakdown} />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Neue Länder pro Jahr
        </h2>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          Wie viele neue Länder du in welchem Jahr zum ersten Mal besucht hast.
        </p>
        <YearHeatmap data={stats.yearlyNewCountries} />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Achievements
        </h2>
        <AchievementsGrid achievements={stats.achievements} />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Zeitstrahl
        </h2>
        <VisitTimeline items={stats.timeline} />
      </section>
    </div>
  );
}
