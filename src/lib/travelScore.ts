import "server-only";
import { prisma } from "@/lib/prisma";
import { haversineKm } from "@/lib/geo";
import { getSettings } from "@/lib/settings";

// Punkteformel (bewusst simpel & transparent gehalten):
// Basis: 10 Punkte pro besuchtem Land.
// Seltenheits-Bonus (0-50): kleinere Landfläche = höherer Bonus (Rang unter allen Ländern nach Fläche).
// Distanz-Bonus (0-50): 1 Punkt pro 200km Luftlinie vom Heimatland, gedeckelt.
const BASE_POINTS = 10;
const MAX_RARITY_BONUS = 50;
const MAX_DISTANCE_BONUS = 50;
const KM_PER_DISTANCE_POINT = 200;

export async function getTravelScore() {
  // Sequenziell statt Promise.all: gleichzeitige Prisma-Queries über den
  // pg-Adapter haben sich lokal als Race Condition erwiesen (siehe README).
  const countries = await prisma.country.findMany({
    include: { _count: { select: { visits: true } } },
  });
  const settings = await getSettings();

  const sortedByArea = [...countries]
    .filter((c) => c.areaKm2 != null)
    .sort((a, b) => (a.areaKm2 ?? 0) - (b.areaKm2 ?? 0));
  const rankByCca3 = new Map<string, number>();
  sortedByArea.forEach((c, idx) => rankByCca3.set(c.cca3, idx));
  const totalRanked = sortedByArea.length;

  const home = settings.homeCountry;
  const visited = countries.filter((c) => c._count.visits > 0);

  const breakdown = visited.map((c) => {
    const rank = rankByCca3.get(c.cca3);
    const rarityBonus =
      rank !== undefined && totalRanked > 1
        ? Math.round(MAX_RARITY_BONUS * (1 - rank / (totalRanked - 1)))
        : 0;
    const distanceKm = home
      ? haversineKm(home.latitude, home.longitude, c.latitude, c.longitude)
      : 0;
    const distanceBonus = home
      ? Math.min(MAX_DISTANCE_BONUS, Math.round(distanceKm / KM_PER_DISTANCE_POINT))
      : 0;

    return {
      countryId: c.id,
      name: c.name,
      flagEmoji: c.flagEmoji,
      rarityBonus,
      distanceBonus,
      distanceKm: Math.round(distanceKm),
      points: BASE_POINTS + rarityBonus + distanceBonus,
    };
  });

  const totalScore = breakdown.reduce((sum, b) => sum + b.points, 0);
  const rarest = [...breakdown]
    .sort((a, b) => b.rarityBonus - a.rarityBonus)
    .slice(0, 5);

  return {
    totalScore,
    hasHomeCountry: Boolean(home),
    homeCountryName: home?.name ?? null,
    breakdown: [...breakdown].sort((a, b) => b.points - a.points),
    rarest,
  };
}
