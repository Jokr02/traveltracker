import { ImageResponse } from "next/og";
import { isAuthenticated } from "@/lib/session";
import { getStats } from "@/lib/stats";
import { getShareFonts } from "@/lib/og-fonts";

const WIDTH = 1080;
const HEIGHT = 1920;

const COLORS = {
  bg: "#0a0a0a",
  card: "#151517",
  border: "#27272a",
  primary: "#ffffff",
  secondary: "#a1a1aa",
  muted: "#52525b",
  accent: "#5eead4",
  accentFill: "#2dd4bf",
};

export async function GET() {
  if (!(await isAuthenticated())) {
    return new Response(null, { status: 401 });
  }

  const stats = await getStats();
  const fonts = await getShareFonts();

  const kmByContinent = new Map(stats.continentKm.map((c) => [c.continent, c.km]));
  const continents = stats.continentBreakdown.map((c) => ({
    ...c,
    km: kmByContinent.get(c.continent) ?? 0,
  }));

  const worldPct = stats.totalCountries > 0
    ? (stats.visitedCount / stats.totalCountries) * 100
    : 0;

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
            🌍
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
                fontSize: 240,
                fontWeight: 700,
                color: COLORS.primary,
                lineHeight: 1,
              }}
            >
              {stats.visitedCount}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 42,
                color: COLORS.accent,
                fontWeight: 600,
                marginTop: 12,
              }}
            >
              Länder besucht
            </div>
            <div style={{ display: "flex", fontSize: 28, color: COLORS.secondary, marginTop: 6 }}>
              von {stats.totalCountries} · {worldPct.toFixed(1)}% der Welt
            </div>
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
            <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: COLORS.primary }}>
              {stats.totalKm.toLocaleString("de-DE")}
            </div>
            <div style={{ display: "flex", fontSize: 30, color: COLORS.secondary }}>
              km zurückgelegt
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 56, gap: 26 }}>
            {continents.map((c) => (
              <div key={c.continent} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 27 }}>
                  <div style={{ display: "flex", color: COLORS.primary, fontWeight: 600 }}>
                    {c.continent}
                  </div>
                  <div style={{ display: "flex", color: COLORS.secondary }}>
                    {c.visited}/{c.total} · {c.km.toLocaleString("de-DE")} km
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: 14,
                    backgroundColor: COLORS.border,
                    borderRadius: 7,
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: `${Math.max(c.pct, 2)}%`,
                      height: "100%",
                      backgroundColor: COLORS.accentFill,
                      borderRadius: 7,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 22, color: COLORS.muted }}>
          Erstellt mit Travel Tracker
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts },
  );
}
