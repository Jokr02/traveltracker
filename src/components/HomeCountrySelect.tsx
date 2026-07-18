"use client";

import { useState, useTransition } from "react";
import { setHomeCountry } from "@/app/actions/settings";

export function HomeCountrySelect({
  countries,
  value,
}: {
  countries: { id: string; name: string; flagEmoji: string | null }[];
  value: string | null;
}) {
  const [selected, setSelected] = useState(value ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={selected}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        setSelected(next);
        startTransition(async () => {
          await setHomeCountry(next || null);
        });
      }}
      className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
    >
      <option value="">Kein Heimatland festgelegt</option>
      {countries.map((c) => (
        <option key={c.id} value={c.id}>
          {c.flagEmoji ? `${c.flagEmoji} ` : ""}
          {c.name}
        </option>
      ))}
    </select>
  );
}
