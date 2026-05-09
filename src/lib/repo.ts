import { getPrisma } from "@/lib/db";
import { loadSampleSnapshot } from "@/lib/sampleData";

export type PriceUnit = "KG" | "PC";

export type MarketDto = {
  key: string;
  name: string;
  cityMunicipality: string;
  address?: string | null;
  lat: number;
  lng: number;
};

export type ProductCategoryDto = {
  key: string;
  tagalogName: string;
  englishName?: string | null;
  sortOrder: number;
};

export type ProductDto = {
  key: string;
  categoryKey: string;
  tagalogName: string;
  typicalUnit: PriceUnit;
  imageUrl?: string | null;
};

export type ObservationDto = {
  marketKey: string;
  productKey: string;
  variantLabel?: string | null;
  priceValue: number;
  unit: PriceUnit;
  observedAt: string;
  source: { key: string; name: string; type: "GOV" | "NEWS" | "COMMUNITY"; url?: string | null; citationText: string };
};

export type MonthlyRangeDto = {
  monthStart: string;
  min: number;
  max: number;
  observationCount: number;
};

async function canUseDb() {
  const prisma = getPrisma();
  if (!prisma) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function listMarkets(params?: { city?: string | null }) {
  if (!(await canUseDb())) {
    const snap = await loadSampleSnapshot();
    return snap.markets
      .filter((m) => (!params?.city ? true : m.cityMunicipality === params.city))
      .map((m) => ({ key: m.key, name: m.name, cityMunicipality: m.cityMunicipality, address: m.address ?? null, lat: m.lat, lng: m.lng }));
  }

  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured.");

  const rows = await prisma.market.findMany({
    where: params?.city ? { cityMunicipality: params.city } : undefined,
    select: { canonicalKey: true, name: true, cityMunicipality: true, address: true, lat: true, lng: true },
    orderBy: [{ cityMunicipality: "asc" }, { name: "asc" }],
  });

  return rows.map((m) => ({ key: m.canonicalKey, name: m.name, cityMunicipality: m.cityMunicipality, address: m.address, lat: m.lat, lng: m.lng }));
}

export async function getMarket(marketKey: string) {
  const markets = await listMarkets();
  return markets.find((m) => m.key === marketKey) ?? null;
}

export async function listCategories() {
  if (!(await canUseDb())) {
    const snap = await loadSampleSnapshot();
    return snap.categories
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ key: c.key, tagalogName: c.tagalogName, englishName: c.englishName ?? null, sortOrder: c.sortOrder }));
  }

  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured.");

  const rows = await prisma.productCategory.findMany({
    select: { canonicalKey: true, tagalogName: true, englishName: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { tagalogName: "asc" }],
  });

  return rows.map((c) => ({ key: c.canonicalKey, tagalogName: c.tagalogName, englishName: c.englishName, sortOrder: c.sortOrder }));
}

export async function listProducts(params?: { categoryKey?: string }) {
  if (!(await canUseDb())) {
    const snap = await loadSampleSnapshot();
    return snap.products
      .filter((p) => (!params?.categoryKey ? true : p.categoryKey === params.categoryKey))
      .map((p) => ({
        key: p.key,
        categoryKey: p.categoryKey,
        tagalogName: p.tagalogName,
        typicalUnit: p.typicalUnit,
        imageUrl: p.imageUrl ?? null,
      }));
  }

  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured.");

  const rows = await prisma.product.findMany({
    where: params?.categoryKey ? { category: { canonicalKey: params.categoryKey } } : undefined,
    select: { canonicalKey: true, tagalogName: true, typicalUnit: true, imageUrl: true, category: { select: { canonicalKey: true } } },
    orderBy: [{ category: { sortOrder: "asc" } }, { tagalogName: "asc" }],
  });

  return rows.map((p) => ({
    key: p.canonicalKey,
    categoryKey: p.category.canonicalKey,
    tagalogName: p.tagalogName,
    typicalUnit: p.typicalUnit,
    imageUrl: p.imageUrl,
  }));
}

export async function getProduct(productKey: string) {
  const all = await listProducts();
  return all.find((p) => p.key === productKey) ?? null;
}

export async function listObservations(params: { marketKey?: string; productKey?: string }) {
  if (!(await canUseDb())) {
    const snap = await loadSampleSnapshot();
    const sourceByKey = new Map(snap.sources.map((s) => [s.key, s] as const));
    return snap.observations
      .filter((o) => (params.marketKey ? o.marketKey === params.marketKey : true))
      .filter((o) => (params.productKey ? o.productKey === params.productKey : true))
      .map((o) => {
        const s = sourceByKey.get(o.sourceKey);
        if (!s) throw new Error(`Missing source for ${o.sourceKey}`);
        return {
          marketKey: o.marketKey,
          productKey: o.productKey,
          variantLabel: o.variantLabel ?? null,
          priceValue: o.priceValue,
          unit: o.unit,
          observedAt: o.observedAt,
          source: { key: s.key, name: s.name, type: s.type, url: s.url ?? null, citationText: s.citationText },
        } satisfies ObservationDto;
      });
  }

  const prisma = getPrisma();
  if (!prisma) throw new Error("Database not configured.");

  const rows = await prisma.priceObservation.findMany({
    where: {
      market: params.marketKey ? { canonicalKey: params.marketKey } : undefined,
      product: params.productKey ? { canonicalKey: params.productKey } : undefined,
    },
    select: {
      market: { select: { canonicalKey: true } },
      product: { select: { canonicalKey: true } },
      variantLabel: true,
      priceValue: true,
      unit: true,
      observedAt: true,
      source: { select: { canonicalKey: true, name: true, type: true, url: true, citationText: true } },
    },
    orderBy: [{ observedAt: "desc" }],
  });

  return rows.map((o) => ({
    marketKey: o.market?.canonicalKey ?? "",
    productKey: o.product.canonicalKey,
    variantLabel: o.variantLabel,
    priceValue: Number(o.priceValue),
    unit: o.unit,
    observedAt: o.observedAt.toISOString(),
    source: { key: o.source.canonicalKey, name: o.source.name, type: o.source.type, url: o.source.url, citationText: o.source.citationText },
  }));
}

export async function getMonthlyRange(productKey: string): Promise<MonthlyRangeDto | null> {
  // V1: show NCR range only, using sample snapshot if DB isn’t configured.
  const observations = await listObservations({ productKey });
  if (observations.length === 0) return null;
  const monthStart = observations
    .map((o) => new Date(o.observedAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const m0 = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), 1));
  const m1 = new Date(Date.UTC(m0.getUTCFullYear(), m0.getUTCMonth() + 1, 1));
  const inMonth = observations.filter((o) => {
    const d = new Date(o.observedAt);
    return d >= m0 && d < m1;
  });
  if (inMonth.length === 0) return null;
  const prices = inMonth.map((o) => o.priceValue);
  return {
    monthStart: m0.toISOString(),
    min: Math.min(...prices),
    max: Math.max(...prices),
    observationCount: inMonth.length,
  };
}

export async function getHomePreview() {
  const targetKeys = ["bigas-regular-milled", "asukal-refined", "karne-baboy-liempo"] as const;
  const products = await Promise.all(targetKeys.map((k) => getProduct(k)));
  const ranges = await Promise.all(targetKeys.map((k) => getMonthlyRange(k)));
  return targetKeys.map((k, idx) => ({
    productKey: k,
    product: products[idx],
    range: ranges[idx],
  }));
}

export async function listInsights() {
  // V1: derived from sources + snapshot metadata (news-style feed)
  const snap = await loadSampleSnapshot();
  const productByKey = new Map(snap.products.map((p) => [p.key, p] as const));
  const productsBySource = new Map<string, Set<string>>();
  for (const o of snap.observations) {
    const set = productsBySource.get(o.sourceKey) ?? new Set<string>();
    set.add(o.productKey);
    productsBySource.set(o.sourceKey, set);
  }

  return snap.sources
    .filter((s) => s.type === "NEWS" || s.type === "GOV")
    .map((s) => ({
      key: s.key,
      title: s.type === "GOV" ? "Opisyal na price update" : "Balitang presyo",
      publisher: s.name,
      publishedAt: s.publishedAt ?? snap.snapshot.observedAt,
      url: s.url ?? null,
      citationText: s.citationText,
      type: s.type,
      products: Array.from(productsBySource.get(s.key) ?? [])
        .map((pk) => {
          const p = productByKey.get(pk);
          return p ? { productKey: p.key, tagalogName: p.tagalogName, categoryKey: p.categoryKey } : null;
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
        .slice(0, 8),
    }))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

