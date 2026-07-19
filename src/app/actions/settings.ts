"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function setHomeCountry(countryId: string | null) {
  await requireAuth();
  const { db } = await getDb();

  await db.setting.upsert({
    where: { id: "singleton" },
    update: { homeCountryId: countryId },
    create: { id: "singleton", homeCountryId: countryId },
  });

  revalidatePath("/settings");
  revalidatePath("/stats");
}
