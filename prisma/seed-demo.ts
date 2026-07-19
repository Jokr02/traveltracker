import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedCountries } from "./seed-countries";
import { resetDemoData } from "../src/lib/demo/reset";

const connectionString = process.env.DEMO_DATABASE_URL;
if (!connectionString) {
  console.error("DEMO_DATABASE_URL ist nicht gesetzt.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

async function main() {
  const count = await seedCountries(db);
  console.log(`Seeded ${count} countries into demo DB.`);

  await resetDemoData(db);

  await db.demoState.upsert({
    where: { id: "singleton" },
    update: { lastResetAt: new Date() },
    create: { id: "singleton" },
  });
  console.log("Demo fixtures created, DemoState baseline set.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
