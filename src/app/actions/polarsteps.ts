"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import {
  importPolarstepsTrip,
  type PolarstepsLocationsFile,
  type PolarstepsTrip,
} from "@/lib/polarsteps";

export type PolarstepsImportState =
  | { error: string }
  | { success: string }
  | undefined;

function revalidateAll() {
  revalidatePath("/trips");
  revalidatePath("/countries");
  revalidatePath("/stats");
  revalidatePath("/");
}

export async function importTripFromPolarsteps(
  _prevState: PolarstepsImportState,
  formData: FormData,
): Promise<PolarstepsImportState> {
  await requireAuth();

  const tripFile = formData.get("tripFile");
  if (!(tripFile instanceof File) || tripFile.size === 0) {
    return { error: "Bitte eine trip.json-Datei auswählen." };
  }

  let trip: PolarstepsTrip;
  try {
    trip = JSON.parse(await tripFile.text());
  } catch {
    return { error: "trip.json konnte nicht gelesen werden (ungültiges JSON)." };
  }
  if (!trip?.uuid || !Array.isArray(trip.all_steps)) {
    return {
      error: "Das sieht nicht nach einer Polarsteps trip.json aus (uuid/all_steps fehlen).",
    };
  }

  let locations: PolarstepsLocationsFile | null = null;
  const locationsFile = formData.get("locationsFile");
  if (locationsFile instanceof File && locationsFile.size > 0) {
    try {
      locations = JSON.parse(await locationsFile.text());
    } catch {
      return {
        error: "locations.json konnte nicht gelesen werden (ungültiges JSON).",
      };
    }
  }

  const result = await importPolarstepsTrip(trip, locations);
  revalidateAll();

  switch (result.status) {
    case "already_imported":
      return { success: `„${result.tripName}“ war bereits importiert.` };
    case "route_updated":
      return {
        success: `„${result.tripName}“ war bereits importiert — Routendaten wurden ergänzt.`,
      };
    case "no_location_data":
      return {
        error: "Keine Steps mit Standortdaten in der trip.json gefunden.",
      };
    case "imported": {
      const skipNote =
        result.countriesSkipped.length > 0
          ? ` (${result.countriesSkipped.length} Land/Länder nicht zugeordnet: ${result.countriesSkipped.join(", ")})`
          : "";
      return {
        success: `„${result.tripName}“ importiert: ${result.visitsCreated} Besuch(e).${skipNote}`,
      };
    }
  }
}
