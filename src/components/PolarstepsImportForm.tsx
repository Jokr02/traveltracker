"use client";

import { useActionState } from "react";
import { importTripFromPolarsteps } from "@/app/actions/polarsteps";

const fileInputClass =
  "text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-300 dark:text-zinc-300 dark:file:bg-zinc-700 dark:file:text-zinc-200 dark:hover:file:bg-zinc-600";

export function PolarstepsImportForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(
    importTripFromPolarsteps,
    undefined,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50/40 p-4 dark:border-teal-900 dark:bg-teal-900/10"
    >
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Aus Polarsteps importieren
        </h3>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Export von polarsteps.com → Account Settings → &bdquo;Download my data&ldquo;.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="tripFile"
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          trip.json
        </label>
        <input
          id="tripFile"
          name="tripFile"
          type="file"
          accept="application/json,.json"
          required
          className={fileInputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="locationsFile"
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          locations.json (optional — für die echte Route auf der Karte statt
          einer geraden Linie)
        </label>
        <input
          id="locationsFile"
          name="locationsFile"
          type="file"
          accept="application/json,.json"
          className={fileInputClass}
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          {state.success}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Importiert…" : "Importieren"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Schließen
        </button>
      </div>
    </form>
  );
}
