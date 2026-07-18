"use client";

import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { clsx } from "clsx";

export function ShareButton({
  url,
  filename,
  label = "Teilen",
  className,
}: {
  url: string;
  filename: string;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Bild konnte nicht erstellt werden.");
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Travel Tracker" });
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      // AbortError: Nutzer hat das native Share-Sheet abgebrochen — kein echter Fehler.
      if (error instanceof Error && error.name !== "AbortError") {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      className={clsx(
        "flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}
