/**
 * Importiert eine Polarsteps-Reise (offizieller Datenexport) als Trip +
 * Visits in die Travel-Tracker-DB.
 *
 * Usage: npx tsx scripts/import-polarsteps.ts [Ordner mit trip.json]
 *        (Standardordner: files_polarsteps)
 *
 * Woher die Daten kommen: polarsteps.com → Account Settings → "Download my data".
 * Die eigentliche Import-Logik liegt in src/lib/polarsteps.ts (auch von der
 * Server Action für den Web-Upload genutzt).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import {
  importPolarstepsTrip,
  type PolarstepsLocationsFile,
  type PolarstepsTrip,
} from "../src/lib/polarsteps";
import { prisma } from "../src/lib/prisma";

async function main() {
  const folder = process.argv[2] ?? "files_polarsteps";
  const tripPath = path.join(folder, "trip.json");
  const locationsPath = path.join(folder, "locations.json");

  if (!fs.existsSync(tripPath)) {
    console.error(`✖ trip.json nicht gefunden unter: ${tripPath}`);
    process.exit(1);
  }

  const trip: PolarstepsTrip = JSON.parse(fs.readFileSync(tripPath, "utf-8"));
  const locationsFile: PolarstepsLocationsFile | null = fs.existsSync(
    locationsPath,
  )
    ? JSON.parse(fs.readFileSync(locationsPath, "utf-8"))
    : null;

  if (!locationsFile) {
    console.warn(
      "⚠ locations.json nicht gefunden — die Karte zeigt für diese Reise nur eine gerade Linie statt der echten Route.",
    );
  }

  const result = await importPolarstepsTrip(trip, locationsFile);

  switch (result.status) {
    case "already_imported":
      console.log(
        `Reise "${result.tripName}" wurde bereits importiert (Trip-ID ${result.tripId}). Übersprungen.`,
      );
      break;
    case "updated":
      console.log(
        `Reise "${result.tripName}" war schon importiert — fehlende Route/Distanz wurden ergänzt (Trip-ID ${result.tripId}).`,
      );
      break;
    case "no_location_data":
      console.error("✖ Keine Steps mit Standortdaten in trip.json gefunden.");
      break;
    case "imported":
      console.log(`✔ Reise angelegt: "${result.tripName}" (${result.tripId})`);
      console.log(`  ${result.visitsCreated} Besuch(e) angelegt.`);
      if (result.countriesSkipped.length > 0) {
        console.log(
          `  ⚠ Nicht zugeordnete Ländercodes: ${result.countriesSkipped.join(", ")}`,
        );
      }
      break;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
