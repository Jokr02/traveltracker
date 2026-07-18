"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export type TripFormState = { error?: string } | undefined;

export async function createTrip(
  _prevState: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  await requireAuth();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Bitte einen Namen für die Reise angeben." };
  }
  const notes = String(formData.get("notes") ?? "").trim();

  await prisma.trip.create({ data: { name, notes: notes || null } });

  revalidatePath("/trips");
  return undefined;
}

export async function deleteTrip(tripId: string) {
  await requireAuth();
  await prisma.trip.delete({ where: { id: tripId } });
  revalidatePath("/trips");
  revalidatePath("/countries");
  revalidatePath("/");
}
