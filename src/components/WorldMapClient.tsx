"use client";

import dynamic from "next/dynamic";

// react-simple-maps rechnet D3-Projektionen mit Fließkomma-Koordinaten, die
// zwischen Server- und Client-Render minimal abweichen können (React-
// Hydration-Mismatch-Warnung bei langen Routen). Da die Karte ohnehin
// interaktiv ist (Zoom/Pan, Klicks) und von SSR nicht profitiert, wird sie
// rein clientseitig gerendert.
export const WorldMap = dynamic(
  () => import("@/components/WorldMap").then((mod) => mod.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] w-full animate-pulse rounded-2xl border border-zinc-200 bg-[var(--chart-surface)] sm:h-[420px] md:h-[520px] dark:border-zinc-800" />
    ),
  },
);
