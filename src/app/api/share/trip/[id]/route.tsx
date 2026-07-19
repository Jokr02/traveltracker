import { ImageResponse } from "next/og";
import { isAuthenticated } from "@/lib/session";
import { getDb } from "@/lib/db";
import { getShareFonts } from "@/lib/og-fonts";
import { haversineKm } from "@/lib/geo";
import { TRANSPORT_LABELS } from "@/lib/transport";
import type { TransportMode } from "@/generated/prisma/client";

const WIDTH = 1080;
const HEIGHT = 1920;

const COLORS = {
  bg: "#0a0a0a",
  border: "#27272a",
  primary: "#ffffff",
  secondary: "#a1a1aa",
  muted: "#52525b",
  accent: "#5eead4",
};

const TRANSPORT_EMOJI: Record<TransportMode, string> = {
  PLANE: "✈️",
  CAR: "🚗",
  TRAIN: "🚂",
  BUS: "🚌",
  FERRY: "⛴️",
  OTHER: "📍",
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return new Response(null, { status: 401 });
  }

  const { id } = await params;

  const { db } = await getDb();
  const trip = await db.trip.findUnique({
    where: { id },
    include: {
      visits: { include: { country: true }, orderBy: { startDate: "asc" } },
    },
  });

  if (!trip) {
    return new Response("Not found", { status: 404 });
  }

  const fonts = await getShareFonts();

  const dates = trip.visits.flatMap((v) => [v.startDate, v.endDate ?? v.startDate]);
  const start = dates.length
    ? new Date(Math.min(...dates.map((d) => d.getTime())))
    : null;
  const end = dates.length
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : null;
  const days =
    start && end
      ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1)
      : null;

  let distanceKm = trip.distanceKm;
  let distanceIsReal = distanceKm != null;
  if (distanceKm == null) {
    let total = 0;
    for (let i = 1; i < trip.visits.length; i++) {
      const a = trip.visits[i - 1].country;
      const b = trip.visits[i].country;
      total += haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
    }
    distanceKm = total;
    distanceIsReal = false;
  }

  const uniqueCountries = [
    ...new Map(trip.visits.map((v) => [v.country.id, v.country])).values(),
  ];
  const transportModes = [
    ...new Set(trip.visits.flatMap((v) => v.transportModes)),
  ] as TransportMode[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.bg,
          padding: "76px 64px",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#134e4a",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            🧳
          </div>
          <div style={{ display: "flex", fontSize: 36, color: COLORS.primary, fontWeight: 600 }}>
            Travel Tracker
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 76,
                fontWeight: 700,
                color: COLORS.primary,
                lineHeight: 1.1,
              }}
            >
              {trip.name}
            </div>
            {start && end && (
              <div style={{ display: "flex", fontSize: 30, color: COLORS.secondary, marginTop: 16 }}>
                {dateFormatter.format(start)}
                {end.getTime() !== start.getTime() && ` – ${dateFormatter.format(end)}`}
                {days ? ` · ${days} ${days === 1 ? "Tag" : "Tage"}` : ""}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 18,
              marginTop: 56,
              paddingTop: 44,
              borderTop: `2px solid ${COLORS.border}`,
            }}
          >
            <div style={{ display: "flex", fontSize: 88, fontWeight: 700, color: COLORS.primary }}>
              {Math.round(distanceKm).toLocaleString("de-DE")}
            </div>
            <div style={{ display: "flex", fontSize: 34, color: COLORS.accent, fontWeight: 600 }}>
              km {distanceIsReal ? "zurückgelegt" : "(geschätzt)"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 56, gap: 20 }}>
            <div style={{ display: "flex", fontSize: 26, color: COLORS.secondary, fontWeight: 600 }}>
              {uniqueCountries.length} {uniqueCountries.length === 1 ? "Land" : "Länder"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {uniqueCountries.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "#151517",
                    border: `2px solid ${COLORS.border}`,
                    borderRadius: 999,
                    padding: "12px 22px",
                  }}
                >
                  <div style={{ display: "flex", fontSize: 34 }}>{c.flagEmoji ?? "🏳️"}</div>
                  <div style={{ display: "flex", fontSize: 26, color: COLORS.primary }}>
                    {c.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {transportModes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 44, gap: 20 }}>
              <div style={{ display: "flex", fontSize: 26, color: COLORS.secondary, fontWeight: 600 }}>
                Unterwegs mit
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                {transportModes.map((mode) => (
                  <div
                    key={mode}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      backgroundColor: "#151517",
                      border: `2px solid ${COLORS.border}`,
                      borderRadius: 999,
                      padding: "12px 22px",
                    }}
                  >
                    <div style={{ display: "flex", fontSize: 30 }}>{TRANSPORT_EMOJI[mode]}</div>
                    <div style={{ display: "flex", fontSize: 26, color: COLORS.primary }}>
                      {TRANSPORT_LABELS[mode]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", fontSize: 22, color: COLORS.muted }}>
          Erstellt mit Travel Tracker
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts },
  );
}
