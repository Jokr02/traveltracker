"use client";

import { useActionState, useEffect, useRef } from "react";
import { StarRatingInput } from "@/components/StarRatingInput";
import type { VisitFormState } from "@/app/actions/visits";

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";

type Defaults = {
  startDate?: string;
  endDate?: string;
  notes?: string;
  rating?: number | null;
  coverImageUrl?: string;
};

export function VisitForm({
  action,
  defaults,
  submitLabel = "Speichern",
  onCancel,
  onSuccess,
}: {
  action: (
    prevState: VisitFormState,
    formData: FormData,
  ) => Promise<VisitFormState>;
  defaults?: Defaults;
  submitLabel?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !pending) {
      submittedRef.current = false;
      if (!state?.error) onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, state]);

  return (
    <form
      action={formAction}
      onSubmit={() => {
        submittedRef.current = true;
      }}
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="startDate"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Von
          </label>
          <input
            id="startDate"
            type="date"
            name="startDate"
            required
            defaultValue={defaults?.startDate}
            className={inputClass}
          />
          {state?.fieldErrors?.startDate && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.startDate}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="endDate"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Bis (optional)
          </label>
          <input
            id="endDate"
            type="date"
            name="endDate"
            defaultValue={defaults?.endDate}
            className={inputClass}
          />
          {state?.fieldErrors?.endDate && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.endDate}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Bewertung
        </label>
        <StarRatingInput name="rating" defaultValue={defaults?.rating} />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="notes"
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Notizen
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaults?.notes}
          className={inputClass}
        />
        {state?.fieldErrors?.notes && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.notes}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="coverImageUrl"
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Cover-Bild (URL, optional)
        </label>
        <input
          id="coverImageUrl"
          type="url"
          name="coverImageUrl"
          placeholder="https://…"
          defaultValue={defaults?.coverImageUrl}
          className={inputClass}
        />
        {state?.fieldErrors?.coverImageUrl && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.coverImageUrl}
          </p>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Speichert…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}
