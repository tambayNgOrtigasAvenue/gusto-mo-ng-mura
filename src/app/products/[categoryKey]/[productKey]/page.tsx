import Link from "next/link";
import Image from "next/image";
import { formatDateShort, formatPeso } from "@/lib/format";
import {
  getMonthlyRange,
  getProduct,
  listMarkets,
  listObservations,
} from "@/lib/repo";

export default async function ProductPage(props: {
  params: Promise<{ categoryKey: string; productKey: string }>;
}) {
  const { categoryKey, productKey } = await props.params;

  const [product, range, observations, markets] = await Promise.all([
    getProduct(productKey),
    getMonthlyRange(productKey),
    listObservations({ productKey }),
    listMarkets(),
  ]);
  const sources = uniqueSources(observations);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-mint/70">
          <Link href="/products" className="transition-colors hover:text-mint hover:underline">
            Products
          </Link>{" "}
          /{" "}
          <Link
            href={`/products/${encodeURIComponent(categoryKey)}`}
            className="transition-colors hover:text-mint hover:underline"
          >
            {categoryKey}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-mint">
          {product?.tagalogName ?? productKey}
        </h1>
        <p className="text-sm text-mint/70">
          {range ? (
            <>
              Monthly low/high:{" "}
              <span className="font-semibold text-mint">
                {formatPeso(range.min)}–{formatPeso(range.max)}
              </span>{" "}
              ({range.observationCount} obs)
            </>
          ) : (
            "Walang monthly range data pa."
          )}
        </p>
      </div>

      {product?.imageUrl ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-forest/45">
          <Image
            src={product.imageUrl}
            alt={product.tagalogName}
            width={1200}
            height={600}
            className="h-56 w-full object-cover sm:h-72"
          />
        </div>
      ) : null}

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-forest/45 bg-forest/25 p-5 backdrop-blur-sm">
          <h2 className="text-lg font-semibold tracking-tight text-mint">Pinakamurang sample prices</h2>
          <p className="mt-1 text-sm text-mint/70">Sorted by lowest price (latest snapshot month).</p>

          <div className="mt-4 flex flex-col gap-3">
            {observations
              .slice()
              .sort((a, b) => a.priceValue - b.priceValue)
              .map((o, idx) => {
                const market = markets.find((m) => m.key === o.marketKey);
                return (
                  <div
                    key={`${o.marketKey}-${o.observedAt}-${idx}`}
                    className="rounded-xl border border-forest/40 bg-ink/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-mint">
                          {market?.name ?? o.marketKey}
                        </p>
                        <p className="mt-0.5 text-xs text-mint/65">
                          {market?.cityMunicipality ?? "NCR"} • {formatDateShort(o.observedAt)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-mint">
                        {formatPeso(o.priceValue)} / {o.unit === "KG" ? "kg" : "pc"}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-mint/70">
                        Source:{" "}
                        <span className="font-semibold text-mint">{o.source.name}</span>
                      </p>
                      <Link
                        href={`/wet-market/${encodeURIComponent(o.marketKey)}`}
                        className="inline-flex w-fit rounded-full bg-jade/15 px-3 py-1.5 text-xs font-semibold text-mint transition-all duration-300 hover:bg-jade/25"
                      >
                        Buksan ang palengke
                      </Link>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-mint/70">{o.source.citationText}</p>
                  </div>
                );
              })}
            {observations.length === 0 ? (
              <p className="text-sm text-mint/70">Wala pang observations para dito.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-forest/45 bg-forest/25 p-5 backdrop-blur-sm">
          <h2 className="text-lg font-semibold tracking-tight text-mint">Sources & notes</h2>

          <div className="mt-4 space-y-3">
            {sources.map((s) => (
              <div key={s.key} className="rounded-xl border border-forest/40 bg-ink/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-mint">{s.name}</p>
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

            {sources.length === 0 ? (
              <p className="text-sm text-mint/70">No sources yet.</p>
            ) : null}
          </div>

          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-mint/85">
            <li>Ang presyo sa palengke ay maaaring mag-iba depende sa tindahan at oras.</li>
            <li>Sa V1, “monthly low/high” ay base sa curated snapshots na may citations.</li>
            <li>Kapag naka-configure ang database, automatic na galing sa DB ang data.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function uniqueSources(observations: Awaited<ReturnType<typeof listObservations>>) {
  const byKey = new Map<string, (typeof observations)[number]["source"]>();
  for (const o of observations) byKey.set(o.source.key, o.source);
  return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name));
}
