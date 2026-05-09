import Link from "next/link";
import Image from "next/image";
import { formatPeso } from "@/lib/format";
import {
  getMonthlyRange,
  listCategories,
  listMarkets,
  listObservations,
  listProducts,
} from "@/lib/repo";

export default async function CategoryPage(props: { params: Promise<{ categoryKey: string }> }) {
  const { categoryKey } = await props.params;

  const [categories, products, markets] = await Promise.all([
    listCategories(),
    listProducts({ categoryKey }),
    listMarkets(),
  ]);
  const category = categories.find((c) => c.key === categoryKey);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-mint/70">Category</p>
        <h1 className="text-2xl font-semibold tracking-tight text-mint">
          {category?.tagalogName ?? categoryKey}
        </h1>
        <p className="text-sm text-mint/70">
          {category?.englishName ?? "Products"} • Monthly low/high within the latest snapshot month.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {await Promise.all(
          products.map(async (p) => {
            const range = await getMonthlyRange(p.key);
            const observations = await listObservations({ productKey: p.key });
            const cheapest = cheapestMarket(observations, markets);

            return (
              <Link
                key={p.key}
                href={`/products/${encodeURIComponent(categoryKey)}/${encodeURIComponent(p.key)}`}
                className="group rounded-2xl border border-forest/45 bg-forest/25 p-5 shadow-md backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-jade/40 hover:shadow-lg active:scale-[0.99]"
              >
                {p.imageUrl ? (
                  <div className="mb-4 overflow-hidden rounded-xl border border-forest/40">
                    <Image
                      src={p.imageUrl}
                      alt={p.tagalogName}
                      width={800}
                      height={480}
                      className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                ) : null}
                <h2 className="text-lg font-semibold tracking-tight text-mint">{p.tagalogName}</h2>

                <div className="mt-3">
                  {range ? (
                    <p className="text-sm text-mint/85">
                      Monthly range:{" "}
                      <span className="font-semibold text-mint">
                        {formatPeso(range.min)}–{formatPeso(range.max)}
                      </span>{" "}
                      / {p.typicalUnit === "KG" ? "kg" : "pc"}
                    </p>
                  ) : (
                    <p className="text-sm text-mint/65">Walang monthly range data pa.</p>
                  )}
                </div>

                <div className="mt-2">
                  {cheapest ? (
                    <p className="text-sm text-mint/70">
                      Cheapest sample:{" "}
                      <span className="font-semibold text-mint">{formatPeso(cheapest.price)}</span> at{" "}
                      {cheapest.marketName}
                    </p>
                  ) : (
                    <p className="text-sm text-mint/65">No market observations yet.</p>
                  )}
                </div>

                <p className="mt-4 text-sm font-semibold text-jade transition-colors group-hover:text-mint">
                  View details →
                </p>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}

function cheapestMarket(
  observations: Awaited<ReturnType<typeof listObservations>>,
  markets: Awaited<ReturnType<typeof listMarkets>>
) {
  if (observations.length === 0) return null;
  const best = observations.reduce((acc, o) => (o.priceValue < acc.priceValue ? o : acc));
  const market = markets.find((m) => m.key === best.marketKey);
  return market ? { marketName: market.name, price: best.priceValue, marketKey: market.key } : null;
}
