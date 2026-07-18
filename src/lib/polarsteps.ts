// Kein `import "server-only"` hier (anders als die übrigen src/lib-Module):
// dieses Modul läuft auch außerhalb von Next.js über das CLI-Skript
// (scripts/import-polarsteps.ts) via tsx, wo das Next-interne Bundler-Aliasing
// für server-only nicht greift.
import { prisma } from "@/lib/prisma";
import type { TransportMode } from "@/generated/prisma/client";

/**
 * Import einer Polarsteps-Reise (offizieller Datenexport: trip.json +
 * optional locations.json) als Trip + Visits. Wird sowohl vom CLI-Skript
 * (scripts/import-polarsteps.ts) als auch von der Server Action für den
 * Web-Upload (src/app/actions/polarsteps.ts) genutzt.
 *
 * Wie gruppiert wird: aufeinanderfolgende Steps mit demselben Land ergeben
 * einen Visit. Steps mit country_code "00" (internationale Gewässer, z.B.
 * während einer Fährüberfahrt) bilden keinen eigenen Visit, markieren aber
 * die Länder davor/danach als Fährstrecke.
 *
 * Transportmittel: Polarsteps liefert in diesem Export kein Feld pro Step.
 * Da es sich laut Nutzer um Roadtrips handelt, wird CAR als Basis
 * angenommen, plus FERRY für Länder mit einer erkannten Fährüberfahrt.
 */

export type PolarstepsLocation = {
  country_code: string | null;
};

export type PolarstepsStep = {
  name: string | null;
  description: string | null;
  start_time: number;
  end_time: number | null;
  location: PolarstepsLocation | null;
};

export type PolarstepsTrip = {
  uuid: string;
  name: string;
  summary: string | null;
  /** Von Polarsteps berechnete tatsächliche Reisedistanz (gefahren/geflogen), nicht Luftlinie. */
  total_km: number | null;
  all_steps: PolarstepsStep[];
};

export type PolarstepsRoutePoint = {
  lat: number;
  lon: number;
  time: number;
};

export type PolarstepsLocationsFile = {
  locations: PolarstepsRoutePoint[];
};

type CountryGroup = {
  countryCode: string;
  steps: PolarstepsStep[];
  ferry: boolean;
};

function unixToDate(seconds: number) {
  return new Date(seconds * 1000);
}

export function groupStepsByCountry(steps: PolarstepsStep[]): CountryGroup[] {
  const sorted = [...steps]
    .filter((s) => s.location?.country_code)
    .sort((a, b) => a.start_time - b.start_time);

  const groups: CountryGroup[] = [];
  let pendingFerry = false;

  for (const step of sorted) {
    const code = step.location!.country_code!.toUpperCase();

    if (code === "00") {
      if (groups.length > 0) groups[groups.length - 1].ferry = true;
      pendingFerry = true;
      continue;
    }

    const last = groups[groups.length - 1];
    if (last && last.countryCode === code) {
      last.steps.push(step);
    } else {
      groups.push({ countryCode: code, steps: [step], ferry: pendingFerry });
    }
    pendingFerry = false;
  }

  return groups;
}

export function buildNotes(steps: PolarstepsStep[]): string | null {
  const labels = steps
    .map((s) => s.name?.trim() || s.description?.trim() || "")
    .filter((v, i, arr) => v.length > 0 && arr.indexOf(v) === i);

  if (labels.length === 0) return null;
  const joined = `Importiert aus Polarsteps: ${labels.join(" · ")}`;
  return joined.length > 1900 ? `${joined.slice(0, 1897)}…` : joined;
}

const MAX_ROUTE_POINTS = 3000;

/** Reduziert die (potenziell sehr dichte) GPS-Spur auf eine Kartendarstellung-taugliche Punktzahl. */
export function extractRoute(
  locationsFile: PolarstepsLocationsFile | null | undefined,
): [number, number][] | null {
  const points = locationsFile?.locations;
  if (!points || points.length < 2) return null;

  const sorted = [...points].sort((a, b) => a.time - b.time);
  const stride = Math.max(1, Math.ceil(sorted.length / MAX_ROUTE_POINTS));

  const result: [number, number][] = [];
  for (let i = 0; i < sorted.length; i += stride) {
    result.push([sorted[i].lon, sorted[i].lat]);
  }
  const last = sorted[sorted.length - 1];
  const lastPoint: [number, number] = [last.lon, last.lat];
  const tail = result[result.length - 1];
  if (!tail || tail[0] !== lastPoint[0] || tail[1] !== lastPoint[1]) {
    result.push(lastPoint);
  }
  return result;
}

export type PolarstepsImportResult =
  | { status: "already_imported"; tripId: string; tripName: string }
  | { status: "updated"; tripId: string; tripName: string }
  | { status: "no_location_data" }
  | {
      status: "imported";
      tripId: string;
      tripName: string;
      visitsCreated: number;
      countriesSkipped: string[];
    };

export async function importPolarstepsTrip(
  trip: PolarstepsTrip,
  locationsFile: PolarstepsLocationsFile | null | undefined,
): Promise<PolarstepsImportResult> {
  const route = extractRoute(locationsFile);
  const hasDistance = typeof trip.total_km === "number" && !Number.isNaN(trip.total_km);

  const existingTrip = await prisma.trip.findUnique({
    where: { externalId: trip.uuid },
  });

  if (existingTrip) {
    const updateData: { route?: [number, number][]; distanceKm?: number } = {};
    if (route && !existingTrip.route) updateData.route = route;
    if (hasDistance && existingTrip.distanceKm == null) {
      updateData.distanceKm = trip.total_km as number;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.trip.update({
        where: { id: existingTrip.id },
        data: updateData,
      });
      return {
        status: "updated",
        tripId: existingTrip.id,
        tripName: existingTrip.name,
      };
    }
    return {
      status: "already_imported",
      tripId: existingTrip.id,
      tripName: existingTrip.name,
    };
  }

  const groups = groupStepsByCountry(trip.all_steps ?? []);
  if (groups.length === 0) {
    return { status: "no_location_data" };
  }

  const createdTrip = await prisma.trip.create({
    data: {
      name: trip.name,
      notes: trip.summary || null,
      externalId: trip.uuid,
      route: route ?? undefined,
      distanceKm: hasDistance ? (trip.total_km as number) : undefined,
    },
  });

  let created = 0;
  const skipped: string[] = [];

  for (const group of groups) {
    const country = await prisma.country.findUnique({
      where: { cca2: group.countryCode },
    });

    if (!country) {
      skipped.push(group.countryCode);
      continue;
    }

    const times = group.steps.map((s) => s.start_time);
    const startDate = unixToDate(Math.min(...times));
    const endDate = unixToDate(Math.max(...times));
    const transportModes: TransportMode[] = group.ferry
      ? ["CAR", "FERRY"]
      : ["CAR"];

    await prisma.visit.create({
      data: {
        countryId: country.id,
        tripId: createdTrip.id,
        startDate,
        endDate: endDate.getTime() !== startDate.getTime() ? endDate : null,
        notes: buildNotes(group.steps),
        transportModes,
      },
    });
    created += 1;
  }

  return {
    status: "imported",
    tripId: createdTrip.id,
    tripName: createdTrip.name,
    visitsCreated: created,
    countriesSkipped: skipped,
  };
}
