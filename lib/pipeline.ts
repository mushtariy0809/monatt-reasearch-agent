// Pipeline: seed → collect → dedupe → score → predict.
// Shared by the manual Refresh button, first-run seeding, and (later) any
// scheduled job — one code path from raw signal to recommendation.

import { runAllConnectors } from "./connectors";
import { pointsForTrend } from "./connectors/google-trends";
import { dedupeSignals } from "./dedup";
import { recommendPrice } from "./pricing";
import { buildPredictions } from "./predictions";
import {
  buildSampleMoments,
  buildSamplePhrases,
  buildSamplePrices,
  buildSampleSignals,
} from "./sample-data";
import { buildTrend, matchSignals } from "./scoring";
import { getDriver } from "./store";
import { TAXONOMY } from "./taxonomy";
import type {
  GoogleTrendsPoint,
  PricePoint,
  RefreshResult,
  Signal,
  Trend,
  TrendCategory,
} from "./types";

const SIGNAL_MAX_AGE_DAYS = 90;

/** Which price-comparable category a trend maps to for price hints. */
const CATEGORY_TO_PRICE: Partial<Record<TrendCategory, string>> = {
  garment: "tee",
  silhouette: "pants",
  color: "tee",
  fabric: "cap",
  graphic: "tee",
  embroidery: "tee",
  accessory: "accessory",
  footwear: "accessory",
  styling: "hoodie",
  aesthetic: "hoodie",
  seasonal: "tee",
  food: "tee",
  cultural: "tee",
  diaspora: "tee",
  phrase: "tee",
  celebrity: "tee",
  event: "tee",
  music: "tee",
  meme: "tee",
};

export function makePriceHint(prices: PricePoint[]): (category: string) => string {
  return (trendCategory: string) => {
    const priceCat =
      CATEGORY_TO_PRICE[trendCategory as TrendCategory] ?? "tee";
    const rec = recommendPrice(prices, priceCat, "mid");
    if (rec.recommended_retail === null) return "Data unavailable";
    return `$${rec.acceptable_range![0]}–$${rec.acceptable_range![1]} (${priceCat})`;
  };
}

/** Recompute all trends and predictions from stored signals. */
export async function recomputeAnalysis(now = new Date()): Promise<{
  trends: Trend[];
  predictionsCount: number;
}> {
  const driver = getDriver();
  const [signals, gtrends, prevTrends, prices] = await Promise.all([
    driver.all<Signal>("signals"),
    driver.all<GoogleTrendsPoint>("gtrends_points"),
    driver.all<Trend>("trends"),
    driver.all<PricePoint>("price_points"),
  ]);
  const prevBySlug = new Map(prevTrends.map((t) => [t.slug, t]));
  const trends = TAXONOMY.map((entry) =>
    buildTrend(
      entry,
      matchSignals(entry, signals),
      pointsForTrend(gtrends, entry.name, entry.keywords),
      now,
      prevBySlug.get(entry.slug),
    ),
  );
  const predictions = buildPredictions(trends, makePriceHint(prices), now);
  await driver.replaceAll("trends", trends);
  await driver.replaceAll("predictions", predictions);
  return { trends, predictionsCount: predictions.length };
}

/** First-run seeding with clearly-labeled sample data. */
export async function ensureSeeded(): Promise<boolean> {
  const driver = getDriver();
  const trends = await driver.all("trends");
  if (trends.length > 0) return false;
  const now = new Date();
  await driver.replaceAll("signals", buildSampleSignals(now));
  await driver.replaceAll("phrases", buildSamplePhrases(now));
  await driver.replaceAll("price_points", buildSamplePrices(now));
  await driver.replaceAll("cultural_moments", buildSampleMoments(now));
  await recomputeAnalysis(now);
  return true;
}

/** Full refresh: run every connector, merge, dedupe, prune, re-score. */
export async function runRefresh(): Promise<RefreshResult> {
  const driver = getDriver();
  const started_at = new Date().toISOString();
  const results = await runAllConnectors();
  const incoming = results.flatMap((r) => r.signals);

  const existing = await driver.all<Signal>("signals");
  // Downgrade previously-live records to "cached" — they were true at
  // collection time but are no longer a fresh observation.
  for (const s of existing) if (s.data_status === "live") s.data_status = "cached";

  const { merged, added, duplicates } = dedupeSignals(existing, incoming);
  const cutoff = Date.now() - SIGNAL_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const pruned = merged.filter(
    (s) => new Date(s.published_at).getTime() >= cutoff,
  );
  await driver.replaceAll("signals", pruned);

  const { predictionsCount, trends } = await recomputeAnalysis(new Date());

  const result: RefreshResult = {
    started_at,
    finished_at: new Date().toISOString(),
    connectors: results.map((r) => ({
      source: r.source,
      ok: r.error === null,
      fetched: r.signals.length,
      error: r.error,
    })),
    new_signals: added,
    duplicates_merged: duplicates,
    trends_updated: trends.length,
    predictions_updated: predictionsCount,
  };
  await driver.setMeta("last_refresh", result);
  return result;
}
