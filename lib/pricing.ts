// Price intelligence: market stats and Monatt price recommendations.
//
// Rules, stated openly:
// - The "effective" price of a comparable is its sale price when on sale,
//   otherwise its list price, converted to USD.
// - Recommendations need >= MIN_COMPARABLES points, otherwise every derived
//   field is null and the UI shows "Data unavailable". Prices are never invented.
// - Mid-tier positioning (chosen during scoping): recommend between market
//   median and average, clamped to the observed range; acceptable customer
//   range is median ±15%; production-cost target is 30% of retail
//   (a typical direct-to-consumer streetwear gross-margin structure).

import type { PricePoint, PriceRecommendation, PriceStats } from "./types";

export const MIN_COMPARABLES = 3;

/**
 * Static fallback FX rates, used ONLY to normalize manually-entered
 * non-USD comparables for display. Clearly approximate; the UI labels
 * converted values. Update in this file or wire a live FX API later.
 */
export const APPROX_USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.09,
  GBP: 1.27,
  CAD: 0.73,
  UZS: 0.000079,
};

export function toUSD(amount: number, currency: string): number | null {
  const rate = APPROX_USD_RATES[currency.toUpperCase()];
  if (rate === undefined) return null;
  return Math.round(amount * rate * 100) / 100;
}

export function effectiveUSD(p: PricePoint): number {
  // usd_price is stored at entry time; sale price wins when present.
  if (p.sale_price !== null && p.currency.toUpperCase() === "USD")
    return p.sale_price;
  if (p.sale_price !== null) {
    const c = toUSD(p.sale_price, p.currency);
    if (c !== null) return c;
  }
  return p.usd_price;
}

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function computeStats(points: PricePoint[], category?: string): PriceStats | null {
  const pool = category ? points.filter((p) => p.category === category) : points;
  if (pool.length === 0) return null;
  const prices = pool.map(effectiveUSD);
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    category: category ?? "all",
    count: pool.length,
    low: r2(Math.min(...prices)),
    average: r2(prices.reduce((a, b) => a + b, 0) / prices.length),
    median: r2(median(prices)),
    high: r2(Math.max(...prices)),
  };
}

export type PriceTier = "accessible" | "mid" | "premium";

export function recommendPrice(
  points: PricePoint[],
  category: string,
  tier: PriceTier = "mid",
): PriceRecommendation {
  const stats = computeStats(points, category);
  if (!stats || stats.count < MIN_COMPARABLES) {
    return {
      category,
      recommended_retail: null,
      acceptable_range: null,
      cost_target: null,
      explanation: `Data unavailable — only ${stats?.count ?? 0} comparable price point(s) for "${category}" (need ${MIN_COMPARABLES}+). Add comparables in the Price Tracker.`,
      based_on: stats?.count ?? 0,
      data_status: "live",
    };
  }
  const anchor =
    tier === "accessible"
      ? stats.median * 0.85
      : tier === "premium"
        ? stats.median * 1.25
        : (stats.median + stats.average) / 2;
  const clamped = Math.min(Math.max(anchor, stats.low), stats.high);
  const rec = Math.round(clamped);
  const range: [number, number] = [
    Math.round(stats.median * 0.85),
    Math.round(stats.median * 1.15),
  ];
  const cost = Math.round(rec * 0.3);
  const statuses = new Set(
    points.filter((p) => p.category === category).map((p) => p.data_status),
  );
  return {
    category,
    recommended_retail: rec,
    acceptable_range: range,
    cost_target: cost,
    explanation:
      `Based on ${stats.count} comparables (${stats.low}–${stats.high} USD, median ${stats.median}). ` +
      `${tier}-tier positioning anchors ${tier === "mid" ? "between median and average" : tier === "accessible" ? "at ~85% of median" : "at ~125% of median"}, giving $${rec}. ` +
      `Customers anchored to this market are likely to accept $${range[0]}–$${range[1]}. ` +
      `Target landed production cost ≤ $${cost} (~30% of retail) for a healthy DTC margin.` +
      (statuses.has("sample")
        ? " ⚠ Includes SAMPLE comparables — replace with checked prices before pricing real products."
        : ""),
    based_on: stats.count,
    data_status: statuses.has("sample") ? "sample" : statuses.has("manual") ? "manual" : "live",
  };
}
