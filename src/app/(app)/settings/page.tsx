import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getAllCountriesWithStatus } from "@/lib/countries";
import { HomeCountrySelect } from "@/components/HomeCountrySelect";

export default async function SettingsPage() {
  // Sequenziell statt Promise.all: gleichzeitige Prisma-Queries über den
  // pg-Adapter haben sich lokal als Race Condition erwiesen (siehe README).
  const settings = await getSettings();
  const countries = await getAllCountriesWithStatus();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Einstellungen
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          App-weite Einstellungen für dieses Single-User-Setup.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Heimatland
        </h2>
        <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          Wird für den distanzbasierten Anteil des Travel Scores verwendet
          (Luftlinie zu jedem besuchten Land).
        </p>
        <HomeCountrySelect
          countries={countries.map((c) => ({
            id: c.id,
            name: c.name,
            flagEmoji: c.flagEmoji,
          }))}
          value={settings.homeCountryId}
        />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Datenexport
        </h2>
        <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          Alle Länder, Besuche und Reisen als Datei herunterladen.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/export?format=json"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <FileJson className="h-4 w-4" /> Als JSON
            <Download className="h-3.5 w-3.5" />
          </a>
          <a
            href="/api/export?format=csv"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <FileSpreadsheet className="h-4 w-4" /> Als CSV
            <Download className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
