import "server-only";
import { getDb } from "@/lib/db";
import type { Country } from "@/generated/prisma/client";

export type CountryStatus = "visited" | "planned" | "wishlist" | "unvisited";

export function getCountryStatus(country: {
  planningStatus: string;
  visitCount: number;
}): CountryStatus {
  if (country.visitCount > 0) return "visited";
  if (country.planningStatus === "PLANNED") return "planned";
  if (country.planningStatus === "WISHLIST") return "wishlist";
  return "unvisited";
}

export type CountryListItem = Country & {
  visitCount: number;
  status: CountryStatus;
};

export async function getAllCountriesWithStatus(): Promise<
  CountryListItem[]
> {
  const { db } = await getDb();
  const countries = await db.country.findMany({
    include: { _count: { select: { visits: true } } },
    orderBy: { name: "asc" },
  });

  return countries.map((c) => {
    const visitCount = c._count.visits;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _count, ...rest } = c;
    return {
      ...rest,
      visitCount,
      status: getCountryStatus({ planningStatus: c.planningStatus, visitCount }),
    };
  });
}

export async function getCountryById(id: string) {
  const { db } = await getDb();
  const country = await db.country.findUnique({
    where: { id },
    include: {
      visits: {
        orderBy: { startDate: "desc" },
        include: { trip: true, photos: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!country) return null;

  const status = getCountryStatus({
    planningStatus: country.planningStatus,
    visitCount: country.visits.length,
  });

  const neighborCountries = country.borders.length
    ? await db.country.findMany({
        where: { cca3: { in: country.borders } },
        include: { _count: { select: { visits: true } } },
      })
    : [];

  const neighbors = neighborCountries
    .map((n) => ({
      id: n.id,
      name: n.name,
      cca3: n.cca3,
      flagEmoji: n.flagEmoji,
      status: getCountryStatus({
        planningStatus: n.planningStatus,
        visitCount: n._count.visits,
      }),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { ...country, status, neighbors };
}

export type CountryDetail = NonNullable<
  Awaited<ReturnType<typeof getCountryById>>
>;
