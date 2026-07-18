"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Datum = { continent: string; visited: number; total: number; pct: number };

export function ContinentBarChart({ data }: { data: Datum[] }) {
  return (
    <div className="viz-root h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "var(--chart-gridline)" }}
          />
          <YAxis
            type="category"
            dataKey="continent"
            width={90}
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--chart-gridline)", opacity: 0.5 }}
            formatter={(value, _name, item) => {
              const payload = item.payload as Datum;
              return [
                `${payload.visited}/${payload.total} Länder (${Number(value).toFixed(1)}%)`,
                "Abdeckung",
              ];
            }}
            contentStyle={{
              background: "var(--chart-surface)",
              border: "1px solid var(--chart-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="pct"
            radius={[0, 4, 4, 0]}
            fill="var(--status-visited)"
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
