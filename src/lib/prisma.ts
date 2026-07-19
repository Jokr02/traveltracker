import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  demoPrisma: PrismaClient | undefined;
};

function createClient(connectionString: string) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? createClient(process.env.DATABASE_URL!);

// Isolierte Demo-DB (siehe src/lib/db.ts) — nur vorhanden, wenn konfiguriert.
// Fehlt die Env-Var, bleibt der Demo-Modus unsichtbar/deaktiviert statt zu crashen.
export const demoPrisma = process.env.DEMO_DATABASE_URL
  ? (globalForPrisma.demoPrisma ?? createClient(process.env.DEMO_DATABASE_URL))
  : undefined;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  if (demoPrisma) globalForPrisma.demoPrisma = demoPrisma;
}
