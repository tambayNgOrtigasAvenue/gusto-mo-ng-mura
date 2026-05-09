import { MarketMap } from "@/components/MarketMap";
import { listMarkets } from "@/lib/repo";

export default async function WetMarketIndexPage() {
  const markets = await listMarkets();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-mint">Wet Market</h1>
        <p className="text-sm text-mint/70">
          Pumili muna ng palengke sa mapa, tapos tingnan ang presyo ng mga bilihin.
        </p>
      </div>

      <div className="mt-6">
        <MarketMap markets={markets} />
      </div>
    </main>
  );
}
