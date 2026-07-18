"use client";

import { useActionState, useEffect, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { uploadVisitPhoto, deleteVisitPhoto } from "@/app/actions/photos";

export type PhotoEntry = { id: string; url: string };

export function VisitPhotoGallery({
  visitId,
  countryId,
  photos,
}: {
  visitId: string;
  countryId: string;
  photos: PhotoEntry[];
}) {
  const uploadAction = uploadVisitPhoto.bind(null, visitId, countryId);
  const [state, formAction, pending] = useActionState(uploadAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state?.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <div className="flex flex-col gap-2">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((p) => (
            <div key={p.id} className="group relative h-16 w-16 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt="Reise-Highlight"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => deleteVisitPhoto(p.id, countryId)}
                aria-label="Foto löschen"
                className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow group-hover:flex"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form ref={formRef} action={formAction}>
        <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-teal-700 dark:hover:text-teal-300">
          <ImagePlus className="h-3.5 w-3.5" />
          {pending ? "Lädt hoch…" : "Foto hinzufügen"}
          <input
            type="file"
            name="file"
            accept="image/*"
            className="hidden"
            disabled={pending}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
          />
        </label>
      </form>
      {state?.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </div>
  );
}
