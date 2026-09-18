// Weekly Monatt Intelligence Brief builder.
// Structure is assembled by transparent rules over current data; the
// narrative paragraph is AI-written only when a key is configured (labeled).

import { askClaudeText } from "./ai";
import { hashString } from "./dedup";
import { recommendPrice } from "./pricing";
import { findEntry } from "./taxonomy";
import type {
  CulturalMoment,
  Prediction,
  PricePoint,
  Trend,
  WeeklyBrief,
} from "./types";

function velocityOf(t: Trend): number | null {
  const c = t.score_components.find((x) => x.key === "growth_velocity");
  return c && !c.unavailable ? c.value : null;
}

export async function buildWeeklyBrief(
  trends: Trend[],
  predictions: Prediction[],
  moments: CulturalMoment[],
  prices: PricePoint[],
): Promise<WeeklyBrief> {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const week_of = monday.toISOString().slice(0, 10);

  const withVelocity = trends
    .map((t) => ({ t, v: velocityOf(t) }))
    .filter((x) => x.v !== null) as { t: Trend; v: number }[];

  const rising = [...withVelocity]
    .sort((a, b) => b.v - a.v || b.t.score - a.t.score)
    .slice(0, 5)
    .map(({ t, v }) => ({
      name: t.name,
      slug: t.slug,
      score: t.score,
      reason: `Velocity ${v.toFixed(1)}/10, ${t.evidence_count} mention(s), status: ${t.status}.`,
    }));

  const declining = [...trends]
    .filter((t) => t.status === "declining" || (velocityOf(t) ?? 5) < 4)
    .sort((a, b) => (velocityOf(a) ?? 5) - (velocityOf(b) ?? 5))
    .slice(0, 3)
    .map((t) => ({
      name: t.name,
      slug: t.slug,
      score: t.score,
      reason: `Status ${t.status}; ${t.score_explanation.split(" Status:")[1] ?? "momentum slowing."}`,
    }));

  const cultural_signals = moments
    .filter((m) => m.opportunity === "organic" || m.opportunity === "short-term")
    .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"))
    .slice(0, 5)
    .map((m) => ({ title: m.title, why: m.relevance }));

  const product_opportunities = [...trends]
    .map((t) => ({ t, e: findEntry(t.slug) }))
    .filter((x) => x.e)
    .sort(
      (a, b) =>
        b.e!.priors.commercial_potential * b.t.score -
        a.e!.priors.commercial_potential * a.t.score,
    )
    .slice(0, 3)
    .map(({ t }) => ({ name: t.name, why: t.commercial_opportunity }));

  const price_notes = ["tee", "hoodie", "cap"].map((c) => {
    const r = recommendPrice(prices, c, "mid");
    return r.recommended_retail
      ? `${c}: recommend $${r.recommended_retail} (market median-based, ${r.based_on} comparables${r.data_status === "sample" ? " — SAMPLE data" : ""})`
      : `${c}: Data unavailable (${r.based_on} comparables)`;
  });

  const capsuleTrends = rising.slice(0, 3);
  const capsule = {
    name: `${["Autumn", "Autumn", "Winter", "Winter", "Spring", "Spring", "Summer", "Summer", "Autumn", "Autumn", "Winter", "Winter"][now.getMonth()]} capsule sketch`,
    pieces: capsuleTrends.map(
      (r) => `${r.name} — see the Outfit Generator for a full concept`,
    ),
    rationale:
      "Combines this week's three fastest-rising trends into one coherent drop; validate each piece against its risks before design.",
  };

  const emerging = [...trends]
    .filter((t) => t.status === "emerging" || t.status === "growing")
    .map((t) => ({ t, e: findEntry(t.slug) }))
    .filter((x) => x.e && x.e.priors.saturation <= 4)
    .sort((a, b) => b.t.score - a.t.score)[0];
  const p30 = predictions.filter((p) => p.period === "3m" && p.trend_slug === emerging?.t.slug)[0];
  const next_trend = emerging
    ? {
        name: emerging.t.name,
        reasoning:
          p30?.reasoning ??
          `Highest-scoring low-saturation trend (${emerging.t.score}/100, status ${emerging.t.status}).`,
        confidence: p30?.confidence ?? 0.5,
      }
    : { name: "Insufficient data", reasoning: "No emerging trend passed the filter this week.", confidence: 0 };

  const evidence_links = trends
    .flatMap((t) => t.evidence.filter((e) => e.data_status === "live" && e.url))
    .slice(0, 5)
    .map((e) => ({ title: e.title, url: e.url }));

  const conf30 = predictions.filter((p) => p.period === "30d");
  const confidence =
    conf30.length > 0
      ? Math.round((conf30.reduce((a, p) => a + p.confidence, 0) / conf30.length) * 100) / 100
      : 0.4;

  const next_actions = [
    ...rising.slice(0, 3).map((r) => {
      const t = trends.find((x) => x.slug === r.slug);
      return t ? `${t.name}: ${t.recommended_action}` : "";
    }),
    "Refresh sources before finalizing any design decision.",
    "Replace remaining SAMPLE price comparables with checked prices.",
  ].filter(Boolean);

  let narrative: string | null = null;
  let narrative_by: "ai" | null = null;
  const { text } = await askClaudeText(
    `Write a tight 150-word weekly intelligence narrative for the Monatt team. Data:
Rising: ${rising.map((r) => r.name).join("; ")}
Declining: ${declining.map((d) => d.name).join("; ")}
Cultural: ${cultural_signals.map((c) => c.title).join("; ")}
Predicted next: ${next_trend.name}
Tone: sharp, specific, no hype. Plain prose, no headers.`,
  );
  if (text) {
    narrative = text;
    narrative_by = "ai";
  }

  const hasLive = trends.some((t) => t.data_status === "live" || t.data_status === "cached");
  return {
    id: hashString(`brief-${now.toISOString()}`),
    week_of,
    generated_at: now.toISOString(),
    rising,
    declining,
    cultural_signals,
    product_opportunities,
    price_notes,
    capsule,
    next_trend,
    evidence_links,
    confidence,
    next_actions,
    narrative,
    narrative_by,
    data_status: hasLive ? "ai" : "sample",
  };
}
