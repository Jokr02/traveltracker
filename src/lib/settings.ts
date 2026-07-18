import "server-only";
import { prisma } from "@/lib/prisma";

export async function getSettings() {
  const settings = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
    include: { homeCountry: true },
  });
  return settings;
}
