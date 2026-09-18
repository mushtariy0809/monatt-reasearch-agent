import { describe, expect, it } from "vitest";
import {
  buildComponents,
  buildTrend,
  computeMeasured,
  deriveStatus,
  matchesEntry,
  seasonalFit,
  totalScore,
} from "../lib/scoring";
import { TAXONOMY, findEntry } from "../lib/taxonomy";
import type { Signal } from "../lib/types";

const NOW = new Date("2026-08-20T12:00:00Z");

const sig = (title: string, daysAgo: number, platform: Signal["platform"] = "reddit", engagement = 100): Signal => ({
  id: `t-${title}-${daysAgo}`,
  source: `test:${platform}`,
  platform,
  title,
  url: `https://example.com/${daysAgo}-${title.replace(/\s/g, "-")}`,
  published_at: new Date(NOW.getTime() - daysAgo * 86400000).toISOString(),
  collected_at: NOW.toISOString(),
  region: "US",
  engagement,
  confidence: 0.7,
  data_status: "live",
});

describe("keyword matching", () => {
  const plov = findEntry("plov-food-content")!;
  it("matches whole words only", () => {
    expect(matchesEntry(plov, "best osh recipe in Tashkent")).toBe(true);
    // "osh" must not match inside "Josh"
    expect(matchesEntry(plov, "Josh reviews streetwear")).toBe(false);
  });
  it("is case-insensitive and handles multi-word keywords", () => {
    const baggy = findEntry("baggy-wide-leg")!;
    expect(matchesEntry(baggy, "WIDE-LEG trousers are back")).toBe(true);
    expect(matchesEntry(baggy, "wideleg trousers")).toBe(false);
  });
});

describe("measured metrics", () => {
  it("computes rising velocity when recent mentions outpace prior weeks", () => {
    const signals = [sig("a", 1), sig("b", 2), sig("c", 3), sig("d", 5), sig("old", 20)];
    const m = computeMeasured(signals, [], NOW);
    expect(m.velocity).not.toBeNull();
    expect(m.velocity!).toBeGreaterThan(6);
    expect(m.recentCount).toBe(4);
  });
  it("computes declining velocity when mentions are only old", () => {
    const signals = [sig("a", 15), sig("b", 20), sig("c", 25)];
    const m = computeMeasured(signals, [], NOW);
    expect(m.velocity!).toBeLessThan(4);
  });
  it("returns null velocity with no signals", () => {
    const m = computeMeasured([], [], NOW);
    expect(m.velocity).toBeNull();
    expect(m.crossPlatform).toBe(0);
  });
  it("counts distinct platforms", () => {
    const m = computeMeasured(
      [sig("a", 1, "reddit"), sig("b", 1, "rss"), sig("c", 1, "tiktok")],
      [],
      NOW,
    );
    expect(m.platformCount).toBe(3);
    expect(m.crossPlatform).toBe(8);
  });
});

describe("score assembly", () => {
  const entry = TAXONOMY[0];
  it("keeps total in 0–100 and renormalizes when measured factors are unavailable", () => {
    const none = buildComponents(entry, computeMeasured([], [], NOW), NOW);
    const score = totalScore(none);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
    // Unavailable components must be flagged
    expect(none.find((c) => c.key === "growth_velocity")!.unavailable).toBe(true);
  });
  it("marks priors as estimated and measured factors as measured", () => {
    const comps = buildComponents(entry, computeMeasured([sig("baggy jeans fit", 1)], [], NOW), NOW);
    expect(comps.find((c) => c.key === "diaspora_relevance")!.kind).toBe("estimated");
    expect(comps.find((c) => c.key === "growth_velocity")!.kind).toBe("measured");
  });
  it("weights sum to 1", () => {
    const comps = buildComponents(entry, computeMeasured([], [], NOW), NOW);
    const sum = comps.reduce((a, c) => a + c.weight, 0);
    expect(sum).toBeCloseTo(1, 5);
  });
});

describe("status derivation", () => {
  const entry = findEntry("baggy-wide-leg")!;
  it("declining on low measured velocity", () => {
    const m = computeMeasured([sig("baggy jeans", 20), sig("baggy denim", 25)], [], NOW);
    expect(deriveStatus(entry, m).status).toBe("declining");
  });
  it("growing on high velocity", () => {
    const m = computeMeasured(
      [sig("baggy jeans a", 1), sig("baggy jeans b", 2), sig("baggy jeans c", 3), sig("baggy jeans d", 4)],
      [],
      NOW,
    );
    expect(["growing", "emerging"]).toContain(deriveStatus(entry, m).status);
  });
});

describe("seasonality", () => {
  it("year-round trends get a neutral 7", () => {
    expect(seasonalFit([], NOW).value).toBe(7);
  });
  it("in-season months score high", () => {
    expect(seasonalFit([8], NOW).value).toBe(9); // August
  });
  it("out-of-season months score low", () => {
    expect(seasonalFit([2], NOW).value).toBe(3);
  });
});

describe("buildTrend", () => {
  it("produces a live-status trend from live evidence and caps evidence at 8", () => {
    const entry = findEntry("baggy-wide-leg")!;
    const signals = Array.from({ length: 12 }, (_, i) => sig(`baggy jeans post ${i}`, i + 1));
    const t = buildTrend(entry, signals, [], NOW);
    expect(t.data_status).toBe("live");
    expect(t.evidence.length).toBeLessThanOrEqual(8);
    expect(t.evidence_count).toBe(12);
    expect(t.score).toBeGreaterThan(0);
    expect(t.score_explanation).toContain("Score");
  });
});
