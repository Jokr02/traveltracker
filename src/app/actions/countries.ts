"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { PlanningStatus } from "@/generated/prisma/client";

export async function setPlanningStatus(
  countryId: string,
  status: keyof typeof PlanningStatus,
) {
  await requireAuth();
  const { db } = await getDb();

  await db.country.update({
    where: { id: countryId },
    data: { planningStatus: status },
  });

  revalidatePath(`/countries/${countryId}`);
  revalidatePath("/countries");
  revalidatePath("/stats");
  revalidatePath("/");
}
