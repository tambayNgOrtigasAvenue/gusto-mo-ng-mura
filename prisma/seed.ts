import { PrismaClient } from "../src/generated/prisma/client";
import { Unit, SourceType } from "../src/generated/prisma/enums";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type SnapshotFile = {
  snapshot: { area: string; observedAt: string; notes?: string };
  sources: Array<{
    key: string;
    name: string;
    type: keyof typeof SourceType;
    publishedAt?: string | null;
    url?: string | null;
    citationText: string;
  }>;
  markets: Array<{
    key: string;
    name: string;
    cityMunicipality: string;
    address?: string | null;
    lat: number;
    lng: number;
  }>;
  categories: Array<{
    key: string;
    tagalogName: string;
    englishName?: string | null;
    sortOrder: number;
  }>;
  products: Array<{
    key: string;
    categoryKey: string;
    tagalogName: string;
    typicalUnit: keyof typeof Unit;
    imageUrl?: string | null;
    attributes?: unknown;
  }>;
  observations: Array<{
    marketKey: string;
    productKey: string;
    variantLabel?: string | null;
    priceValue: number;
    unit: keyof typeof Unit;
    observedAt: string;
    sourceKey: string;
  }>;
};

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
}

async function loadSnapshot(filePath: string): Promise<SnapshotFile> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as SnapshotFile;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for seeding.");
  }
  const adapter = new PrismaPg(new Pool({ connectionString }));
  const prisma = new PrismaClient({ adapter });
  const snapshotPath = path.join(process.cwd(), "data", "snapshots", "2026-05-ncr.sample.json");
  const snap = await loadSnapshot(snapshotPath);

  const sourceIdByKey = new Map<string, string>();
  for (const s of snap.sources) {
    const rec = await prisma.source.upsert({
      where: { canonicalKey: s.key },
      update: {
        name: s.name,
        type: SourceType[s.type],
        publishedAt: s.publishedAt ? new Date(s.publishedAt) : null,
        url: s.url ?? null,
        citationText: s.citationText,
      },
      create: {
        canonicalKey: s.key,
        name: s.name,
        type: SourceType[s.type],
        publishedAt: s.publishedAt ? new Date(s.publishedAt) : null,
        url: s.url ?? null,
        citationText: s.citationText,
      },
      select: { id: true },
    });
    sourceIdByKey.set(s.key, rec.id);
  }

  const marketIdByKey = new Map<string, string>();
  for (const m of snap.markets) {
    const rec = await prisma.market.upsert({
      where: { canonicalKey: m.key },
      update: {
        name: m.name,
        cityMunicipality: m.cityMunicipality,
        address: m.address ?? null,
        lat: m.lat,
        lng: m.lng,
      },
      create: {
        canonicalKey: m.key,
        name: m.name,
        cityMunicipality: m.cityMunicipality,
        address: m.address ?? null,
        lat: m.lat,
        lng: m.lng,
      },
      select: { id: true },
    });
    marketIdByKey.set(m.key, rec.id);
  }

  const categoryIdByKey = new Map<string, string>();
  for (const c of snap.categories) {
    const rec = await prisma.productCategory.upsert({
      where: { canonicalKey: c.key },
      update: {
        tagalogName: c.tagalogName,
        englishName: c.englishName ?? null,
        sortOrder: c.sortOrder,
      },
      create: {
        canonicalKey: c.key,
        tagalogName: c.tagalogName,
        englishName: c.englishName ?? null,
        sortOrder: c.sortOrder,
      },
      select: { id: true },
    });
    categoryIdByKey.set(c.key, rec.id);
  }

  const productIdByKey = new Map<string, string>();
  for (const p of snap.products) {
    const categoryId = categoryIdByKey.get(p.categoryKey);
    if (!categoryId) throw new Error(`Unknown categoryKey: ${p.categoryKey}`);

    const rec = await prisma.product.upsert({
      where: { canonicalKey: p.key },
      update: {
        categoryId,
        tagalogName: p.tagalogName,
        typicalUnit: Unit[p.typicalUnit],
        imageUrl: p.imageUrl ?? null,
        attributes: p.attributes ?? undefined,
      },
      create: {
        categoryId,
        tagalogName: p.tagalogName,
        canonicalKey: p.key,
        typicalUnit: Unit[p.typicalUnit],
        imageUrl: p.imageUrl ?? null,
        attributes: p.attributes ?? undefined,
      },
      select: { id: true },
    });
    productIdByKey.set(p.key, rec.id);
  }

  for (const o of snap.observations) {
    const marketId = marketIdByKey.get(o.marketKey);
    const productId = productIdByKey.get(o.productKey);
    const sourceId = sourceIdByKey.get(o.sourceKey);
    if (!marketId) throw new Error(`Unknown marketKey: ${o.marketKey}`);
    if (!productId) throw new Error(`Unknown productKey: ${o.productKey}`);
    if (!sourceId) throw new Error(`Unknown sourceKey: ${o.sourceKey}`);

    await prisma.priceObservation.create({
      data: {
        marketId,
        productId,
        sourceId,
        variantLabel: o.variantLabel ?? null,
        priceValue: o.priceValue,
        unit: Unit[o.unit],
        observedAt: new Date(o.observedAt),
      },
    });
  }

  // Recompute monthly aggregates for this snapshot's month across NCR (areaType=NCR)
  const anyObservedAt = new Date(snap.snapshot.observedAt);
  const mStart = monthStart(anyObservedAt);
  const mEnd = new Date(Date.UTC(mStart.getUTCFullYear(), mStart.getUTCMonth() + 1, 1, 0, 0, 0, 0));

  const products = await prisma.product.findMany({ select: { id: true } });
  for (const p of products) {
    const obs = await prisma.priceObservation.findMany({
      where: { productId: p.id, observedAt: { gte: mStart, lt: mEnd } },
      select: { priceValue: true },
    });
    if (obs.length === 0) continue;

    const prices = obs.map((x) => Number(x.priceValue));
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    await prisma.monthlyAggregate.upsert({
      where: {
        productId_areaType_areaKey_monthStart: {
          productId: p.id,
          areaType: "NCR",
          areaKey: "NCR",
          monthStart: mStart,
        },
      },
      update: {
        minPrice: min,
        maxPrice: max,
        observationCount: obs.length,
      },
      create: {
        productId: p.id,
        areaType: "NCR",
        areaKey: "NCR",
        monthStart: mStart,
        minPrice: min,
        maxPrice: max,
        observationCount: obs.length,
      },
    });
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

