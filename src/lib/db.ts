import "server-only";
import { prisma, demoPrisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/session";
import type { PrismaClient } from "@/generated/prisma/client";

export type ResolvedDb = { db: PrismaClient; isDemo: boolean };

/** Wählt pro Request die passende Prisma-Instanz (echte DB oder isolierte
 * Demo-DB) anhand des Session-Cookies. Einmal pro Server Action/Route
 * Handler/Data-Loader aufrufen und das Ergebnis wiederverwenden. */
export async function getDb(): Promise<ResolvedDb> {
  if (await isDemoMode()) {
    if (!demoPrisma) {
      throw new Error(
        "Demo-Modus aktiv, aber DEMO_DATABASE_URL ist nicht gesetzt.",
      );
    }
    return { db: demoPrisma, isDemo: true };
  }
  return { db: prisma, isDemo: false };
}
