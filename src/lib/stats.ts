import "server-only";
import { prisma } from "@/lib/prisma";

const POPULATED_CONTINENTS = ["Afrika", "Amerika", "Asien", "Europa", "Ozeanien"];
const NORDIC_CCA3 = ["DNK", "SWE", "NOR", "FIN", "ISL"];

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getStats() {
  const countries = await prisma.country.findMany({
    include: { visits: { orderBy: { startDate: "asc" } } },
  });

  const visitedCountries = countries.filter((c) => c.visits.length > 0);
  const totalCountries = countries.length;
  const visitedCount = visitedCountries.length;

  const totalArea = countries.reduce((sum, c) => sum + (c.areaKm2 ?? 0), 0);
  const visitedArea = visitedCountries.reduce(
    (sum, c) => sum + (c.areaKm2 ?? 0),
    0,
  );
  const areaCoveragePct = totalArea > 0 ? (visitedArea / totalArea) * 100 : 0;

  const continentMap = new Map<string, { total: number; visited: number }>();
  for (const c of countries) {
    const entry = continentMap.get(c.continent) ?? { total: 0, visited: 0 };
    entry.total += 1;
    if (c.visits.length > 0) entry.visited += 1;
    continentMap.set(c.continent, entry);
  }
  const continentBreakdown = [...continentMap.entries()]
    .map(([continent, { total, visited }]) => ({
      continent,
      total,
      visited,
      pct: total > 0 ? (visited / total) * 100 : 0,
    }))
    .sort((a, b) => b.visited - a.visited);

  const timeline = visitedCountries
    .flatMap((c) =>
      c.visits.map((v) => ({
        visitId: v.id,
        countryId: c.id,
        countryName: c.name,
        continent: c.continent,
        flagEmoji: c.flagEmoji,
        startDate: v.startDate,
        endDate: v.endDate,
        rating: v.rating,
        notes: v.notes,
      })),
    )
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const yearMap = new Map<number, number>();
  for (const c of visitedCountries) {
    const earliest = c.visits.reduce(
      (min, v) => (v.startDate < min ? v.startDate : min),
      c.visits[0].startDate,
    );
    const year = earliest.getFullYear();
    yearMap.set(year, (yearMap.get(year) ?? 0) + 1);
  }
  const yearlyNewCountries = [...yearMap.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);

  let totalKm = 0;
  for (let i = 1; i < timeline.length; i++) {
    const prev = countries.find((c) => c.id === timeline[i - 1].countryId)!;
    const curr = countries.find((c) => c.id === timeline[i].countryId)!;
    totalKm += haversineKm(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude,
    );
  }

  const continentsVisitedByYear = new Map<number, Set<string>>();
  for (const c of visitedCountries) {
    for (const v of c.visits) {
      const year = v.startDate.getFullYear();
      const set = continentsVisitedByYear.get(year) ?? new Set<string>();
      set.add(c.continent);
      continentsVisitedByYear.set(year, set);
    }
  }
  const maxContinentsInOneYear = Math.max(
    0,
    ...[...continentsVisitedByYear.values()].map((s) => s.size),
  );

  const visitedContinents = new Set(visitedCountries.map((c) => c.continent));
  const visitedCca3 = new Set(visitedCountries.map((c) => c.cca3));
  const hasNonEuropeVisit = visitedCountries.some(
    (c) => c.continent !== "Europa",
  );
  const hasAllNordics = NORDIC_CCA3.every((code) => visitedCca3.has(code));
  const hasAllPopulatedContinents = POPULATED_CONTINENTS.every((cont) =>
    visitedContinents.has(cont),
  );

  const achievements = [
    {
      id: "first_trip",
      label: "Erste Reise",
      description: "Den ersten Besuch eingetragen.",
      unlocked: visitedCount >= 1,
    },
    {
      id: "beyond_europe",
      label: "Erstes Land außerhalb Europas",
      description: "Einen Kontinent jenseits von Europa bereist.",
      unlocked: hasNonEuropeVisit,
    },
    {
      id: "nordics",
      label: "Alle nordischen Länder",
      description: "Dänemark, Schweden, Norwegen, Finnland und Island besucht.",
      unlocked: hasAllNordics,
    },
    {
      id: "three_continents_one_year",
      label: "3 Kontinente in einem Jahr",
      description: "In einem Kalenderjahr Länder auf 3 Kontinenten besucht.",
      unlocked: maxContinentsInOneYear >= 3,
    },
    {
      id: "ten_countries",
      label: "10 Länder",
      description: "10 Länder besucht.",
      unlocked: visitedCount >= 10,
    },
    {
      id: "twentyfive_countries",
      label: "25 Länder",
      description: "25 Länder besucht.",
      unlocked: visitedCount >= 25,
    },
    {
      id: "fifty_countries",
      label: "50 Länder",
      description: "50 Länder besucht.",
      unlocked: visitedCount >= 50,
    },
    {
      id: "all_continents",
      label: "Alle bewohnten Kontinente",
      description: "Mindestens ein Land auf jedem bewohnten Kontinent besucht.",
      unlocked: hasAllPopulatedContinents,
    },
  ];

  return {
    totalCountries,
    visitedCount,
    areaCoveragePct,
    continentBreakdown,
    timeline,
    yearlyNewCountries,
    totalKm: Math.round(totalKm),
    achievements,
  };
}
