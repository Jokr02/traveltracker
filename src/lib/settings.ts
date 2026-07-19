import "server-only";
import { getDb } from "@/lib/db";

export async function getSettings() {
  const { db } = await getDb();
  const settings = await db.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
    include: { homeCountry: true },
  });
  return settings;
}
