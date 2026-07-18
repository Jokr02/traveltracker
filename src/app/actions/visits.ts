"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { visitFormSchema } from "@/lib/validation";

export type VisitFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

function parseVisitForm(formData: FormData) {
  const raw = {
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    rating: String(formData.get("rating") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
  };
  return visitFormSchema.safeParse(raw);
}

function revalidateCountryViews(countryId: string) {
  revalidatePath(`/countries/${countryId}`);
  revalidatePath("/countries");
  revalidatePath("/stats");
  revalidatePath("/");
}

export async function createVisit(
  countryId: string,
  _prevState: VisitFormState,
  formData: FormData,
): Promise<VisitFormState> {
  await requireAuth();

  const parsed = parseVisitForm(formData);
  if (!parsed.success) {
    return {
      error: "Bitte die markierten Felder korrigieren.",
      fieldErrors: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "",
        ]),
      ),
    };
  }

  const { startDate, endDate, notes, rating, coverImageUrl } = parsed.data;

  await prisma.visit.create({
    data: {
      countryId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes: notes ?? null,
      rating: rating ?? null,
      coverImageUrl: coverImageUrl ?? null,
    },
  });

  revalidateCountryViews(countryId);
  return undefined;
}

export async function updateVisit(
  visitId: string,
  countryId: string,
  _prevState: VisitFormState,
  formData: FormData,
): Promise<VisitFormState> {
  await requireAuth();

  const parsed = parseVisitForm(formData);
  if (!parsed.success) {
    return {
      error: "Bitte die markierten Felder korrigieren.",
      fieldErrors: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "",
        ]),
      ),
    };
  }

  const { startDate, endDate, notes, rating, coverImageUrl } = parsed.data;

  await prisma.visit.update({
    where: { id: visitId },
    data: {
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes: notes ?? null,
      rating: rating ?? null,
      coverImageUrl: coverImageUrl ?? null,
    },
  });

  revalidateCountryViews(countryId);
  return undefined;
}

export async function deleteVisit(visitId: string, countryId: string) {
  await requireAuth();
  await prisma.visit.delete({ where: { id: visitId } });
  revalidateCountryViews(countryId);
}
