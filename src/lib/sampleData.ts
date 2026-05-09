import { readFile } from "node:fs/promises";
import path from "node:path";

export type SampleSnapshot = {
  snapshot: { area: string; observedAt: string; notes?: string };
  sources: Array<{
    key: string;
    name: string;
    type: "GOV" | "NEWS" | "COMMUNITY";
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
    typicalUnit: "KG" | "PC";
    imageUrl?: string | null;
    attributes?: unknown;
  }>;
  observations: Array<{
    marketKey: string;
    productKey: string;
    variantLabel?: string | null;
    priceValue: number;
    unit: "KG" | "PC";
    observedAt: string;
    sourceKey: string;
  }>;
};

export async function loadSampleSnapshot(): Promise<SampleSnapshot> {
  const filePath = path.join(process.cwd(), "data", "snapshots", "2026-05-ncr.sample.json");
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as SampleSnapshot;
}

