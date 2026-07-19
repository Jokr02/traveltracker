import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/session";
import { TRANSPORT_LABELS } from "@/lib/transport";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return new Response(null, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get("format") === "csv" ? "csv" : "json";

  const { db } = await getDb();
  const countries = await db.country.findMany({
    include: {
      visits: {
        include: { trip: true, photos: true },
        orderBy: { startDate: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  if (format === "json") {
    const payload = countries
      .filter((c) => c.visits.length > 0 || c.planningStatus !== "NONE")
      .map((c) => ({
        land: c.name,
        kontinent: c.continent,
        iso3: c.cca3,
        planungsstatus: c.planningStatus,
        besuche: c.visits.map((v) => ({
          von: v.startDate.toISOString().slice(0, 10),
          bis: v.endDate ? v.endDate.toISOString().slice(0, 10) : null,
          bewertung: v.rating,
          notizen: v.notes,
          transportmittel: v.transportModes.map((m) => TRANSPORT_LABELS[m]),
          reise: v.trip?.name ?? null,
          fotos: v.photos.map((p) => p.pathname),
        })),
      }));

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="travel-tracker-export.json"',
      },
    });
  }

  const rows = [
    ["Land", "Kontinent", "Von", "Bis", "Bewertung", "Notizen", "Transportmittel", "Reise"],
  ];
  for (const c of countries) {
    for (const v of c.visits) {
      rows.push([
        c.name,
        c.continent,
        v.startDate.toISOString().slice(0, 10),
        v.endDate ? v.endDate.toISOString().slice(0, 10) : "",
        v.rating ? String(v.rating) : "",
        v.notes ?? "",
        v.transportModes.map((m) => TRANSPORT_LABELS[m]).join("; "),
        v.trip?.name ?? "",
      ]);
    }
  }
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");

  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="travel-tracker-export.csv"',
    },
  });
}
