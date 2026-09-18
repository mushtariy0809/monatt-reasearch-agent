import { describe, expect, it } from "vitest";
import {
  dedupeSignals,
  normalizeTitle,
  normalizeUrl,
  signalId,
} from "../lib/dedup";
import type { Signal } from "../lib/types";

const sig = (title: string, url: string, published = "2026-08-10T00:00:00Z", engagement = 10): Signal => ({
  id: signalId(title, url),
  source: "test",
  platform: "reddit",
  title,
  url,
  published_at: published,
  collected_at: "2026-08-20T00:00:00Z",
  region: "US",
  engagement,
  confidence: 0.7,
  data_status: "live",
});

describe("normalization", () => {
  it("normalizes titles ignoring order, case, punctuation and stopwords", () => {
    expect(normalizeTitle("The Baggy Jeans are BACK!")).toBe(
      normalizeTitle("back: baggy jeans"),
    );
  });
  it("strips www, trailing slash and tracking params from URLs", () => {
    expect(normalizeUrl("https://www.example.com/a/?utm_source=x&fbclid=1")).toBe(
      normalizeUrl("https://example.com/a"),
    );
  });
  it("keeps meaningful query params", () => {
    expect(normalizeUrl("https://example.com/a?page=2")).not.toBe(
      normalizeUrl("https://example.com/a"),
    );
  });
});

describe("dedupeSignals", () => {
  it("merges same-URL signals, keeping earliest date and max engagement", () => {
    const existing = [sig("Post about plov", "https://example.com/p1", "2026-08-10T00:00:00Z", 50)];
    const incoming = [sig("Post about plov (updated)", "https://www.example.com/p1/", "2026-08-05T00:00:00Z", 200)];
    const r = dedupeSignals(existing, incoming);
    expect(r.merged).toHaveLength(1);
    expect(r.duplicates).toBe(1);
    expect(r.added).toBe(0);
    expect(r.merged[0].published_at).toBe("2026-08-05T00:00:00Z");
    expect(r.merged[0].engagement).toBe(200);
  });
  it("merges same-title signals from different sources", () => {
    const existing = [sig("Burgundy is the color of fall", "https://a.com/1")];
    const incoming = [sig("burgundy is THE color of fall!", "https://b.com/2")];
    const r = dedupeSignals(existing, incoming);
    expect(r.merged).toHaveLength(1);
    expect(r.duplicates).toBe(1);
  });
  it("adds genuinely new signals", () => {
    const existing = [sig("A story", "https://a.com/1")];
    const incoming = [sig("A completely different story", "https://a.com/2")];
    const r = dedupeSignals(existing, incoming);
    expect(r.merged).toHaveLength(2);
    expect(r.added).toBe(1);
    expect(r.duplicates).toBe(0);
  });
  it("is idempotent across repeated refreshes", () => {
    const batch = [sig("One", "https://a.com/1"), sig("Two", "https://a.com/2")];
    const first = dedupeSignals([], batch);
    const second = dedupeSignals(first.merged, batch);
    expect(second.merged).toHaveLength(2);
    expect(second.added).toBe(0);
    expect(second.duplicates).toBe(2);
  });
});
