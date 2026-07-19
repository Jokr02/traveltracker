"use client";

import { useActionState } from "react";
import { login, loginDemo } from "@/app/actions/auth";
import { Globe2 } from "lucide-react";

export function LoginForm({ demoAvailable }: { demoAvailable: boolean }) {
  const [state, action, pending] = useActionState(login, undefined);
  const [demoState, demoAction, demoPending] = useActionState(
    loginDemo,
    undefined,
  );

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
            <Globe2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Travel Tracker
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Bitte Passwort eingeben, um fortzufahren.
          </p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
          >
            {pending ? "Prüfe…" : "Anmelden"}
          </button>
        </form>

        {demoAvailable && (
          <>
            <div className="my-4 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              oder
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <form action={demoAction} className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={demoPending}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {demoPending ? "Lädt Demo…" : "Demo ausprobieren"}
              </button>
              {demoState?.error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {demoState.error}
                </p>
              )}
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Zeigt Beispieldaten in einem eigenen Bereich – Änderungen
                werden regelmäßig zurückgesetzt.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
