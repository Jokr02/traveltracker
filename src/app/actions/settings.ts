"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export async function setHomeCountry(countryId: string | null) {
  await requireAuth();

  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: { homeCountryId: countryId },
    create: { id: "singleton", homeCountryId: countryId },
  });

  revalidatePath("/settings");
  revalidatePath("/stats");
}
