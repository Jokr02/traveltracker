"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB — Vercel Function Body Limit liegt bei 4.5 MB

export type PhotoUploadState = { error?: string } | undefined;

export async function uploadVisitPhoto(
  visitId: string,
  countryId: string,
  _prevState: PhotoUploadState,
  formData: FormData,
): Promise<PhotoUploadState> {
  await requireAuth();
  const { db, isDemo } = await getDb();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Bitte ein Bild auswählen." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Nur Bilddateien sind erlaubt." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: "Datei zu groß (max. 4 MB)." };
  }

  const { put } = await import("@vercel/blob");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const prefix = isDemo ? "demo/visits" : "visits";

  let pathname: string;
  try {
    const blob = await put(
      `${prefix}/${visitId}/${crypto.randomUUID()}-${safeName}`,
      file,
      { access: "private" },
    );
    pathname = blob.pathname;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Blob upload failed:", error);
    if (/credentials|token|BLOB_STORE_ID/i.test(message)) {
      return {
        error:
          "Foto-Upload ist nicht konfiguriert. Vercel Blob Store mit dem Projekt verbinden (siehe README).",
      };
    }
    return { error: "Foto-Upload fehlgeschlagen. Bitte erneut versuchen." };
  }

  await db.visitPhoto.create({
    data: { visitId, pathname },
  });

  revalidatePath(`/countries/${countryId}`);
  return undefined;
}

export async function deleteVisitPhoto(photoId: string, countryId: string) {
  await requireAuth();
  const { db } = await getDb();

  const photo = await db.visitPhoto.delete({ where: { id: photoId } });

  const { del } = await import("@vercel/blob");
  await del(photo.pathname).catch(() => {});

  revalidatePath(`/countries/${countryId}`);
}
