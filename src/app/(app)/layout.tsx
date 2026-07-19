import { requireAuth, isDemoMode } from "@/lib/session";
import { NavBar } from "@/components/NavBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  const demoMode = await isDemoMode();

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar demoMode={demoMode} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
    </div>
  );
}
