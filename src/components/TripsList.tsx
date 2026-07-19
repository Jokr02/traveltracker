"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Plus, Trash2, Luggage, Route, Upload, MapPinned } from "lucide-react";
import { createTrip, deleteTrip } from "@/app/actions/trips";
import { PolarstepsImportForm } from "@/components/PolarstepsImportForm";
import { ShareButton } from "@/components/ShareButton";
import { haversineKm } from "@/lib/geo";

export type TripEntry = {
  id: string;
  name: string;
  notes: string | null;
  route: unknown;
  distanceKm: number | null;
  visits: {
    id: string;
    startDate: Date;
    endDate: Date | null;
    country: {
      id: string;
      name: string;
      flagEmoji: string | null;
      latitude: number;
      longitude: number;
    };
  }[];
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function estimateDistanceKm(visits: TripEntry["visits"]) {
  let total = 0;
  for (let i = 1; i < visits.length; i++) {
    const a = visits[i - 1].country;
    const b = visits[i].country;
    total += haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
  }
  return Math.round(total);
}

function CreateTripForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(createTrip, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !pending) {
      submittedRef.current = false;
      if (!state?.error) onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => {
        submittedRef.current = true;
      }}
      className="flex flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50/40 p-4 dark:border-teal-900 dark:bg-teal-900/10"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Name der Reise
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="z.B. Skandinavien 2023"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Notizen (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Speichert…" : "Reise anlegen"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

type OpenForm = "none" | "create" | "import";

export function TripsList({
  trips,
  demoMode,
}: {
  trips: TripEntry[];
  demoMode?: boolean;
}) {
  const [openForm, setOpenForm] = useState<OpenForm>("none");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(tripId: string) {
    if (!confirm("Diese Reise wirklich löschen? Die zugeordneten Besuche bleiben erhalten.")) return;
    setDeletingId(tripId);
    try {
      await deleteTrip(tripId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {openForm === "create" && (
        <CreateTripForm onDone={() => setOpenForm("none")} />
      )}
      {openForm === "import" && (
        <PolarstepsImportForm onDone={() => setOpenForm("none")} />
      )}

      {openForm === "none" && (
        <div className={clsx("grid grid-cols-1 gap-2", !demoMode && "sm:grid-cols-2")}>
          <button
            type="button"
            onClick={() => setOpenForm("create")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-teal-700 dark:hover:text-teal-300"
          >
            <Plus className="h-4 w-4" /> Neue Reise
          </button>
          {!demoMode && (
            <button
              type="button"
              onClick={() => setOpenForm("import")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-teal-700 dark:hover:text-teal-300"
            >
              <Upload className="h-4 w-4" /> Aus Polarsteps importieren
            </button>
          )}
        </div>
      )}

      {trips.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Noch keine Reisen angelegt. Reisen gruppieren mehrere Länderbesuche
          (z.B. &bdquo;Skandinavien 2023&ldquo; mit Norwegen, Schweden und Dänemark).
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {trips.map((trip) => {
          const dates = trip.visits.flatMap((v) => [v.startDate, v.endDate ?? v.startDate]);
          const start = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
          const end = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
          const hasRealDistance = typeof trip.distanceKm === "number";
          const distance = hasRealDistance
            ? Math.round(trip.distanceKm as number)
            : estimateDistanceKm(trip.visits);

          return (
            <div
              key={trip.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    <Luggage className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {trip.name}
                  </div>
                  {start && end && (
                    <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {dateFormatter.format(start)}
                      {end.getTime() !== start.getTime() && ` – ${dateFormatter.format(end)}`}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {trip.visits.length > 0 && (
                    <ShareButton
                      url={`/api/share/trip/${trip.id}`}
                      filename={`${trip.name.replace(/[^a-zA-Z0-9._-]/g, "_")}.png`}
                      label=""
                      className="!p-2"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(trip.id)}
                    disabled={deletingId === trip.id}
                    aria-label="Reise löschen"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {trip.notes && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{trip.notes}</p>
              )}

              {trip.visits.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {trip.visits.map((v) => (
                    <Link
                      key={v.id}
                      href={`/countries/${v.country.id}`}
                      className="flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-700 hover:border-teal-300 hover:bg-teal-50/50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-teal-800 dark:hover:bg-teal-900/10"
                    >
                      <span>{v.country.flagEmoji ?? "🏳️"}</span>
                      {v.country.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Noch keinem Besuch zugeordnet — wähle diese Reise beim
                  Eintragen eines Besuchs auf einer Länderseite aus.
                </p>
              )}

              {distance > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Route className="h-3.5 w-3.5" />
                  {distance.toLocaleString("de-DE")} km
                  {hasRealDistance
                    ? " zurückgelegt"
                    : " zwischen den Stationen (geschätzt)"}
                </div>
              )}
              {Array.isArray(trip.route) && trip.route.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400">
                  <MapPinned className="h-3.5 w-3.5" />
                  Echte Route auf der Karte hinterlegt
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
