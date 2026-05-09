"use client";

import { useEffect } from "react";

export function MarketVisitTracker(props: { marketKey: string }) {
  useEffect(() => {
    const key = `gmnm:marketVisit:${props.marketKey}`;
    const raw = window.localStorage.getItem(key);
    const prev = raw ? Number(raw) : 0;
    const next = Number.isFinite(prev) && prev > 0 ? prev + 1 : 1;
    window.localStorage.setItem(key, String(next));
    window.dispatchEvent(new Event("gmnm:visits"));
  }, [props.marketKey]);

  return null;
}

