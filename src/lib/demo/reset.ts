import type { PrismaClient, TransportMode } from "@/generated/prisma/client";

// Feste Daten (nicht relativ zu "heute") für deterministische Demo-Fixtures.
const FIXTURE_VISITS: Record<
  string,
  {
    startDate: string;
    endDate?: string;
    rating?: number;
    notes?: string;
    transportModes: string[];
  }
> = {
  DNK: {
    startDate: "2022-06-02",
    endDate: "2022-06-05",
    rating: 4,
    notes: "Kopenhagen mit dem Fahrrad erkundet.",
    transportModes: ["TRAIN"],
  },
  SWE: {
    startDate: "2022-06-05",
    endDate: "2022-06-09",
    rating: 5,
    notes: "Stockholms Altstadt und Schären-Tour.",
    transportModes: ["FERRY", "TRAIN"],
  },
  NOR: {
    startDate: "2022-06-09",
    endDate: "2022-06-13",
    rating: 5,
    notes: "Fjorde mit dem Mietwagen.",
    transportModes: ["CAR"],
  },
  FIN: {
    startDate: "2022-06-13",
    endDate: "2022-06-16",
    rating: 4,
    transportModes: ["FERRY"],
  },
  ISL: {
    startDate: "2022-06-16",
    endDate: "2022-06-20",
    rating: 5,
    notes: "Ringstraße einmal komplett.",
    transportModes: ["CAR", "PLANE"],
  },
  FRA: {
    startDate: "2023-04-10",
    endDate: "2023-04-13",
    rating: 4,
    notes: "Wochenende in Paris.",
    transportModes: ["PLANE"],
  },
  ITA: {
    startDate: "2023-04-13",
    endDate: "2023-04-16",
    rating: 5,
    transportModes: ["TRAIN"],
  },
  ESP: {
    startDate: "2023-04-16",
    endDate: "2023-04-19",
    rating: 4,
    notes: "Barcelona, viel Tapas.",
    transportModes: ["TRAIN"],
  },
  THA: {
    startDate: "2021-11-01",
    endDate: "2021-11-10",
    rating: 5,
    notes: "Bangkok und die Inseln im Süden.",
    transportModes: ["PLANE", "BUS"],
  },
  VNM: {
    startDate: "2021-11-10",
    endDate: "2021-11-18",
    rating: 4,
    transportModes: ["BUS", "TRAIN"],
  },
  PRT: {
    startDate: "2024-02-16",
    endDate: "2024-02-18",
    rating: 4,
    notes: "Kurztrip nach Lissabon.",
    transportModes: ["PLANE"],
  },
  JPN: {
    startDate: "2023-10-05",
    endDate: "2023-10-15",
    rating: 5,
    notes: "Tokio und Kyoto.",
    transportModes: ["PLANE", "TRAIN"],
  },
  USA: {
    startDate: "2019-08-01",
    endDate: "2019-08-12",
    rating: 4,
    notes: "Roadtrip an der Westküste.",
    transportModes: ["PLANE", "CAR"],
  },
};

const FIXTURE_TRIPS: { name: string; notes?: string; countries: string[] }[] = [
  {
    name: "Skandinavien-Rundreise",
    notes: "Von Kopenhagen bis nach Island.",
    countries: ["DNK", "SWE", "NOR", "FIN", "ISL"],
  },
  {
    name: "Städtetrip Südeuropa",
    countries: ["FRA", "ITA", "ESP"],
  },
  {
    name: "Südostasien-Backpacking",
    countries: ["THA", "VNM"],
  },
];

// Visits ohne zugehörige Reise.
const STANDALONE_VISIT_COUNTRIES = ["PRT", "JPN", "USA"];

const WISHLIST_CCA3 = ["NZL", "ARG"];
const PLANNED_CCA3 = ["KOR", "CAN"];

const HOME_COUNTRY_CCA3 = "DEU";

async function createFixtureData(db: PrismaClient) {
  const allCca3 = [
    ...FIXTURE_TRIPS.flatMap((t) => t.countries),
    ...STANDALONE_VISIT_COUNTRIES,
    ...WISHLIST_CCA3,
    ...PLANNED_CCA3,
    HOME_COUNTRY_CCA3,
  ];
  const countries = await db.country.findMany({
    where: { cca3: { in: allCca3 } },
    select: { id: true, cca3: true },
  });
  const idByCca3 = new Map(countries.map((c) => [c.cca3, c.id]));

  for (const trip of FIXTURE_TRIPS) {
    const visitsData = trip.countries
      .map((cca3) => {
        const countryId = idByCca3.get(cca3);
        const fixture = FIXTURE_VISITS[cca3];
        if (!countryId || !fixture) return null;
        return {
          countryId,
          startDate: new Date(fixture.startDate),
          endDate: fixture.endDate ? new Date(fixture.endDate) : null,
          notes: fixture.notes ?? null,
          rating: fixture.rating ?? null,
          transportModes: fixture.transportModes as TransportMode[],
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    if (visitsData.length === 0) continue;

    await db.trip.create({
      data: {
        name: trip.name,
        notes: trip.notes ?? null,
        visits: { create: visitsData },
      },
    });
  }

  for (const cca3 of STANDALONE_VISIT_COUNTRIES) {
    const countryId = idByCca3.get(cca3);
    const fixture = FIXTURE_VISITS[cca3];
    if (!countryId || !fixture) continue;

    await db.visit.create({
      data: {
        countryId,
        startDate: new Date(fixture.startDate),
        endDate: fixture.endDate ? new Date(fixture.endDate) : null,
        notes: fixture.notes ?? null,
        rating: fixture.rating ?? null,
        transportModes: fixture.transportModes as TransportMode[],
      },
    });
  }

  for (const cca3 of WISHLIST_CCA3) {
    const countryId = idByCca3.get(cca3);
    if (!countryId) continue;
    await db.country.update({
      where: { id: countryId },
      data: { planningStatus: "WISHLIST" },
    });
  }
  for (const cca3 of PLANNED_CCA3) {
    const countryId = idByCca3.get(cca3);
    if (!countryId) continue;
    await db.country.update({
      where: { id: countryId },
      data: { planningStatus: "PLANNED" },
    });
  }

  const homeCountryId = idByCca3.get(HOME_COUNTRY_CCA3) ?? null;
  await db.setting.upsert({
    where: { id: "singleton" },
    update: { homeCountryId },
    create: { id: "singleton", homeCountryId },
  });
}

/** Setzt die Demo-DB auf den Fixture-Baseline-Zustand zurück: löscht alle
 * Trips/Visits/Fotos (und deren Blobs) sowie Planungsstatus-Änderungen,
 * erstellt danach die Beispieldaten neu. Rührt die Country-Referenztabelle
 * selbst nicht an (bleibt stabil zwischen Resets). */
export async function resetDemoData(db: PrismaClient): Promise<void> {
  const orphanPhotos = await db.visitPhoto.findMany({
    select: { pathname: true },
  });

  await db.visit.deleteMany();
  await db.trip.deleteMany();
  await db.country.updateMany({ data: { planningStatus: "NONE" } });

  if (orphanPhotos.length > 0) {
    const { del } = await import("@vercel/blob");
    await del(orphanPhotos.map((p) => p.pathname)).catch(() => {});
  }

  await createFixtureData(db);
}
