"use client";

import type { MarketDto } from "@/lib/repo";
import dynamic from "next/dynamic";

const MarketMapClient = dynamic(
  () => import("./MarketMapClient").then((m) => m.MarketMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-forest/45 bg-forest/25 p-6 text-sm text-mint/75 backdrop-blur-sm">
        Loading map…
      </div>
    ),
  }
);

export function MarketMap(props: { markets: MarketDto[]; initialCity?: string | null }) {
  return <MarketMapClient {...props} />;
}
