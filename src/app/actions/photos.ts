"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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

  let blob: { url: string };
  try {
    blob = await put(
      `visits/${visitId}/${crypto.randomUUID()}-${file.name}`,
      file,
      { access: "public" },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Blob upload failed:", error);
    if (/credentials|token|BLOB_STORE_ID/i.test(message)) {
      return {
        error:
          "Foto-Upload ist nicht konfiguriert. Vercel Blob Store mit dem Projekt verbinden (siehe README).",
      };
    }
    return { error: `Foto-Upload fehlgeschlagen: ${message}` };
  }

  await prisma.visitPhoto.create({
    data: { visitId, url: blob.url },
  });

  revalidatePath(`/countries/${countryId}`);
  return undefined;
}

export async function deleteVisitPhoto(photoId: string, countryId: string) {
  await requireAuth();

  const photo = await prisma.visitPhoto.delete({ where: { id: photoId } });

  const { del } = await import("@vercel/blob");
  await del(photo.url).catch(() => {});

  revalidatePath(`/countries/${countryId}`);
}
