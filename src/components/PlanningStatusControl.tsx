"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { setPlanningStatus } from "@/app/actions/countries";

const OPTIONS = [
  { value: "NONE", label: "Nicht besucht" },
  { value: "WISHLIST", label: "Wunschliste" },
  { value: "PLANNED", label: "Geplant" },
] as const;

export function PlanningStatusControl({
  countryId,
  value,
}: {
  countryId: string;
  value: "NONE" | "WISHLIST" | "PLANNED";
}) {
  const [current, setCurrent] = useState(value);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={isPending}
          onClick={() => {
            setCurrent(opt.value);
            startTransition(async () => {
              await setPlanningStatus(countryId, opt.value);
            });
          }}
          className={clsx(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60",
            current === opt.value
              ? "border-teal-600 bg-teal-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
