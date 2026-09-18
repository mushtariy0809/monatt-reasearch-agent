// Core domain types for Monatt Trend Intelligence.
// Field names are snake_case so objects map 1:1 onto the Supabase schema.

/** Provenance of every data point — always shown in the UI, never hidden. */
export type DataStatus = "live" | "cached" | "sample" | "manual" | "ai";

export type TrendStatus =
  | "emerging"
  | "growing"
  | "peaking"
  | "saturated"
  | "declining";

export type Region = "US" | "UK" | "EU" | "CA" | "CentralAsia" | "Global";

export type Platform =
  | "reddit"
  | "rss"
  | "google-trends"
  | "tiktok"
  | "instagram"
  | "pinterest"
  | "manual"
  | "other";

export type TrendCategory =
  | "garment"
  | "silhouette"
  | "color"
  | "fabric"
  | "graphic"
  | "embroidery"
  | "accessory"
  | "footwear"
  | "styling"
  | "aesthetic"
  | "seasonal"
  | "food"
  | "cultural"
  | "diaspora"
  | "phrase"
  | "celebrity"
  | "event"
  | "music"
  | "meme";

/** One raw data point collected from a connector. */
export interface Signal {
  id: string; // stable hash of normalized title+url
  source: string; // connector instance, e.g. "reddit:r/streetwear"
  platform: Platform;
  title: string;
  url: string;
  published_at: string; // ISO date
  collected_at: string; // ISO date
  region: Region;
  engagement: number; // raw engagement (upvotes etc.), 0 if unknown
  confidence: number; // 0–1 source reliability
  data_status: DataStatus;
}

/** One factor inside a trend score, with its own provenance. */
export interface ScoreComponent {
  key: string;
  label: string;
  value: number; // 0–10
  weight: number; // fraction of the total score
  kind: "measured" | "estimated"; // measured = from collected data; estimated = editorial/AI interpretation
  explanation: string;
  unavailable?: boolean; // true → shown as "Data unavailable", excluded from score
}

export interface TrendEvidence {
  title: string;
  url: string;
  platform: Platform;
  published_at: string;
  engagement: number;
  data_status: DataStatus;
}

export interface Trend {
  slug: string;
  name: string;
  category: TrendCategory;
  description: string;
  status: TrendStatus;
  score: number; // 0–100
  score_components: ScoreComponent[];
  score_explanation: string;
  regions: Region[];
  audience: string;
  platforms: Platform[];
  evidence_count: number;
  evidence: TrendEvidence[]; // top supporting evidence, most recent first
  first_seen: string;
  last_updated: string;
  estimated_lifespan: string;
  cultural_relevance: string;
  commercial_opportunity: string;
  risks: string;
  recommended_action: string;
  data_status: DataStatus;
}

export interface Phrase {
  id: string;
  text: string;
  language: "uz" | "ru" | "en" | "mixed";
  translation: string;
  meaning: string;
  tone: string;
  audience: string;
  clothing_application: string;
  source_url: string | null;
  trend_slug: string | null;
  collected_at: string;
  data_status: DataStatus;
}

export interface PricePoint {
  id: string;
  brand: string;
  product: string;
  category: string; // tee | hoodie | crewneck | cap | jacket | pants | accessory
  listed_price: number;
  sale_price: number | null;
  currency: string;
  usd_price: number;
  material: string | null;
  url: string | null;
  checked_at: string;
  data_status: DataStatus;
}

export interface PriceStats {
  category: string;
  count: number;
  low: number;
  average: number;
  median: number;
  high: number;
}

export interface PriceRecommendation {
  category: string;
  recommended_retail: number | null;
  acceptable_range: [number, number] | null;
  cost_target: number | null;
  explanation: string;
  based_on: number; // number of price points used
  data_status: DataStatus;
}

export interface CulturalMoment {
  id: string;
  title: string;
  type:
    | "food"
    | "celebrity"
    | "creator"
    | "date"
    | "meme"
    | "nostalgia"
    | "sport"
    | "music"
    | "collab"
    | "event";
  description: string;
  relevance: string;
  opportunity: "organic" | "short-term" | "risky" | "oversaturated";
  risk_notes: string;
  date: string | null; // for culturally important dates
  source_url: string | null;
  application: string; // how Monatt could use it
  collected_at: string;
  data_status: DataStatus;
}

export type ForecastPeriod = "30d" | "3m" | "6m" | "12m";
export type Direction = "rise" | "hold" | "decline";

export interface Prediction {
  id: string; // `${trend_slug}:${period}`
  trend_slug: string;
  trend_name: string;
  category: TrendCategory;
  evidence_summary: string;
  region: string;
  audience_fit: number; // 0–10
  cultural_fit: number; // 0–10
  momentum: number; // 0–10
  saturation: number; // 0–10 (high = saturated)
  direction: Direction;
  period: ForecastPeriod;
  confidence: number; // 0–1
  reasoning: string;
  suggested_product: string;
  target_price: string;
  commercial_potential: number; // 0–10
  risks: string;
  recommended_action: string;
  generated_at: string;
  data_status: DataStatus;
}

export interface ProductIdea {
  id: string;
  name: string;
  category: string;
  front_concept: string;
  back_concept: string;
  silhouette: string;
  colors: string[];
  materials: string[];
  placement: string; // graphic / embroidery placement
  styling: string;
  cultural_inspiration: string;
  why_it_connects: string;
  trend_connection: string;
  trend_slugs: string[];
  retail_price: number;
  cost_target: number;
  season: string;
  campaign_idea: string;
  sensitivity_notes: string;
  generated_by: "ai" | "rules";
  created_at: string;
  data_status: DataStatus;
}

export interface SavedItem {
  id: string; // `${kind}:${ref_id}`
  kind: "trend" | "product" | "phrase" | "moment";
  ref_id: string;
  notes: string;
  saved_at: string;
}

export interface WeeklyBrief {
  id: string;
  week_of: string; // ISO date of Monday
  generated_at: string;
  rising: { name: string; slug: string; score: number; reason: string }[];
  declining: { name: string; slug: string; score: number; reason: string }[];
  cultural_signals: { title: string; why: string }[];
  product_opportunities: { name: string; why: string }[];
  price_notes: string[];
  capsule: { name: string; pieces: string[]; rationale: string };
  next_trend: { name: string; reasoning: string; confidence: number };
  evidence_links: { title: string; url: string }[];
  confidence: number; // 0–1 overall
  next_actions: string[];
  narrative: string | null; // AI-written narrative when a key is configured
  narrative_by: "ai" | null;
  data_status: DataStatus;
}

export interface GoogleTrendsPoint {
  id: string;
  term: string;
  date: string; // ISO week or day
  value: number; // 0–100 interest
  region: string;
  imported_at: string;
  data_status: DataStatus;
}

export interface RefreshResult {
  started_at: string;
  finished_at: string;
  connectors: {
    source: string;
    ok: boolean;
    fetched: number;
    error: string | null;
  }[];
  new_signals: number;
  duplicates_merged: number;
  trends_updated: number;
  predictions_updated: number;
}

export interface Meta {
  last_refresh: RefreshResult | null;
}
