import { getAllTrips } from "@/lib/trips";
import { TripsList } from "@/components/TripsList";

export default async function TripsPage() {
  const trips = await getAllTrips();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Reisen
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gruppiere mehrere Länderbesuche zu einer zusammenhängenden Reise.
        </p>
      </div>

      <TripsList trips={trips} />
    </div>
  );
}
