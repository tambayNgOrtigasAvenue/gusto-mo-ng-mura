import { MarketMap } from "@/components/MarketMap";
import { listMarkets } from "@/lib/repo";

export default async function DashboardPage() {
  const markets = await listMarkets();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-mint">Dashboard</h1>
        <p className="text-sm text-mint/70">
          Explore markets in Metro Manila using the map and filters.
        </p>
      </div>

      <div className="mt-6">
        <MarketMap markets={markets} />
      </div>
    </main>
  );
}
