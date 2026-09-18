// Rule-based trend forecasting.
//
// Every prediction is derived from stated, inspectable rules over the
// trend's measured momentum, editorial saturation/longevity priors, and
// seasonality relative to the forecast horizon. Confidence decays with
// horizon length and scales with evidence volume. Predictions are labeled
// as model output — they are evidence-based estimates, never guarantees.

import type {
  Direction,
  ForecastPeriod,
  Prediction,
  Trend,
} from "./types";
import { findEntry, type TaxonomyEntry } from "./taxonomy";

export const PERIODS: { period: ForecastPeriod; months: number; baseConfidence: number }[] = [
  { period: "30d", months: 1, baseConfidence: 0.7 },
  { period: "3m", months: 3, baseConfidence: 0.6 },
  { period: "6m", months: 6, baseConfidence: 0.45 },
  { period: "12m", months: 12, baseConfidence: 0.3 },
];

function componentValue(trend: Trend, key: string): number | null {
  const c = trend.score_components.find((x) => x.key === key);
  if (!c || c.unavailable) return null;
  return c.value;
}

export function forecastDirection(
  entry: TaxonomyEntry,
  trend: Trend,
  months: number,
  now: Date,
): { direction: Direction; reasons: string[] } {
  const reasons: string[] = [];
  const velocity = componentValue(trend, "growth_velocity");
  const sat = entry.priors.saturation;
  const life = entry.priors.longevity_months;

  let signal = 0;

  if (velocity !== null) {
    signal += (velocity - 5) * 0.6;
    reasons.push(
      velocity >= 6
        ? `Measured momentum is positive (velocity ${velocity.toFixed(1)}/10).`
        : velocity < 4
          ? `Measured momentum is negative (velocity ${velocity.toFixed(1)}/10).`
          : `Measured momentum is flat (velocity ${velocity.toFixed(1)}/10).`,
    );
  } else {
    reasons.push("No measured momentum — forecast rests on editorial priors only (lower confidence).");
  }

  if (life < months) {
    signal -= 2.5;
    reasons.push(`Estimated remaining lifespan (~${life}mo) is shorter than the ${months}-month horizon.`);
  } else if (life > months * 2) {
    signal += 0.5;
    reasons.push("Estimated lifespan comfortably exceeds the horizon.");
  }

  if (sat >= 7) {
    signal -= months >= 6 ? 2 : 1;
    reasons.push(`High saturation (${sat}/10) weighs on the ${months >= 6 ? "longer" : ""} horizon.`);
  } else if (sat <= 3) {
    signal += 1;
    reasons.push(`Low saturation (${sat}/10) leaves headroom to grow.`);
  }

  const seasonal = entry.priors.seasonal_months;
  if (seasonal.length > 0) {
    const target = ((now.getMonth() + months) % 12) + 1;
    if (seasonal.includes(target)) {
      signal += 1.5;
      reasons.push(`Forecast window lands in the trend's peak season (month ${target}).`);
    } else {
      signal -= 1;
      reasons.push(`Forecast window lands out of season (month ${target}).`);
    }
  }

  const direction: Direction = signal > 0.75 ? "rise" : signal < -0.75 ? "decline" : "hold";
  return { direction, reasons };
}

export function forecastConfidence(
  trend: Trend,
  base: number,
): number {
  // Evidence factor: 0.7 with no evidence → 1.0 at 10+ signals.
  const evidenceFactor = 0.7 + 0.3 * Math.min(trend.evidence_count / 10, 1);
  // Multi-platform corroboration adds a little.
  const platformFactor = 1 + Math.min(trend.platforms.length, 3) * 0.03;
  return Math.round(Math.min(base * evidenceFactor * platformFactor, 0.95) * 100) / 100;
}

export function buildPredictions(
  trends: Trend[],
  priceHint: (category: string) => string,
  now: Date = new Date(),
): Prediction[] {
  const out: Prediction[] = [];
  for (const trend of trends) {
    const entry = findEntry(trend.slug);
    if (!entry) continue;
    const velocity = componentValue(trend, "growth_velocity");
    for (const { period, months, baseConfidence } of PERIODS) {
      const { direction, reasons } = forecastDirection(entry, trend, months, now);
      const confidence = forecastConfidence(trend, baseConfidence);
      const evidence_summary =
        trend.evidence_count > 0
          ? `${trend.evidence_count} collected mention(s) across ${trend.platforms.length} platform(s); latest: "${trend.evidence[0]?.title ?? ""}"`
          : "No collected mentions yet — editorial priors only.";
      out.push({
        id: `${trend.slug}:${period}`,
        trend_slug: trend.slug,
        trend_name: trend.name,
        category: trend.category,
        evidence_summary,
        region: trend.regions.join(", "),
        audience_fit: entry.priors.genz_relevance,
        cultural_fit: entry.priors.cultural_authenticity,
        momentum: velocity ?? 5,
        saturation: entry.priors.saturation,
        direction,
        period,
        confidence,
        reasoning:
          reasons.join(" ") +
          ` Confidence ${Math.round(confidence * 100)}% — decays with horizon length and scales with evidence volume. This is a model estimate, not a guarantee.`,
        suggested_product: entry.commercial_opportunity.split(/(?<=\.)\s/)[0],
        target_price: priceHint(trend.category),
        commercial_potential: entry.priors.commercial_potential,
        risks: entry.risks,
        recommended_action: entry.recommended_action,
        generated_at: now.toISOString(),
        data_status: trend.data_status === "sample" ? "sample" : "ai",
      });
    }
  }
  return out;
}
