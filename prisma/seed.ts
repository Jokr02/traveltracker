import countries from "world-countries";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CONTINENT_DE: Record<string, string> = {
  Africa: "Afrika",
  Americas: "Amerika",
  Asia: "Asien",
  Europe: "Europa",
  Oceania: "Ozeanien",
  Antarctic: "Antarktis",
};

const SUBREGION_DE: Record<string, string> = {
  "Australia and New Zealand": "Australien und Neuseeland",
  Caribbean: "Karibik",
  "Central America": "Mittelamerika",
  "Central Asia": "Zentralasien",
  "Central Europe": "Mitteleuropa",
  "Eastern Africa": "Ostafrika",
  "Eastern Asia": "Ostasien",
  "Eastern Europe": "Osteuropa",
  Melanesia: "Melanesien",
  Micronesia: "Mikronesien",
  "Middle Africa": "Mittelafrika",
  "North America": "Nordamerika",
  "Northern Africa": "Nordafrika",
  "Northern Europe": "Nordeuropa",
  Polynesia: "Polynesien",
  "South America": "Südamerika",
  "South-Eastern Asia": "Südostasien",
  "Southeast Europe": "Südosteuropa",
  "Southern Africa": "Südliches Afrika",
  "Southern Asia": "Südasien",
  "Southern Europe": "Südeuropa",
  "Western Africa": "Westafrika",
  "Western Asia": "Westasien",
  "Western Europe": "Westeuropa",
};

async function main() {
  for (const c of countries) {
    const [latitude, longitude] = c.latlng ?? [0, 0];
    const name = c.translations.deu?.common ?? c.name.common;
    const continent = CONTINENT_DE[c.region] ?? c.region;

    await prisma.country.upsert({
      where: { cca3: c.cca3 },
      update: {
        name,
        continent,
        subregion: c.subregion ? (SUBREGION_DE[c.subregion] ?? c.subregion) : null,
        latitude,
        longitude,
        areaKm2: c.area ?? null,
        flagEmoji: c.flag ?? null,
        ccn3: c.ccn3 ?? null,
        borders: c.borders ?? [],
      },
      create: {
        cca3: c.cca3,
        ccn3: c.ccn3 ?? null,
        name,
        continent,
        subregion: c.subregion ? (SUBREGION_DE[c.subregion] ?? c.subregion) : null,
        latitude,
        longitude,
        areaKm2: c.area ?? null,
        flagEmoji: c.flag ?? null,
        borders: c.borders ?? [],
      },
    });
  }

  console.log(`Seeded ${countries.length} countries.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
