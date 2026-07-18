"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Plane, Car, TrainFront, Bus, Ship, MoreHorizontal } from "lucide-react";
import { TRANSPORT_LABELS, TRANSPORT_ORDER } from "@/lib/transport";
import type { TransportMode } from "@/generated/prisma/client";

const ICONS: Record<TransportMode, typeof Plane> = {
  PLANE: Plane,
  CAR: Car,
  TRAIN: TrainFront,
  BUS: Bus,
  FERRY: Ship,
  OTHER: MoreHorizontal,
};

export function TransportModePicker({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: TransportMode[];
}) {
  const [selected, setSelected] = useState<Set<TransportMode>>(
    new Set(defaultValue ?? []),
  );

  function toggle(mode: TransportMode) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(mode)) next.delete(mode);
      else next.add(mode);
      return next;
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {[...selected].map((mode) => (
        <input key={mode} type="hidden" name={name} value={mode} />
      ))}
      {TRANSPORT_ORDER.map((mode) => {
        const Icon = ICONS[mode];
        const active = selected.has(mode);
        return (
          <button
            key={mode}
            type="button"
            onClick={() => toggle(mode)}
            className={clsx(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {TRANSPORT_LABELS[mode]}
          </button>
        );
      })}
    </div>
  );
}
