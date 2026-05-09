import Link from "next/link";
import { PricePreviewCard } from "@/components/PricePreviewCard";
import { getHomePreview } from "@/lib/repo";

export default async function Home() {
  const preview = await getHomePreview();
  const previewByKey = new Map(preview.map((p) => [p.productKey, p] as const));

  return (
    <main>
      <section className="border-b border-forest/35 bg-gradient-to-b from-jade/20 via-forest/25 to-ink">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-mint/75">
              Metro Manila • Palengke price finder
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-mint sm:text-5xl">
              Gusto mo ng mura?
            </h1>
            <p className="mt-4 text-lg leading-8 text-mint/85">
              Alamin ang presyong <span className="font-semibold text-mint">pinakamababa</span>{" "}
              at ihambing ang mga palengke para sa bigas, asukal, karne, gulay,
              at iba pa.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-jade px-5 py-3 text-sm font-semibold text-ink shadow-md transition-all duration-300 ease-out hover:bg-jade/90 hover:shadow-lg active:scale-[0.98]"
            >
              Tingnan sa mapa
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-jade/50 bg-forest/20 px-5 py-3 text-sm font-semibold text-mint backdrop-blur-sm transition-all duration-300 ease-out hover:border-jade/70 hover:bg-forest/35 active:scale-[0.98]"
            >
              Tingnan lahat ng products
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-mint">
              Quick glance (preview)
            </h2>
            <p className="mt-1 text-sm text-mint/65">
              Sample snapshot data (curated + citeable workflow). You can replace
              with real sources anytime.
            </p>
          </div>
          <Link
            href="/wet-market/quiapo-market-manila"
            className="hidden rounded-full bg-jade/10 px-4 py-2 text-sm font-semibold text-mint transition-all duration-300 hover:bg-jade/20 sm:inline"
          >
            Ihambing ang palengke
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PricePreviewCard
            title="Bigas"
            subtitle="Mga uri + ₱/kg"
            unitLabel="kg"
            href="/products/bigas"
            range={previewByKey.get("bigas-regular-milled")?.range ?? null}
          />
          <PricePreviewCard
            title="Asukal"
            subtitle="Puti / Refined • ₱/kg"
            unitLabel="kg"
            href="/products/asukal"
            range={previewByKey.get("asukal-refined")?.range ?? null}
          />
          <PricePreviewCard
            title="Karne"
            subtitle="Baboy (Liempo) • ₱/kg"
            unitLabel="kg"
            href="/products/karne"
            range={previewByKey.get("karne-baboy-liempo")?.range ?? null}
          />
        </div>
      </section>
    </main>
  );
}
