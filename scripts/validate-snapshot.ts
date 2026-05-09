import { readFile } from "node:fs/promises";
import path from "node:path";

type SnapshotFile = {
  sources: Array<{ key: string; citationText: string; type: string; name: string; url?: string | null }>;
  markets: Array<{ key: string; name: string; cityMunicipality: string; lat: number; lng: number }>;
  categories: Array<{ key: string; tagalogName: string; sortOrder: number }>;
  products: Array<{ key: string; categoryKey: string; tagalogName: string; typicalUnit: string }>;
  observations: Array<{
    marketKey: string;
    productKey: string;
    sourceKey: string;
    observedAt: string;
    priceValue: number;
    unit: string;
  }>;
};

function fail(msg: string): never {
  console.error(`Snapshot validation failed: ${msg}`);
  process.exit(1);
}

async function main() {
  const filePath = process.argv[2] ?? path.join(process.cwd(), "data", "snapshots", "2026-05-ncr.sample.json");
  const raw = await readFile(filePath, "utf8");
  const snap = JSON.parse(raw) as SnapshotFile;

  const sourceKeys = new Set(snap.sources.map((s) => s.key));
  const marketKeys = new Set(snap.markets.map((m) => m.key));
  const categoryKeys = new Set(snap.categories.map((c) => c.key));
  const productKeys = new Set(snap.products.map((p) => p.key));

  for (const s of snap.sources) {
    if (!s.key) fail("source missing key");
    if (!s.name) fail(`source ${s.key} missing name`);
    if (!s.type) fail(`source ${s.key} missing type`);
    if (!s.citationText || s.citationText.trim().length < 10) fail(`source ${s.key} missing citationText`);
  }

  for (const m of snap.markets) {
    if (!m.key) fail("market missing key");
    if (!m.name) fail(`market ${m.key} missing name`);
    if (!m.cityMunicipality) fail(`market ${m.key} missing cityMunicipality`);
    if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) fail(`market ${m.key} invalid lat/lng`);
  }

  for (const c of snap.categories) {
    if (!c.key) fail("category missing key");
    if (!c.tagalogName) fail(`category ${c.key} missing tagalogName`);
    if (!Number.isInteger(c.sortOrder)) fail(`category ${c.key} sortOrder must be integer`);
  }

  for (const p of snap.products) {
    if (!p.key) fail("product missing key");
    if (!categoryKeys.has(p.categoryKey)) fail(`product ${p.key} has unknown categoryKey ${p.categoryKey}`);
    if (!p.tagalogName) fail(`product ${p.key} missing tagalogName`);
    if (!["KG", "PC"].includes(p.typicalUnit)) fail(`product ${p.key} typicalUnit must be KG or PC`);
  }

  for (const [idx, o] of snap.observations.entries()) {
    if (!marketKeys.has(o.marketKey)) fail(`observation #${idx} unknown marketKey ${o.marketKey}`);
    if (!productKeys.has(o.productKey)) fail(`observation #${idx} unknown productKey ${o.productKey}`);
    if (!sourceKeys.has(o.sourceKey)) fail(`observation #${idx} unknown sourceKey ${o.sourceKey}`);
    if (!["KG", "PC"].includes(o.unit)) fail(`observation #${idx} unit must be KG or PC`);
    if (!Number.isFinite(o.priceValue) || o.priceValue <= 0) fail(`observation #${idx} invalid priceValue`);
    const d = new Date(o.observedAt);
    if (Number.isNaN(d.getTime())) fail(`observation #${idx} invalid observedAt`);
  }

  console.log(`Snapshot OK: ${filePath}`);
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));

