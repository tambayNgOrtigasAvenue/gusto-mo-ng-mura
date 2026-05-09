"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MarketDto } from "@/lib/repo";
import { NCR_CITIES_MUNICIPALITIES } from "@/lib/ncr";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export function MarketMapClient(props: { markets: MarketDto[]; initialCity?: string | null }) {
  const [city, setCity] = useState<string>(props.initialCity ?? "");
  const [mostVisitedOnly, setMostVisitedOnly] = useState(false);
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const m of props.markets) {
      const raw = window.localStorage.getItem(`gmnm:marketVisit:${m.key}`);
      const n = raw ? Number(raw) : 0;
      if (Number.isFinite(n) && n > 0) counts[m.key] = n;
    }
    return counts;
  });

  useEffect(() => {
    void import("leaflet").then((L) => {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });

    const onStorage = (e: StorageEvent) => {
      if (!e.key || !e.key.startsWith("gmnm:marketVisit:")) return;
      const counts: Record<string, number> = {};
      for (const m of props.markets) {
        const raw = window.localStorage.getItem(`gmnm:marketVisit:${m.key}`);
        const n = raw ? Number(raw) : 0;
        if (Number.isFinite(n) && n > 0) counts[m.key] = n;
      }
      setVisitCounts(counts);
    };
    const onVisits = () =>
      onStorage(new StorageEvent("storage", { key: "gmnm:marketVisit:" }));
    window.addEventListener("storage", onStorage);
    window.addEventListener("gmnm:visits", onVisits);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("gmnm:visits", onVisits);
    };
  }, [props.markets]);

  const filtered = useMemo(() => {
    const byCity = !city
      ? props.markets
      : props.markets.filter((m) => m.cityMunicipality === city);
    if (!mostVisitedOnly) return byCity;
    return byCity
      .slice()
      .sort((a, b) => (visitCounts[b.key] ?? 0) - (visitCounts[a.key] ?? 0))
      .slice(0, 10);
  }, [props.markets, city, mostVisitedOnly, visitCounts]);

  return (
    <div className="rounded-2xl border border-forest/45 bg-forest/25 p-4 backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-mint">Mapa ng mga palengke</h2>
          <p className="mt-1 text-sm text-mint/70">
            I-filter ayon sa lungsod/munisipyo at i-click ang marker para buksan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-mint/90">
            <input
              type="checkbox"
              checked={mostVisitedOnly}
              onChange={(e) => setMostVisitedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-forest/60 bg-ink text-jade focus:ring-jade/50"
            />
            Most visited
          </label>

          <label className="text-sm font-medium text-mint/90">City/Municipality</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-10 rounded-xl border border-forest/50 bg-ink/60 px-3 text-sm text-mint outline-none transition-colors duration-300 focus:border-jade/60 focus:ring-1 focus:ring-jade/40"
          >
            <option value="">All (NCR)</option>
            {NCR_CITIES_MUNICIPALITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="h-[520px] w-full overflow-hidden rounded-xl border border-forest/45">
          <MapContainer
            center={[14.61, 121.03]}
            zoom={11}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filtered.map((m) => (
              <Marker key={m.key} position={[m.lat, m.lng]}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold text-mint">{m.name}</div>
                    <div className="text-mint/75">{m.cityMunicipality}</div>
                    <div className="mt-2">
                      <a
                        href={`/wet-market/${encodeURIComponent(m.key)}`}
                        className="font-semibold text-mint underline decoration-jade/80 underline-offset-2 transition-colors hover:text-jade"
                      >
                        Buksan ang palengke
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="rounded-xl border border-forest/45 bg-ink/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-mint/55">Markets list</p>
          <div className="mt-3 flex max-h-[470px] flex-col gap-2 overflow-auto pr-1">
            {filtered
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((m) => (
                <Link
                  key={m.key}
                  href={`/wet-market/${encodeURIComponent(m.key)}`}
                  className="rounded-xl border border-forest/35 px-3 py-2 text-sm font-medium text-mint transition-all duration-300 hover:border-jade/40 hover:bg-jade/10"
                >
                  <div className="truncate font-semibold">{m.name}</div>
                  <div className="truncate text-xs text-mint/65">{m.cityMunicipality}</div>
                </Link>
              ))}
            {filtered.length === 0 ? (
              <p className="text-sm text-mint/70">No markets match the filter.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-mint/70">
          Showing <span className="font-semibold text-mint">{filtered.length}</span> market(s).
        </p>
        <Link
          href="/wet-market/quiapo-market-manila"
          className="inline-flex rounded-full bg-jade/15 px-4 py-2 text-sm font-semibold text-mint transition-all duration-300 hover:bg-jade/25"
        >
          Sample market page
        </Link>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-mint/55">
          Most visited (this device)
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {props.markets
            .slice()
            .sort((a, b) => (visitCounts[b.key] ?? 0) - (visitCounts[a.key] ?? 0))
            .slice(0, 6)
            .map((m) => (
              <Link
                key={m.key}
                href={`/wet-market/${encodeURIComponent(m.key)}`}
                className="flex items-center justify-between rounded-xl border border-forest/35 px-3 py-2 text-sm font-medium text-mint transition-all duration-300 hover:border-jade/40 hover:bg-jade/10"
              >
                <span className="truncate">{m.name}</span>
                <span className="ml-3 shrink-0 text-xs font-semibold text-mint/55">
                  {visitCounts[m.key] ?? 0}
                </span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
