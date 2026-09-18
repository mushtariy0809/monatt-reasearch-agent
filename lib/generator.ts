// Outfit & product concept generator.
//
// With an Anthropic key: Claude writes original concepts from the selected
// trends, under the brand guardrails in lib/ai.ts (labeled "ai").
// Without a key: a transparent rule-based composer assembles concepts from
// the taxonomy's own commercial notes (labeled "rules"). Neither path ever
// copies an existing product; both surface cultural-sensitivity notes.

import { askClaudeJSON, aiAvailable } from "./ai";
import { hashString } from "./dedup";
import { recommendPrice } from "./pricing";
import { findEntry } from "./taxonomy";
import type { PricePoint, ProductIdea, Trend } from "./types";

export interface GenerateOptions {
  category: string; // tee | hoodie | crewneck | cap | jacket | pants | accessory
  trendSlugs: string[];
  season: string; // e.g. "Autumn/Winter 2026"
  count: number;
}

const TIER_DEFAULTS: Record<string, { retail: number; note: string }> = {
  tee: { retail: 42, note: "mid-tier default for a heavyweight tee" },
  crewneck: { retail: 64, note: "mid-tier default for a fleece crewneck" },
  hoodie: { retail: 74, note: "mid-tier default for a heavyweight hoodie" },
  cap: { retail: 34, note: "mid-tier default for an embroidered cap" },
  jacket: { retail: 120, note: "mid-tier default for outerwear" },
  pants: { retail: 92, note: "mid-tier default for bottoms" },
  accessory: { retail: 28, note: "mid-tier default for accessories" },
};

function priceFor(category: string, prices: PricePoint[]): { retail: number; source: string } {
  const rec = recommendPrice(prices, category, "mid");
  if (rec.recommended_retail !== null)
    return {
      retail: rec.recommended_retail,
      source: `market comparables (${rec.based_on} points${rec.data_status === "sample" ? ", includes SAMPLE data" : ""})`,
    };
  const d = TIER_DEFAULTS[category] ?? TIER_DEFAULTS.tee;
  return { retail: d.retail, source: `${d.note} — no comparables available` };
}

const CATEGORY_COLORS: Record<string, string[]> = {
  color: ["trend accent on cream", "trend accent on black"],
  default: ["black", "cream", "charcoal", "Uzbek blue accent"],
};

function ruleBasedIdeas(
  opts: GenerateOptions,
  trends: Trend[],
  prices: PricePoint[],
): ProductIdea[] {
  const now = new Date().toISOString();
  const { retail, source } = priceFor(opts.category, prices);
  return trends.slice(0, opts.count).map((trend, i) => {
    const entry = findEntry(trend.slug);
    const colors =
      trend.category === "color"
        ? CATEGORY_COLORS.color
        : CATEGORY_COLORS.default;
    const name = `Monatt ${trend.name} ${opts.category}`;
    return {
      id: hashString(`${name}-${now}-${i}`),
      name,
      category: opts.category,
      front_concept: `Minimal front: small original motif or wordmark drawn from "${trend.name}" placed left-chest. Keep the front quiet so the piece stays wearable daily.`,
      back_concept: `Statement back: larger original graphic developing the same idea — ${entry?.commercial_opportunity ?? trend.commercial_opportunity}`,
      silhouette:
        opts.category === "pants"
          ? "relaxed wide-leg"
          : "boxy, slightly oversized (current Gen Z standard)",
      colors,
      materials:
        opts.category === "tee"
          ? ["100% cotton, 260–300gsm, garment-dyed"]
          : opts.category === "hoodie" || opts.category === "crewneck"
            ? ["100% cotton fleece, 420–480gsm"]
            : ["cotton twill / canvas (spec per supplier)"],
      placement:
        "Left-chest embroidery or small print front; centered back graphic; optional sleeve hit.",
      styling: `Style with ${trend.category === "silhouette" ? "a fitted top to balance volume" : "baggy bottoms and clean sneakers"}; works for modest layering with longer hemlines.`,
      cultural_inspiration: trend.cultural_relevance,
      why_it_connects: `${entry?.prior_rationale ?? ""} Diaspora relevance rated ${entry?.priors.diaspora_relevance ?? "?"}/10 in the taxonomy.`,
      trend_connection: `Built on "${trend.name}" (score ${trend.score}/100, status: ${trend.status}). ${trend.score_explanation.split(" Status:")[0]}`,
      trend_slugs: [trend.slug],
      retail_price: retail,
      cost_target: Math.round(retail * 0.3),
      season: opts.season,
      campaign_idea: `Content-first launch: short-form video series pairing the piece with its cultural story (${trend.name}); seed to diaspora creators before public drop.`,
      sensitivity_notes:
        (trend.risks ? `${trend.risks} ` : "") +
        "Design must be an original motif inspired by the tradition, not a reproduction. Retail price note: " +
        source +
        ".",
      generated_by: "rules",
      created_at: now,
      data_status: "sample",
    };
  });
}

interface AiIdeaShape {
  name: string;
  front_concept: string;
  back_concept: string;
  silhouette: string;
  colors: string[];
  materials: string[];
  placement: string;
  styling: string;
  cultural_inspiration: string;
  why_it_connects: string;
  trend_connection: string;
  campaign_idea: string;
  sensitivity_notes: string;
}

export async function generateIdeas(
  opts: GenerateOptions,
  allTrends: Trend[],
  prices: PricePoint[],
): Promise<{ ideas: ProductIdea[]; engine: "ai" | "rules"; note: string }> {
  const selected = allTrends.filter((t) => opts.trendSlugs.includes(t.slug));
  const pool = selected.length > 0 ? selected : [...allTrends].sort((a, b) => b.score - a.score);

  if (aiAvailable()) {
    const { retail, source } = priceFor(opts.category, prices);
    const trendContext = pool.slice(0, 4).map((t) => ({
      name: t.name,
      score: t.score,
      status: t.status,
      description: t.description,
      cultural_relevance: t.cultural_relevance,
      commercial_opportunity: t.commercial_opportunity,
      risks: t.risks,
    }));
    const { data, error } = await askClaudeJSON<AiIdeaShape[]>(
      `Design ${opts.count} original Monatt product concept(s).
Product category: ${opts.category}. Season: ${opts.season}.
Recommended retail anchor: $${retail} (${source}).
Trends to build on (choose the strongest combination):
${JSON.stringify(trendContext, null, 2)}

Return a JSON array of ${opts.count} objects with EXACTLY these string fields (colors and materials are string arrays): name, front_concept, back_concept, silhouette, colors, materials, placement, styling, cultural_inspiration, why_it_connects, trend_connection, campaign_idea, sensitivity_notes.`,
    );
    if (data && Array.isArray(data) && data.length > 0) {
      const now = new Date().toISOString();
      const ideas: ProductIdea[] = data.slice(0, opts.count).map((d, i) => ({
        id: hashString(`${d.name}-${now}-${i}`),
        name: String(d.name ?? "Untitled concept"),
        category: opts.category,
        front_concept: String(d.front_concept ?? ""),
        back_concept: String(d.back_concept ?? ""),
        silhouette: String(d.silhouette ?? ""),
        colors: Array.isArray(d.colors) ? d.colors.map(String) : [],
        materials: Array.isArray(d.materials) ? d.materials.map(String) : [],
        placement: String(d.placement ?? ""),
        styling: String(d.styling ?? ""),
        cultural_inspiration: String(d.cultural_inspiration ?? ""),
        why_it_connects: String(d.why_it_connects ?? ""),
        trend_connection: String(d.trend_connection ?? ""),
        trend_slugs: pool.slice(0, 4).map((t) => t.slug),
        retail_price: retail,
        cost_target: Math.round(retail * 0.3),
        season: opts.season,
        campaign_idea: String(d.campaign_idea ?? ""),
        sensitivity_notes: String(d.sensitivity_notes ?? ""),
        generated_by: "ai",
        created_at: now,
        data_status: "ai",
      }));
      return {
        ideas,
        engine: "ai",
        note: "Generated by Claude under Monatt brand guardrails — review before production.",
      };
    }
    // AI failed → fall through to rules, and say why.
    return {
      ideas: ruleBasedIdeas(opts, pool, prices),
      engine: "rules",
      note: `AI generation unavailable (${error ?? "unknown"}) — showing rule-based drafts instead.`,
    };
  }

  return {
    ideas: ruleBasedIdeas(opts, pool, prices),
    engine: "rules",
    note: "Rule-based drafts (no ANTHROPIC_API_KEY configured). Add a key in .env.local for AI concepts.",
  };
}
