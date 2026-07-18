"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { PlanningStatus } from "@/generated/prisma/client";

export async function setPlanningStatus(
  countryId: string,
  status: keyof typeof PlanningStatus,
) {
  await requireAuth();

  await prisma.country.update({
    where: { id: countryId },
    data: { planningStatus: status },
  });

  revalidatePath(`/countries/${countryId}`);
  revalidatePath("/countries");
  revalidatePath("/stats");
  revalidatePath("/");
}
