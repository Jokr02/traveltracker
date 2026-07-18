"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { clsx } from "clsx";

export function StarRatingInput({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: number | null;
}) {
  const [value, setValue] = useState(defaultValue ?? 0);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={value || ""} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setValue(value === n ? 0 : n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          aria-label={`${n} Sterne`}
          className="p-0.5"
        >
          <Star
            className={clsx(
              "h-5 w-5 transition-colors",
              n <= shown
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-zinc-300 dark:text-zinc-600",
            )}
          />
        </button>
      ))}
    </div>
  );
}
