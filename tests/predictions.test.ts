import { describe, expect, it } from "vitest";
import {
  buildPredictions,
  forecastConfidence,
  forecastDirection,
  PERIODS,
} from "../lib/predictions";
import { buildTrend, matchSignals } from "../lib/scoring";
import { findEntry, type TaxonomyEntry } from "../lib/taxonomy";
import type { Signal } from "../lib/types";

const NOW = new Date("2026-08-20T12:00:00Z");

const sig = (title: string, daysAgo: number): Signal => ({
  id: `t-${title}-${daysAgo}`,
  source: "test:reddit",
  platform: "reddit",
  title,
  url: `https://example.com/${daysAgo}-${encodeURIComponent(title)}`,
  published_at: new Date(NOW.getTime() - daysAgo * 86400000).toISOString(),
  collected_at: NOW.toISOString(),
  region: "US",
  engagement: 100,
  confidence: 0.7,
  data_status: "live",
});

const shortLived: TaxonomyEntry = {
  ...findEntry("butter-yellow")!,
  priors: { ...findEntry("butter-yellow")!.priors, longevity_months: 2, seasonal_months: [] },
};

describe("forecast direction", () => {
  it("declines when lifespan is shorter than the horizon", () => {
    const t = buildTrend(shortLived, [], [], NOW);
    const { direction, reasons } = forecastDirection(shortLived, t, 6, NOW);
    expect(direction).toBe("decline");
    expect(reasons.join(" ")).toContain("lifespan");
  });
  it("rises with strong measured momentum on a low-saturation trend", () => {
    const entry = findEntry("plov-food-content")!;
    const signals = [sig("plov night", 1), sig("plov recipe", 2), sig("best plov", 3), sig("plov asmr", 4)];
    const t = buildTrend(entry, matchSignals(entry, signals), [], NOW);
    expect(forecastDirection(entry, t, 3, NOW).direction).toBe("rise");
  });
});

describe("forecast confidence", () => {
  it("decays with horizon length", () => {
    const entry = findEntry("plov-food-content")!;
    const t = buildTrend(entry, [], [], NOW);
    const confs = PERIODS.map((p) => forecastConfidence(t, p.baseConfidence));
    for (let i = 1; i < confs.length; i++) expect(confs[i]).toBeLessThan(confs[i - 1]);
  });
  it("scales with evidence volume and stays within [0, 0.95]", () => {
    const entry = findEntry("plov-food-content")!;
    const none = buildTrend(entry, [], [], NOW);
    const many = buildTrend(
      entry,
      Array.from({ length: 12 }, (_, i) => sig(`plov post ${i}`, (i % 6) + 1)),
      [],
      NOW,
    );
    expect(forecastConfidence(many, 0.7)).toBeGreaterThan(forecastConfidence(none, 0.7));
    expect(forecastConfidence(many, 0.95)).toBeLessThanOrEqual(0.95);
  });
});

describe("buildPredictions", () => {
  it("produces all four horizons per trend with reasoning and uncertainty language", () => {
    const entry = findEntry("baggy-wide-leg")!;
    const t = buildTrend(entry, [], [], NOW);
    const preds = buildPredictions([t], () => "$36–$48 (tee)", NOW);
    expect(preds).toHaveLength(4);
    expect(new Set(preds.map((p) => p.period))).toEqual(new Set(["30d", "3m", "6m", "12m"]));
    for (const p of preds) {
      expect(p.reasoning.length).toBeGreaterThan(20);
      expect(p.reasoning).toContain("not a guarantee");
      expect(p.confidence).toBeGreaterThan(0);
      expect(p.confidence).toBeLessThanOrEqual(0.95);
    }
  });
  it("uses the price hint and never fabricates a number", () => {
    const entry = findEntry("baggy-wide-leg")!;
    const t = buildTrend(entry, [], [], NOW);
    const preds = buildPredictions([t], () => "Data unavailable", NOW);
    expect(preds[0].target_price).toBe("Data unavailable");
  });
});
