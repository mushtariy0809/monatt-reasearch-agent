// Server-side data access for pages. Seeds sample data on first run.

import { ensureSeeded } from "./pipeline";
import { getDriver } from "./store";
import type {
  CulturalMoment,
  Meta,
  Phrase,
  Prediction,
  PricePoint,
  ProductIdea,
  RefreshResult,
  SavedItem,
  Trend,
  WeeklyBrief,
} from "./types";

export interface AppData {
  trends: Trend[];
  phrases: Phrase[];
  prices: PricePoint[];
  moments: CulturalMoment[];
  predictions: Prediction[];
  ideas: ProductIdea[];
  saved: SavedItem[];
  briefs: WeeklyBrief[];
  lastRefresh: RefreshResult | null;
  storage: "supabase" | "file";
  aiConfigured: boolean;
}

export async function loadAll(): Promise<AppData> {
  await ensureSeeded();
  const d = getDriver();
  const [trends, phrases, prices, moments, predictions, ideas, saved, briefs, lastRefresh] =
    await Promise.all([
      d.all<Trend>("trends"),
      d.all<Phrase>("phrases"),
      d.all<PricePoint>("price_points"),
      d.all<CulturalMoment>("cultural_moments"),
      d.all<Prediction>("predictions"),
      d.all<ProductIdea>("product_ideas"),
      d.all<SavedItem>("saved_items"),
      d.all<WeeklyBrief>("briefs"),
      d.getMeta<Meta["last_refresh"]>("last_refresh"),
    ]);
  return {
    trends: trends.sort((a, b) => b.score - a.score),
    phrases,
    prices,
    moments,
    predictions,
    ideas: ideas.sort((a, b) => b.created_at.localeCompare(a.created_at)),
    saved,
    briefs: briefs.sort((a, b) => b.generated_at.localeCompare(a.generated_at)),
    lastRefresh,
    storage: d.kind,
    aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  };
}

export function savedIds(saved: SavedItem[]): string[] {
  return saved.map((s) => s.id);
}
