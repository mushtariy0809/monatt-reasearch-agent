// Trend scoring engine.
//
// A trend's 0–100 score blends MEASURED factors (computed from collected
// signals: velocity, cross-platform presence, engagement, search growth)
// with ESTIMATED factors (editorial priors from the taxonomy: diaspora
// relevance, authenticity, commercial potential…). Every component carries
// its own value, weight, provenance kind and plain-language explanation,
// and unavailable measured factors are excluded with weights renormalized —
// never silently defaulted.

import type {
  GoogleTrendsPoint,
  ScoreComponent,
  Signal,
  Trend,
  TrendStatus,
} from "./types";
import type { TaxonomyEntry } from "./taxonomy";

const DAY_MS = 24 * 60 * 60 * 1000;

export const WEIGHTS = {
  growth_velocity: 0.15,
  search_growth: 0.1,
  cross_platform: 0.1,
  engagement: 0.05,
  diaspora_relevance: 0.15,
  genz_relevance: 0.1,
  originality: 0.05,
  cultural_authenticity: 0.05,
  commercial_potential: 0.1,
  seasonal_fit: 0.05,
  market_headroom: 0.05, // inverse of saturation
  longevity: 0.05,
} as const;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Word-boundary, case-insensitive keyword match. */
export function matchesEntry(entry: TaxonomyEntry, text: string): boolean {
  const hay = text.toLowerCase();
  return entry.keywords.some((kw) => {
    const esc = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^\\p{L}\\p{N}'’])${esc}($|[^\\p{L}\\p{N}])`, "u").test(
      ` ${hay} `,
    );
  });
}

export function matchSignals(entry: TaxonomyEntry, signals: Signal[]): Signal[] {
  return signals.filter((s) => matchesEntry(entry, s.title));
}

const ageDays = (iso: string, now: Date) =>
  (now.getTime() - new Date(iso).getTime()) / DAY_MS;

/** Recency weight: full at 0 days, ~0.6 at 7d, ~0.13 at 28d. */
export const recencyWeight = (iso: string, now: Date) =>
  Math.exp(-Math.max(0, ageDays(iso, now)) / 14);

export interface MeasuredMetrics {
  velocity: number | null; // 0–10, null = no evidence
  velocityDetail: string;
  crossPlatform: number;
  platformCount: number;
  engagement: number;
  engagementSum: number;
  searchGrowth: number | null;
  searchDetail: string;
  recentCount: number; // signals in last 7 days
  totalCount: number;
}

export function computeMeasured(
  signals: Signal[],
  gtrends: GoogleTrendsPoint[],
  now: Date,
): MeasuredMetrics {
  const within = (s: Signal, lo: number, hi: number) => {
    const a = ageDays(s.published_at, now);
    return a >= lo && a < hi;
  };
  const recent = signals.filter((s) => within(s, 0, 7)).length;
  const prior = signals.filter((s) => within(s, 7, 28)).length;

  let velocity: number | null = null;
  let velocityDetail = "No collected mentions yet — velocity unavailable.";
  if (signals.length > 0) {
    const priorWeekly = Math.max(prior / 3, 0.5);
    const ratio = recent / priorWeekly;
    velocity = clamp(5 + 2.5 * Math.log2(Math.max(ratio, 0.05)), 0, 10);
    velocityDetail = `${recent} mention(s) in the last 7 days vs ~${(prior / 3).toFixed(1)}/week over the prior 3 weeks (ratio ${ratio.toFixed(2)}).`;
  }

  const platforms = new Set(signals.map((s) => s.platform));
  const pc = platforms.size;
  const crossPlatform = pc === 0 ? 0 : pc === 1 ? 4 : pc === 2 ? 6 : pc === 3 ? 8 : 10;

  const engagementSum = signals.reduce(
    (acc, s) => acc + s.engagement * recencyWeight(s.published_at, now),
    0,
  );
  const engagement = clamp(Math.log10(1 + engagementSum) * 2.5, 0, 10);

  let searchGrowth: number | null = null;
  let searchDetail =
    "No Google Trends data imported for this trend — search growth excluded from the score.";
  if (gtrends.length >= 4) {
    const pts = [...gtrends].sort((a, b) => a.date.localeCompare(b.date));
    const cut = Math.floor(pts.length * 0.67);
    const older = pts.slice(0, cut);
    const newer = pts.slice(cut);
    const mean = (xs: GoogleTrendsPoint[]) =>
      xs.reduce((a, p) => a + p.value, 0) / Math.max(xs.length, 1);
    const mo = mean(older);
    const mn = mean(newer);
    const g = mo > 0 ? mn / mo : mn > 0 ? 2 : 1;
    searchGrowth = clamp(5 + 5 * Math.log2(Math.max(g, 0.1)), 0, 10);
    searchDetail = `Google Trends interest: recent mean ${mn.toFixed(0)} vs earlier mean ${mo.toFixed(0)} (${g >= 1 ? "+" : ""}${(((mn - mo) / Math.max(mo, 1)) * 100).toFixed(0)}%).`;
  }

  return {
    velocity,
    velocityDetail,
    crossPlatform,
    platformCount: pc,
    engagement,
    engagementSum,
    searchGrowth,
    searchDetail,
    recentCount: recent,
    totalCount: signals.length,
  };
}

export function seasonalFit(seasonalMonths: number[], now: Date): { value: number; detail: string } {
  if (seasonalMonths.length === 0)
    return { value: 7, detail: "Year-round trend — no seasonal penalty." };
  const m = now.getMonth() + 1;
  const next = (m % 12) + 1;
  if (seasonalMonths.includes(m))
    return { value: 9, detail: `Currently in its peak season (month ${m}).` };
  if (seasonalMonths.includes(next))
    return { value: 7, detail: "Peak season starts next month — build-up window." };
  return { value: 3, detail: "Currently out of season." };
}

export function longevityValue(months: number): number {
  return months >= 24 ? 9 : months >= 12 ? 7 : months >= 6 ? 5 : 3;
}

export function buildComponents(
  entry: TaxonomyEntry,
  m: MeasuredMetrics,
  now: Date,
): ScoreComponent[] {
  const p = entry.priors;
  const season = seasonalFit(p.seasonal_months, now);
  const est = (key: string, label: string, value: number, weight: number, explanation: string): ScoreComponent => ({
    key, label, value, weight, kind: "estimated",
    explanation: `${explanation} (editorial estimate — see taxonomy rationale)`,
  });
  return [
    {
      key: "growth_velocity", label: "Growth velocity",
      value: m.velocity ?? 0, weight: WEIGHTS.growth_velocity, kind: "measured",
      explanation: m.velocityDetail, unavailable: m.velocity === null,
    },
    {
      key: "search_growth", label: "Search growth",
      value: m.searchGrowth ?? 0, weight: WEIGHTS.search_growth, kind: "measured",
      explanation: m.searchDetail, unavailable: m.searchGrowth === null,
    },
    {
      key: "cross_platform", label: "Cross-platform presence",
      value: m.crossPlatform, weight: WEIGHTS.cross_platform, kind: "measured",
      explanation: `Seen on ${m.platformCount} distinct platform(s).`,
      unavailable: m.totalCount === 0,
    },
    {
      key: "engagement", label: "Engagement",
      value: m.engagement, weight: WEIGHTS.engagement, kind: "measured",
      explanation: `Recency-weighted engagement across mentions: ${Math.round(m.engagementSum)}.`,
      unavailable: m.totalCount === 0,
    },
    est("diaspora_relevance", "Uzbek diaspora relevance", p.diaspora_relevance, WEIGHTS.diaspora_relevance,
      "How directly this speaks to Uzbek/Central Asian Gen Z abroad."),
    est("genz_relevance", "Wider Gen Z relevance", p.genz_relevance, WEIGHTS.genz_relevance,
      "Appeal beyond the diaspora audience."),
    est("originality", "Originality headroom", p.originality, WEIGHTS.originality,
      "Room for an original Monatt take nobody else is doing."),
    est("cultural_authenticity", "Cultural authenticity", p.cultural_authenticity, WEIGHTS.cultural_authenticity,
      "How credibly Monatt can own this without costume risk."),
    est("commercial_potential", "Commercial potential", p.commercial_potential, WEIGHTS.commercial_potential,
      "Likelihood this converts to sellable product at target prices."),
    {
      key: "seasonal_fit", label: "Seasonal fit",
      value: season.value, weight: WEIGHTS.seasonal_fit, kind: "estimated",
      explanation: season.detail,
    },
    est("market_headroom", "Market headroom", 10 - p.saturation, WEIGHTS.market_headroom,
      `Inverse of saturation (${p.saturation}/10 saturated).`),
    est("longevity", "Estimated longevity", longevityValue(p.longevity_months), WEIGHTS.longevity,
      `Editorial lifespan estimate: ~${p.longevity_months} months.`),
  ];
}

export function totalScore(components: ScoreComponent[]): number {
  const avail = components.filter((c) => !c.unavailable);
  const wSum = avail.reduce((a, c) => a + c.weight, 0);
  if (wSum === 0) return 0;
  const s = avail.reduce((a, c) => a + (c.value / 10) * c.weight, 0) / wSum;
  return Math.round(clamp(s, 0, 1) * 100);
}

export function deriveStatus(
  entry: TaxonomyEntry,
  m: MeasuredMetrics,
): { status: TrendStatus; reason: string } {
  const sat = entry.priors.saturation;
  if (m.velocity !== null) {
    if (m.velocity >= 7 && sat <= 4 && m.totalCount < 8)
      return { status: "emerging", reason: "High measured velocity on a low-saturation trend with a still-small evidence base." };
    if (m.velocity >= 6)
      return { status: "growing", reason: "Measured mention velocity is accelerating week-over-week." };
    if (sat >= 8)
      return { status: "saturated", reason: "Mentions steady but the market is editorially rated near-saturated." };
    if (m.velocity < 4)
      return { status: "declining", reason: "Measured mentions are slowing versus the prior three weeks." };
    return { status: "peaking", reason: "Velocity flat at meaningful volume — likely at or near peak." };
  }
  // No measured evidence — fall back to editorial priors, and say so.
  if (sat >= 8) return { status: "saturated", reason: "No collected evidence; editorial saturation estimate is high." };
  if (sat >= 6) return { status: "peaking", reason: "No collected evidence; editorial estimate is late-cycle." };
  if (sat <= 3 && entry.priors.diaspora_relevance >= 8)
    return { status: "emerging", reason: "No collected evidence yet; editorially rated early and highly diaspora-relevant." };
  return { status: "growing", reason: "No collected evidence; editorial estimate is mid-cycle." };
}

export function explainScore(components: ScoreComponent[], score: number): string {
  const avail = components.filter((c) => !c.unavailable);
  const sorted = [...avail].sort(
    (a, b) => (b.value / 10) * b.weight - (a.value / 10) * a.weight,
  );
  const top = sorted.slice(0, 3).map((c) => `${c.label} (${c.value.toFixed(1)}/10)`);
  const drags = avail.filter((c) => c.value <= 4).map((c) => `${c.label} (${c.value.toFixed(1)}/10)`);
  const missing = components.filter((c) => c.unavailable).map((c) => c.label);
  let s = `Score ${score}/100 — driven mainly by ${top.join(", ")}.`;
  if (drags.length) s += ` Held back by ${drags.join(", ")}.`;
  if (missing.length) s += ` Not yet measurable: ${missing.join(", ")} (excluded, weights renormalized).`;
  s += " Measured factors come from collected data; estimated factors are editorial interpretation.";
  return s;
}

export function lifespanText(months: number): string {
  if (months >= 36) return "3+ years (durable brand code)";
  if (months >= 24) return "~2 years";
  if (months >= 12) return "~12–18 months";
  if (months >= 6) return "~6–12 months";
  return "under 6 months (act fast or skip)";
}

/** Build a full Trend record from a taxonomy entry + its matched evidence. */
export function buildTrend(
  entry: TaxonomyEntry,
  matched: Signal[],
  gtrends: GoogleTrendsPoint[],
  now: Date,
  prev?: Trend,
): Trend {
  const m = computeMeasured(matched, gtrends, now);
  const components = buildComponents(entry, m, now);
  const score = totalScore(components);
  const { status, reason } = deriveStatus(entry, m);
  // Real observations always outrank sample rows, regardless of the
  // illustrative engagement numbers sample data carries.
  const provenanceRank: Record<string, number> = { live: 3, cached: 2, manual: 2, sample: 0, ai: 0 };
  const evidence = [...matched]
    .sort(
      (a, b) =>
        (provenanceRank[b.data_status] ?? 0) - (provenanceRank[a.data_status] ?? 0) ||
        b.engagement * recencyWeight(b.published_at, now) -
          a.engagement * recencyWeight(a.published_at, now),
    )
    .slice(0, 8)
    .map((s) => ({
      title: s.title,
      url: s.url,
      platform: s.platform,
      published_at: s.published_at,
      engagement: s.engagement,
      data_status: s.data_status,
    }));
  const statuses = new Set(matched.map((s) => s.data_status));
  const data_status = statuses.has("live")
    ? ("live" as const)
    : statuses.has("cached")
      ? ("cached" as const)
      : statuses.has("manual")
        ? ("manual" as const)
        : ("sample" as const);
  return {
    slug: entry.slug,
    name: entry.name,
    category: entry.category,
    description: entry.description,
    status,
    score,
    score_components: components,
    score_explanation: `${explainScore(components, score)} Status: ${status} — ${reason}`,
    regions: entry.regions,
    audience: entry.audience,
    platforms: [...new Set(matched.map((s) => s.platform))],
    evidence_count: matched.length,
    evidence,
    first_seen: prev?.first_seen ?? now.toISOString(),
    last_updated: now.toISOString(),
    estimated_lifespan: lifespanText(entry.priors.longevity_months),
    cultural_relevance: entry.cultural_relevance,
    commercial_opportunity: entry.commercial_opportunity,
    risks: entry.risks,
    recommended_action: entry.recommended_action,
    data_status,
  };
}
