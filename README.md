# Monatt Trend Intelligence

A web-based AI research agent for **Monatt** — an Uzbek-American streetwear brand for Gen Z
Uzbeks and Central Asians abroad. It collects fashion, cultural, pricing and social signals
from free, legally-accessible sources, scores trends transparently, forecasts where they're
heading, and converts them into original product concepts and pricing recommendations.

Built with **Next.js 15, TypeScript, Tailwind CSS 4**, storage in **Supabase/PostgreSQL**
(with a zero-setup local-file fallback), and optional AI analysis via the **Anthropic API**
(Claude Opus).

---

## Quick start (5 minutes, no accounts needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app boots with **clearly-labeled SAMPLE data** stored in a
local file (`.data/db.json`). Click **Refresh sources** on any page to pull live signals
from Reddit and fashion RSS feeds — trends re-score automatically from real evidence.

Run the test suite (scoring, pricing, dedup, predictions):

```bash
npm test
```

## Unlock more (each step is optional and independent)

Copy the env template first:

```bash
cp .env.example .env.local
```

### 1. Supabase (cloud database)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor**, paste the whole of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
3. Open **Project Settings → API** and copy two values into `.env.local`:
   - `SUPABASE_URL` — the Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — the `service_role` secret (server-side only;
     never expose it in a browser or commit it)
4. Restart `npm run dev`. The Overview header now says "Storage: Supabase".

### 2. Anthropic API (AI analysis)

1. Create a key at [console.anthropic.com](https://console.anthropic.com).
2. Set `ANTHROPIC_API_KEY` in `.env.local` and restart.

This activates: AI-written product concepts in the Outfit Generator, and an AI narrative
in the Weekly Brief. The integration uses `claude-opus-5` with **server-side refusal
fallbacks enabled** (a safety decline automatically re-routes to another Claude model
inside the same request). Without a key, everything still works via labeled rule-based
generation.

### 3. Google Trends (search-growth scoring)

Google Trends has no public API, so the app imports the CSV Google itself exports:
**Sources & Methodology → Import Google Trends data**. Matching trends gain a measured
"Search growth" score component.

---

## What's inside

| Page | What it does |
|---|---|
| Overview | Status stats, top rising / declining, Weekly Monatt Brief generator |
| Live Trends | All tracked trends: search, filters, sort, compare, CSV export, full score breakdowns with evidence links |
| Uzbek & Diaspora | Cultural dates, nostalgia/meme territory, diaspora trends |
| Fashion & Streetwear | Garments, silhouettes, colors, fabrics, graphics, accessories |
| Quotes & Language | Trilingual phrase bank: translation, meaning, tone, audience, clothing application |
| Celebrities & Creators | Relevance + honest opportunity rating (organic / short-term / risky / oversaturated) |
| Food & Lifestyle | Food moments and food-capsule trend signals |
| Price Tracker | Comparables table, market stats (low/avg/median/high), recommended Monatt price, manual entry, CSV |
| Outfit Generator | Trend → original product concept (front/back, silhouette, colors, materials, pricing, campaign, sensitivity notes) |
| Predictions | Sortable 4-horizon forecast table with per-row reasoning and confidence |
| Saved Ideas | Shortlist of saved trends, concepts, phrases and moments |
| Sources & Methodology | Connector status, provenance legend, scoring weights, ethics notes, Trends CSV import |

## Architecture

```
lib/
  taxonomy.ts        Curated trend definitions + editorial priors (the single source of truth)
  connectors/        Modular sources: Reddit public JSON, RSS feeds, Google Trends CSV
  dedup.ts           URL/title dedup across sources and refreshes
  scoring.ts         0–100 score: measured factors (velocity, platforms, engagement,
                     search growth) + estimated priors, unavailable factors excluded
  predictions.ts     Rule-based 30d/3m/6m/12m forecasts with confidence + reasoning
  pricing.ts         Market stats + mid-tier recommendation (never invents prices)
  generator.ts       Product concepts: Claude (if key) or transparent rules
  brief.ts           Weekly brief assembly (+ optional AI narrative)
  pipeline.ts        seed → collect → dedupe → score → predict (one code path)
  store.ts           Supabase driver or local-file driver behind one interface
  ai.ts              Anthropic SDK wrapper (claude-opus-5, refusal fallbacks, refusal handling)
app/                 Next.js App Router pages + API routes
tests/               Vitest suites for scoring, pricing, dedup, predictions
supabase/schema.sql  Full PostgreSQL schema
```

**Data provenance is first-class.** Every record carries `data_status`:
`live` (this refresh) · `cached` (earlier refresh) · `sample` (illustrative seed,
never real) · `manual` (entered/imported by you) · `ai` (model interpretation).
Badges appear on every card, row and score component. Score components additionally
declare `measured` vs `estimated`, and missing measurements are disclosed — never
silently defaulted.

## Scheduled collection

The MVP uses the manual **Refresh sources** button (chosen during scoping). To automate:

- **Vercel Cron** — add to `vercel.json`:
  ```json
  { "crons": [
      { "path": "/api/refresh", "schedule": "0 6 * * *" },
      { "path": "/api/brief",   "schedule": "0 7 * * 1" }
  ] }
  ```
  Note: Vercel invokes cron endpoints with GET; add `export const GET = POST;` to those
  two route files when enabling this, and consider protecting them with a secret header.
- **Anywhere else** — any scheduler that can `curl -X POST https://your-app/api/refresh`
  daily and `/api/brief` weekly.

## Deployment (Vercel)

1. Push this folder to a GitHub repository.
2. Import it at [vercel.com/new](https://vercel.com/new) (framework auto-detected).
3. Add the environment variables from `.env.local` in Project Settings → Environment Variables.
4. **Supabase is required in production** — the local-file driver writes to disk, which is
   ephemeral on serverless hosts.

## Adding stronger data sources later

Connectors are modular — implement the 4-field interface in `lib/connectors/types.ts`
and register it in `lib/connectors/index.ts`. Worthwhile upgrades, roughly in order:

1. **Reddit OAuth API** (free) — higher rate limits than the public JSON endpoints.
2. **YouTube Data API** (free quota) — search velocity for "plov", "Tashkent", styling terms.
3. **Pinterest API / TikTok Creative Center exports** — official access where available in
   your region/account tier; never scrape them.
4. **Glami/StyleSage/EDITED-class market APIs** (paid) — real competitor pricing to replace
   manual price entry.
5. **A proper trends API** (e.g. Glimpse, paid) — replaces manual Google Trends CSV import.
6. **Meta/TikTok creator-marketplace exports** for creator stats you're allowed to use.

To improve prediction accuracy: keep refreshing (velocity needs history), import Trends
CSVs for your top 10 terms monthly, log outcomes (which drops sold) next to predictions,
and tune the weights in `lib/scoring.ts` — they're one table, unit-tested.

## Honesty & compliance rules baked in

- No scraping of restricted platforms; only public JSON, RSS, official CSV exports, manual entry.
- Sample data is loudly labeled and never blends into live data.
- Prices are never invented — fewer than 3 comparables → "Data unavailable".
- Predictions state reasoning + confidence and are labeled as estimates.
- Phrases are never attributed without a source; lyrics/slogans excluded.
- Celebrity relevance ≠ endorsement; likeness use requires permission.
- Cultural elements inspire **original** design — reproduction of traditional artwork,
  other designers, or existing products is called out as a risk on every relevant trend.
