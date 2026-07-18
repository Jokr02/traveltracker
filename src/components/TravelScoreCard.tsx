import Link from "next/link";
import { Sparkles } from "lucide-react";

export type TravelScoreData = {
  totalScore: number;
  hasHomeCountry: boolean;
  homeCountryName: string | null;
  rarest: {
    countryId: string;
    name: string;
    flagEmoji: string | null;
    rarityBonus: number;
  }[];
};

export function TravelScoreCard({ score }: { score: TravelScoreData }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
          {score.totalScore.toLocaleString("de-DE")}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Punkte</span>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        10 Basispunkte je Land + Seltenheits-Bonus (kleinere Länder geben
        mehr Punkte) {score.hasHomeCountry ? "+ Distanz-Bonus ab " + score.homeCountryName : ""}.
        {!score.hasHomeCountry && (
          <>
            {" "}
            <Link href="/settings" className="text-teal-700 hover:underline dark:text-teal-300">
              Heimatland festlegen
            </Link>{" "}
            für den Distanz-Bonus.
          </>
        )}
      </p>

      {score.rarest.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            <Sparkles className="h-3.5 w-3.5" /> Seltenste besuchte Länder
          </h3>
          <ul className="flex flex-col gap-1.5">
            {score.rarest.map((c) => (
              <li key={c.countryId}>
                <Link
                  href={`/countries/${c.countryId}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <span className="flex items-center gap-2">
                    <span>{c.flagEmoji ?? "🏳️"}</span>
                    {c.name}
                  </span>
                  <span className="text-xs tabular-nums text-zinc-400">
                    +{c.rarityBonus}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
