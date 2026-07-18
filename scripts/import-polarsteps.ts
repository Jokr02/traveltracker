/**
 * Importiert eine Polarsteps-Reise (offizieller Datenexport, "trip.json") als
 * Trip + Visits in die Travel-Tracker-DB.
 *
 * Usage: npx tsx scripts/import-polarsteps.ts [Ordner mit trip.json]
 *        (Standardordner: files_polarsteps)
 *
 * Woher die Daten kommen: polarsteps.com → Account Settings → "Download my data".
 *
 * Wie gruppiert wird: aufeinanderfolgende Steps mit demselben Land ergeben
 * einen Visit. Steps mit country_code "00" (internationale Gewässer, z.B.
 * während einer Fährüberfahrt) bilden keinen eigenen Visit, markieren aber
 * die Länder davor/danach als Fährstrecke.
 *
 * Transportmittel: Polarsteps liefert in diesem Export kein Feld pro Step.
 * Da es sich laut Nutzer um Roadtrips handelt, wird CAR als Basis angenommen,
 * plus FERRY für Länder mit einer erkannten Fährüberfahrt davor/danach.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import type { TransportMode } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type PolarstepsLocation = {
  country_code: string | null;
};

type PolarstepsStep = {
  name: string | null;
  description: string | null;
  start_time: number;
  end_time: number | null;
  location: PolarstepsLocation | null;
};

type PolarstepsTrip = {
  uuid: string;
  name: string;
  summary: string | null;
  all_steps: PolarstepsStep[];
};

type CountryGroup = {
  countryCode: string;
  steps: PolarstepsStep[];
  ferry: boolean;
};

function unixToDate(seconds: number) {
  return new Date(seconds * 1000);
}

function groupStepsByCountry(steps: PolarstepsStep[]): CountryGroup[] {
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
      groups.push({
        countryCode: code,
        steps: [step],
        ferry: pendingFerry,
      });
    }
    pendingFerry = false;
  }

  return groups;
}

function buildNotes(steps: PolarstepsStep[]): string | null {
  const labels = steps
    .map((s) => s.name?.trim() || s.description?.trim() || "")
    .filter((v, i, arr) => v.length > 0 && arr.indexOf(v) === i);

  if (labels.length === 0) return null;
  const joined = `Importiert aus Polarsteps: ${labels.join(" · ")}`;
  return joined.length > 1900 ? `${joined.slice(0, 1897)}…` : joined;
}

async function main() {
  const folder = process.argv[2] ?? "files_polarsteps";
  const tripPath = path.join(folder, "trip.json");

  if (!fs.existsSync(tripPath)) {
    console.error(`✖ trip.json nicht gefunden unter: ${tripPath}`);
    process.exit(1);
  }

  const trip: PolarstepsTrip = JSON.parse(fs.readFileSync(tripPath, "utf-8"));

  const existingTrip = await prisma.trip.findUnique({
    where: { externalId: trip.uuid },
  });
  if (existingTrip) {
    console.log(
      `Reise "${trip.name}" wurde bereits importiert (Trip-ID ${existingTrip.id}). Übersprungen.`,
    );
    return;
  }

  const groups = groupStepsByCountry(trip.all_steps ?? []);
  if (groups.length === 0) {
    console.error("✖ Keine Steps mit Standortdaten in trip.json gefunden.");
    return;
  }

  const createdTrip = await prisma.trip.create({
    data: {
      name: trip.name,
      notes: trip.summary || null,
      externalId: trip.uuid,
    },
  });

  console.log(`✔ Reise angelegt: "${createdTrip.name}" (${createdTrip.id})`);

  let created = 0;
  let skipped = 0;

  for (const group of groups) {
    const country = await prisma.country.findUnique({
      where: { cca2: group.countryCode },
    });

    if (!country) {
      console.warn(
        `  ⚠ Kein Land mit ISO-Code "${group.countryCode}" gefunden — ${group.steps.length} Step(s) übersprungen.`,
      );
      skipped += 1;
      continue;
    }

    const times = group.steps.map((s) => s.start_time);
    const startDate = unixToDate(Math.min(...times));
    const endDate = unixToDate(Math.max(...times));
    const transportModes: TransportMode[] = group.ferry ? ["CAR", "FERRY"] : ["CAR"];

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

    console.log(
      `  ✔ ${country.name}: ${startDate.toLocaleDateString("de-DE")} – ${endDate.toLocaleDateString("de-DE")}` +
        (group.ferry ? " (inkl. Fähre)" : "") +
        ` · ${group.steps.length} Step(s)`,
    );
    created += 1;
  }

  console.log(
    `\nFertig: ${created} Besuch(e) angelegt, ${skipped} Land/Länder übersprungen (kein Match).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
