"use client";

import { useState } from "react";
import { Star, Pencil, Trash2, Plus } from "lucide-react";
import { clsx } from "clsx";
import { VisitForm } from "@/components/VisitForm";
import { createVisit, updateVisit, deleteVisit } from "@/app/actions/visits";

export type VisitEntry = {
  id: string;
  startDate: Date;
  endDate: Date | null;
  notes: string | null;
  rating: number | null;
  coverImageUrl: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function VisitList({
  countryId,
  visits,
}: {
  countryId: string;
  visits: VisitEntry[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(visitId: string) {
    if (!confirm("Diesen Besuch wirklich löschen?")) return;
    setDeletingId(visitId);
    try {
      await deleteVisit(visitId, countryId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {visits.length === 0 && !adding && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Noch keine Besuche eingetragen.
        </p>
      )}

      {visits.map((v) =>
        editingId === v.id ? (
          <div
            key={v.id}
            className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 dark:border-teal-900 dark:bg-teal-900/10"
          >
            <VisitForm
              action={updateVisit.bind(null, v.id, countryId)}
              defaults={{
                startDate: toInputDate(v.startDate),
                endDate: v.endDate ? toInputDate(v.endDate) : undefined,
                notes: v.notes ?? undefined,
                rating: v.rating,
                coverImageUrl: v.coverImageUrl ?? undefined,
              }}
              submitLabel="Änderungen speichern"
              onCancel={() => setEditingId(null)}
              onSuccess={() => setEditingId(null)}
            />
          </div>
        ) : (
          <div
            key={v.id}
            className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {v.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={v.coverImageUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {dateFormatter.format(v.startDate)}
                  {v.endDate && ` – ${dateFormatter.format(v.endDate)}`}
                </span>
                {v.rating && (
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: v.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </span>
                )}
              </div>
              {v.notes && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                  {v.notes}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setEditingId(v.id)}
                aria-label="Bearbeiten"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(v.id)}
                disabled={deletingId === v.id}
                aria-label="Löschen"
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400",
                  deletingId === v.id && "opacity-50",
                )}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ),
      )}

      {adding ? (
        <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 dark:border-teal-900 dark:bg-teal-900/10">
          <VisitForm
            action={createVisit.bind(null, countryId)}
            submitLabel="Besuch hinzufügen"
            onCancel={() => setAdding(false)}
            onSuccess={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-teal-700 dark:hover:text-teal-300"
        >
          <Plus className="h-4 w-4" /> Besuch hinzufügen
        </button>
      )}
    </div>
  );
}
