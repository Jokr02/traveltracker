import type { LucideIcon } from "lucide-react";

export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
          {value}
        </span>
        {hint && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}
