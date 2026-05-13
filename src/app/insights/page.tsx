import { listInsights } from "@/lib/repo";
import Link from "next/link";
import { formatDateShort } from "@/lib/format";

export default async function InsightsPage() {
  const items = await listInsights();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-mint">Insights</h1>
        <p className="text-sm text-mint/70">
          Price updates from news sources and government bulletins (sources and citations).
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {items.map((i) => (
          <article
            key={i.key}
            className="rounded-2xl border border-forest/45 bg-forest/25 p-5 backdrop-blur-sm transition-shadow duration-300 hover:border-jade/35 hover:shadow-lg"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-mint/55">
                  {i.publisher} • {formatDateShort(i.publishedAt)}
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-mint">{i.title}</h2>
              </div>

              {i.url ? (
                <Link
                  href={i.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-jade/15 px-4 py-2 text-sm font-semibold text-mint transition-all duration-300 hover:bg-jade/25 active:scale-[0.98]"
                >
                  Open source link
                </Link>
              ) : null}
            </div>

            <p className="mt-3 text-sm leading-6 text-mint/85">{i.citationText}</p>

            {i.products.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {i.products.map((p) => (
                  <Link
                    key={p.productKey}
                    href={`/products/${encodeURIComponent(p.categoryKey)}/${encodeURIComponent(p.productKey)}`}
                    className="rounded-full bg-jade/10 px-3 py-1.5 text-xs font-semibold text-mint transition-all duration-300 hover:bg-jade/20"
                  >
                    {p.tagalogName}
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  );
}
