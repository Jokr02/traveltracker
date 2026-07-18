import { notFound } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowLeft } from "lucide-react";
import { getCountryById, type CountryStatus } from "@/lib/countries";
import { VisitList } from "@/components/VisitList";
import { PlanningStatusControl } from "@/components/PlanningStatusControl";

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

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const country = await getCountryById(id);
  if (!country) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/countries"
        className="flex w-fit items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück zur Länderliste
      </Link>

      <div className="flex items-start gap-4">
        <span className="text-5xl">{country.flagEmoji ?? "🏳️"}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {country.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {country.continent}
            {country.subregion ? ` · ${country.subregion}` : ""}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={clsx("h-2.5 w-2.5 rounded-full", STATUS_DOT[country.status])}
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {STATUS_LABEL[country.status]}
            </span>
          </div>
        </div>
      </div>

      {country.status !== "visited" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Planung
          </h2>
          <PlanningStatusControl
            countryId={country.id}
            value={country.planningStatus}
          />
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Besuche
        </h2>
        <VisitList countryId={country.id} visits={country.visits} />
      </div>

      {country.neighbors.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Nachbarländer
          </h2>
          <div className="flex flex-wrap gap-2">
            {country.neighbors.map((n) => (
              <Link
                key={n.id}
                href={`/countries/${n.id}`}
                className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:border-teal-300 hover:bg-teal-50/50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-teal-800 dark:hover:bg-teal-900/10"
              >
                <span>{n.flagEmoji ?? "🏳️"}</span>
                {n.name}
                <span
                  className={clsx("h-1.5 w-1.5 rounded-full", STATUS_DOT[n.status])}
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
