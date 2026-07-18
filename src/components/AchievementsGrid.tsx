import { clsx } from "clsx";
import { Trophy, Lock } from "lucide-react";

export type Achievement = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
};

export function AchievementsGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {achievements.map((a) => (
        <div
          key={a.id}
          className={clsx(
            "flex items-start gap-3 rounded-xl border p-3",
            a.unlocked
              ? "border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-900/10"
              : "border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/40",
          )}
        >
          {a.unlocked ? (
            <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          ) : (
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-700" />
          )}
          <div>
            <div
              className={clsx(
                "text-sm font-medium",
                a.unlocked
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-400 dark:text-zinc-600",
              )}
            >
              {a.label}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              {a.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
