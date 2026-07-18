import { getAllCountriesWithStatus } from "@/lib/countries";
import { CountriesList } from "@/components/CountriesList";

export default async function CountriesPage() {
  const countries = await getAllCountriesWithStatus();
  const continents = [...new Set(countries.map((c) => c.continent))].sort();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Länder
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Durchsuchbare Liste aller Länder, filterbar nach Kontinent und Status.
        </p>
      </div>

      <CountriesList
        countries={countries.map((c) => ({
          id: c.id,
          name: c.name,
          continent: c.continent,
          flagEmoji: c.flagEmoji,
          status: c.status,
          visitCount: c.visitCount,
        }))}
        continents={continents}
      />
    </div>
  );
}
