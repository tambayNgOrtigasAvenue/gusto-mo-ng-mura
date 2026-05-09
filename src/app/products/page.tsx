import Link from "next/link";
import { listCategories } from "@/lib/repo";

export default async function ProductsIndexPage() {
  const categories = await listCategories();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-mint">Products</h1>
        <p className="text-sm text-mint/70">
          Lahat ng categories: Bigas, Gulay (Bahay Kubo), Isda, Karne, Itlog,
          Asukal, Pampalasa.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.key}
            href={`/products/${encodeURIComponent(c.key)}`}
            className="group rounded-2xl border border-forest/45 bg-forest/25 p-5 shadow-md backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-jade/40 hover:shadow-lg active:scale-[0.99]"
          >
            <h2 className="text-lg font-semibold tracking-tight text-mint">{c.tagalogName}</h2>
            <p className="mt-1 text-sm text-mint/65">{c.englishName ?? "Category"}</p>
            <p className="mt-4 text-sm font-semibold text-jade transition-colors group-hover:text-mint">
              Tingnan items →
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
