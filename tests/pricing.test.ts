import { describe, expect, it } from "vitest";
import {
  computeStats,
  effectiveUSD,
  median,
  MIN_COMPARABLES,
  recommendPrice,
  toUSD,
} from "../lib/pricing";
import type { PricePoint } from "../lib/types";

const pp = (usd: number, category = "tee", sale: number | null = null, status: PricePoint["data_status"] = "manual"): PricePoint => ({
  id: `p-${category}-${usd}-${sale}`,
  brand: "Test",
  product: "Item",
  category,
  listed_price: usd,
  sale_price: sale,
  currency: "USD",
  usd_price: usd,
  material: null,
  url: null,
  checked_at: "2026-08-20T00:00:00Z",
  data_status: status,
});

describe("currency conversion", () => {
  it("converts known currencies", () => {
    expect(toUSD(100, "USD")).toBe(100);
    expect(toUSD(100, "gbp")).toBeCloseTo(127, 0);
  });
  it("returns null for unknown currencies instead of guessing", () => {
    expect(toUSD(100, "JPY")).toBeNull();
  });
});

describe("median and stats", () => {
  it("computes odd and even medians", () => {
    expect(median([1, 3, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
  it("uses sale price when present", () => {
    expect(effectiveUSD(pp(40, "tee", 30))).toBe(30);
    expect(effectiveUSD(pp(40))).toBe(40);
  });
  it("computes stats per category", () => {
    const points = [pp(30), pp(40), pp(50), pp(100, "hoodie")];
    const s = computeStats(points, "tee")!;
    expect(s.count).toBe(3);
    expect(s.low).toBe(30);
    expect(s.high).toBe(50);
    expect(s.median).toBe(40);
    expect(s.average).toBe(40);
  });
  it("returns null for empty categories", () => {
    expect(computeStats([], "tee")).toBeNull();
  });
});

describe("recommendations", () => {
  it("never invents a price below the comparables threshold", () => {
    const r = recommendPrice([pp(40), pp(42)], "tee");
    expect(MIN_COMPARABLES).toBe(3);
    expect(r.recommended_retail).toBeNull();
    expect(r.acceptable_range).toBeNull();
    expect(r.cost_target).toBeNull();
    expect(r.explanation).toContain("Data unavailable");
  });
  it("anchors mid-tier between median and average, within the observed range", () => {
    const points = [pp(36), pp(40), pp(44), pp(48)];
    const r = recommendPrice(points, "tee", "mid");
    expect(r.recommended_retail).toBe(42); // (median 42 + avg 42)/2
    expect(r.recommended_retail!).toBeGreaterThanOrEqual(36);
    expect(r.recommended_retail!).toBeLessThanOrEqual(48);
    expect(r.cost_target).toBe(Math.round(42 * 0.3));
    expect(r.acceptable_range![0]).toBeLessThan(r.acceptable_range![1]);
  });
  it("prices tiers in the right order", () => {
    const points = [pp(36), pp(40), pp(44), pp(48), pp(52)];
    const acc = recommendPrice(points, "tee", "accessible").recommended_retail!;
    const mid = recommendPrice(points, "tee", "mid").recommended_retail!;
    const prem = recommendPrice(points, "tee", "premium").recommended_retail!;
    expect(acc).toBeLessThan(mid);
    expect(mid).toBeLessThan(prem);
  });
  it("flags sample data in the explanation", () => {
    const points = [pp(36, "tee", null, "sample"), pp(40, "tee", null, "sample"), pp(44, "tee", null, "sample")];
    const r = recommendPrice(points, "tee");
    expect(r.data_status).toBe("sample");
    expect(r.explanation).toContain("SAMPLE");
  });
});
