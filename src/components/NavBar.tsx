"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Globe2, LayoutDashboard, List, LogOut, BarChart3, Luggage, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logout } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/countries", label: "Länder", icon: List },
  { href: "/trips", label: "Reisen", icon: Luggage },
  { href: "/stats", label: "Statistik", icon: BarChart3 },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function NavBar({ demoMode }: { demoMode?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {demoMode && (
        <div className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
          Demo-Modus – Beispieldaten, Änderungen werden regelmäßig zurückgesetzt.
          <form action={logout}>
            <button type="submit" className="underline underline-offset-2 hover:text-amber-950 dark:hover:text-amber-200">
              Demo verlassen
            </button>
          </form>
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              <Globe2 className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Travel Tracker</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive(pathname, href)
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              aria-label="Einstellungen"
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                isActive(pathname, "/settings")
                  ? "text-teal-700 dark:text-teal-300"
                  : "text-zinc-500 dark:text-zinc-400",
              )}
            >
              <Settings className="h-[18px] w-[18px]" />
            </Link>
            <ThemeToggle />
            <form action={logout}>
              <button
                type="submit"
                aria-label="Abmelden"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-6xl items-stretch justify-around">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium",
                isActive(pathname, href)
                  ? "text-teal-700 dark:text-teal-300"
                  : "text-zinc-500 dark:text-zinc-400",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
