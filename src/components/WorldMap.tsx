"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  ZoomableGroup,
} from "react-simple-maps";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { CountryStatus } from "@/lib/countries";

const GEO_URL = "https://unpkg.com/world-atlas@2/countries-110m.json";

const STATUS_LABEL: Record<CountryStatus, string> = {
  visited: "Besucht",
  planned: "Geplant",
  wishlist: "Wunschliste",
  unvisited: "Nicht besucht",
};

const STATUS_VAR: Record<CountryStatus, string> = {
  visited: "var(--status-visited)",
  planned: "var(--status-planned)",
  wishlist: "var(--status-wishlist)",
  unvisited: "var(--status-unvisited-fill)",
};

export type MapCountry = {
  id: string;
  ccn3: string | null;
  name: string;
  status: CountryStatus;
  visitCount: number;
};

type TooltipState = {
  x: number;
  y: number;
  name: string;
  status: CountryStatus;
  visitCount: number;
} | null;

export type MapTrip = {
  id: string;
  stops: { longitude: number; latitude: number }[];
};

export function WorldMap({
  countries,
  trips = [],
}: {
  countries: MapCountry[];
  trips?: MapTrip[];
}) {
  const router = useRouter();
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([10, 20]);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const byCcn3 = useMemo(() => {
    const map = new Map<string, MapCountry>();
    for (const c of countries) {
      if (c.ccn3) map.set(c.ccn3, c);
    }
    return map;
  }, [countries]);

  const handleZoomIn = useCallback(
    () => setZoom((z) => Math.min(z * 1.5, 8)),
    [],
  );
  const handleZoomOut = useCallback(
    () => setZoom((z) => Math.max(z / 1.5, 1)),
    [],
  );
  const handleReset = useCallback(() => {
    setZoom(1);
    setCenter([10, 20]);
  }, []);

  return (
    <div className="viz-root relative overflow-hidden rounded-2xl border border-zinc-200 bg-[var(--chart-surface)] dark:border-zinc-800">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 155 }}
        className="h-[320px] w-full sm:h-[420px] md:h-[520px]"
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={({ coordinates, zoom: z }) => {
            setCenter(coordinates);
            setZoom(z);
          }}
          minZoom={1}
          maxZoom={8}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const match = byCcn3.get(String(geo.id));
                const status: CountryStatus = match?.status ?? "unvisited";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(evt) => {
                      setTooltip({
                        x: evt.clientX,
                        y: evt.clientY,
                        name: match?.name ?? geo.properties.name,
                        status,
                        visitCount: match?.visitCount ?? 0,
                      });
                    }}
                    onMouseMove={(evt) => {
                      setTooltip((t) =>
                        t ? { ...t, x: evt.clientX, y: evt.clientY } : t,
                      );
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (match) router.push(`/countries/${match.id}`);
                    }}
                    style={{
                      default: {
                        fill: STATUS_VAR[status],
                        stroke:
                          status === "unvisited"
                            ? "var(--status-unvisited-border)"
                            : "var(--chart-surface)",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: match ? "pointer" : "default",
                      },
                      hover: {
                        fill: STATUS_VAR[status],
                        stroke: "var(--text-primary, currentColor)",
                        strokeWidth: 1,
                        outline: "none",
                        opacity: 0.85,
                        cursor: match ? "pointer" : "default",
                      },
                      pressed: {
                        fill: STATUS_VAR[status],
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {trips.flatMap((trip) =>
            trip.stops.slice(1).map((stop, i) => {
              const from = trip.stops[i];
              return (
                <Line
                  key={`${trip.id}-${i}`}
                  from={[from.longitude, from.latitude]}
                  to={[stop.longitude, stop.latitude]}
                  stroke="var(--text-secondary)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  fill="none"
                />
              );
            }),
          )}
        </ZoomableGroup>
      </ComposableMap>

      <div className="absolute right-3 top-3 flex flex-col gap-1">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Vergrößern"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Verkleinern"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Ansicht zurücksetzen"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-white/90 px-3 py-2 text-xs text-zinc-700 shadow-sm dark:bg-zinc-900/90 dark:text-zinc-300">
        {(Object.keys(STATUS_LABEL) as CountryStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full border border-black/10 dark:border-white/10"
              style={{ backgroundColor: STATUS_VAR[status] }}
            />
            {STATUS_LABEL[status]}
          </span>
        ))}
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <div className="font-medium">{tooltip.name}</div>
          <div className="text-zinc-300 dark:text-zinc-600">
            {STATUS_LABEL[tooltip.status]}
            {tooltip.visitCount > 0 &&
              ` · ${tooltip.visitCount} ${tooltip.visitCount === 1 ? "Besuch" : "Besuche"}`}
          </div>
        </div>
      )}
    </div>
  );
}
