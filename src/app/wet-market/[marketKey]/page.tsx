import Link from "next/link";
import { formatDateShort, formatPeso } from "@/lib/format";
import { MarketVisitTracker } from "@/components/MarketVisitTracker";
import {
  getMarket,
  listCategories,
  listObservations,
  listProducts,
} from "@/lib/repo";

export default async function MarketDetailPage(props: { params: Promise<{ marketKey: string }> }) {
  const { marketKey } = await props.params;

  const [market, categories, products, observations] = await Promise.all([
    getMarket(marketKey),
    listCategories(),
    listProducts(),
    listObservations({ marketKey }),
  ]);

  const productByKey = new Map(products.map((p) => [p.key, p] as const));
  const obsByCategory = groupByCategory(observations, productByKey);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <MarketVisitTracker marketKey={marketKey} />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-mint/70">
          <Link href="/wet-market" className="transition-colors hover:text-mint hover:underline">
            Wet Market
          </Link>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-mint">{market?.name ?? marketKey}</h1>
        <p className="text-sm text-mint/70">
          {market?.cityMunicipality ?? "Metro Manila"}
          {market?.address ? ` • ${market.address}` : ""}
        </p>
      </div>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-forest/45 bg-forest/25 p-5 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-mint">Presyo ng mga bilihin</h2>
              <p className="mt-1 text-sm text-mint/70">
                Grouped by category. Each item includes a source citation.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="hidden rounded-full bg-jade/15 px-4 py-2 text-sm font-semibold text-mint transition-all duration-300 hover:bg-jade/25 sm:inline"
            >
              Balik mapa
            </Link>
          </div>

          <div className="mt-5 space-y-6">
            {categories.map((c) => {
              const items = obsByCategory.get(c.key) ?? [];
              if (items.length === 0) return null;
              return (
                <div key={c.key}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-mint/55">
                    {c.tagalogName}
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {items
                      .slice()
                      .sort((a, b) => a.priceValue - b.priceValue)
                      .map((o, idx) => {
                        const p = productByKey.get(o.productKey);
                        return (
                          <div
                            key={`${o.productKey}-${o.observedAt}-${idx}`}
                            className="rounded-xl border border-forest/40 bg-ink/30 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-mint">
                                  {p?.tagalogName ?? o.productKey}
                                </p>
                                <p className="mt-0.5 text-xs text-mint/65">
                                  {formatDateShort(o.observedAt)} • {o.source.name}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-mint">
                                {formatPeso(o.priceValue)} / {o.unit === "KG" ? "kg" : "pc"}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <Link
                                href={`/products/${encodeURIComponent(p?.categoryKey ?? c.key)}/${encodeURIComponent(o.productKey)}`}
                                className="text-xs font-semibold text-jade transition-colors hover:text-mint hover:underline"
                              >
                                View product
                              </Link>
                              <span className="text-xs text-mint/55">{o.source.type}</span>
                            </div>

                            <p className="mt-2 text-xs leading-5 text-mint/70">{o.source.citationText}</p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}

            {observations.length === 0 ? (
              <p className="text-sm text-mint/70">
                Wala pang observations para sa palengkeng ito. (Sa sample data, may ilan na naka-populate.)
              </p>
            ) : null}
          </div>
        </div>

        <aside className="rounded-2xl border border-forest/45 bg-forest/25 p-5 backdrop-blur-sm">
          <h2 className="text-lg font-semibold tracking-tight text-mint">Compare</h2>
          <p className="mt-1 text-sm text-mint/70">V1: quick links to compare another market.</p>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/wet-market/divisoria-market-manila"
              className="rounded-xl border border-forest/40 px-4 py-3 text-sm font-semibold text-mint transition-all duration-300 hover:border-jade/45 hover:bg-jade/10"
            >
              Divisoria Market (Manila)
            </Link>
            <Link
              href="/wet-market/balintawak-market-quezon-city"
              className="rounded-xl border border-forest/40 px-4 py-3 text-sm font-semibold text-mint transition-all duration-300 hover:border-jade/45 hover:bg-jade/10"
            >
              Balintawak Market (QC)
            </Link>
            <Link
              href="/wet-market/pateros-market-pateros"
              className="rounded-xl border border-forest/40 px-4 py-3 text-sm font-semibold text-mint transition-all duration-300 hover:border-jade/45 hover:bg-jade/10"
            >
              Pateros Public Market
            </Link>
          </div>

          <div className="mt-6 rounded-xl bg-jade/10 p-4 text-sm text-mint/90">
            <p className="font-semibold text-mint">Tip</p>
            <p className="mt-1">
              Use the map in{" "}
              <Link href="/dashboard" className="font-semibold text-jade underline decoration-jade/60 underline-offset-2 hover:text-mint">
                Dashboard
              </Link>{" "}
              to explore more markets.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-mint/55">
              Sources (for this market)
            </h3>
            <div className="mt-3 space-y-3">
              {uniqueSources(observations).map((s) => (
                <div key={s.key} className="rounded-xl border border-forest/40 bg-ink/25 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-mint">{s.name}</p>
                    {s.url ? (
                      <Link
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-jade transition-colors hover:text-mint hover:underline"
                      >
                        Link
                      </Link>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-mint/70">{s.citationText}</p>
                </div>
              ))}
              {observations.length === 0 ? (
                <p className="text-sm text-mint/70">No sources yet.</p>
              ) : null}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function groupByCategory(
  observations: Awaited<ReturnType<typeof listObservations>>,
  productByKey: Map<string, Awaited<ReturnType<typeof listProducts>>[number]>
) {
  const m = new Map<string, typeof observations>();
  for (const o of observations) {
    const p = productByKey.get(o.productKey);
    const cat = p?.categoryKey ?? "unknown";
    const arr = m.get(cat);
    if (arr) arr.push(o);
    else m.set(cat, [o]);
  }
  return m;
}

function uniqueSources(observations: Awaited<ReturnType<typeof listObservations>>) {
  const byKey = new Map<string, (typeof observations)[number]["source"]>();
  for (const o of observations) byKey.set(o.source.key, o.source);
  return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name));
}

