-- Monatt Trend Intelligence — Supabase/PostgreSQL schema
--
-- Run this once in your Supabase project: Dashboard → SQL Editor → paste → Run.
-- Date fields are stored as ISO-8601 text so records round-trip byte-identically
-- between the app, the local file driver and Postgres.
-- The app connects with the service_role key (server-side only), which bypasses
-- RLS; RLS is enabled with no policies so the anon key can read nothing.

create table if not exists signals (
  id           text primary key,
  source       text not null,
  platform     text not null,
  title        text not null,
  url          text not null default '',
  published_at text not null,
  collected_at text not null,
  region       text not null,
  engagement   numeric not null default 0,
  confidence   numeric not null default 0.5,
  data_status  text not null
);

create table if not exists trends (
  slug                  text primary key,
  name                  text not null,
  category              text not null,
  description           text not null,
  status                text not null,
  score                 integer not null,
  score_components      jsonb not null default '[]',
  score_explanation     text not null default '',
  regions               jsonb not null default '[]',
  audience              text not null default '',
  platforms             jsonb not null default '[]',
  evidence_count        integer not null default 0,
  evidence              jsonb not null default '[]',
  first_seen            text not null,
  last_updated          text not null,
  estimated_lifespan    text not null default '',
  cultural_relevance    text not null default '',
  commercial_opportunity text not null default '',
  risks                 text not null default '',
  recommended_action    text not null default '',
  data_status           text not null
);

create table if not exists phrases (
  id                   text primary key,
  text                 text not null,
  language             text not null,
  translation          text not null default '',
  meaning              text not null default '',
  tone                 text not null default '',
  audience             text not null default '',
  clothing_application text not null default '',
  source_url           text,
  trend_slug           text,
  collected_at         text not null,
  data_status          text not null
);

create table if not exists price_points (
  id           text primary key,
  brand        text not null,
  product      text not null,
  category     text not null,
  listed_price numeric not null,
  sale_price   numeric,
  currency     text not null default 'USD',
  usd_price    numeric not null,
  material     text,
  url          text,
  checked_at   text not null,
  data_status  text not null
);

create table if not exists cultural_moments (
  id           text primary key,
  title        text not null,
  type         text not null,
  description  text not null default '',
  relevance    text not null default '',
  opportunity  text not null,
  risk_notes   text not null default '',
  date         text,
  source_url   text,
  application  text not null default '',
  collected_at text not null,
  data_status  text not null
);

create table if not exists predictions (
  id                   text primary key,
  trend_slug           text not null,
  trend_name           text not null,
  category             text not null,
  evidence_summary     text not null default '',
  region               text not null default '',
  audience_fit         numeric not null,
  cultural_fit         numeric not null,
  momentum             numeric not null,
  saturation           numeric not null,
  direction            text not null,
  period               text not null,
  confidence           numeric not null,
  reasoning            text not null default '',
  suggested_product    text not null default '',
  target_price         text not null default '',
  commercial_potential numeric not null,
  risks                text not null default '',
  recommended_action   text not null default '',
  generated_at         text not null,
  data_status          text not null
);

create table if not exists product_ideas (
  id                   text primary key,
  name                 text not null,
  category             text not null,
  front_concept        text not null default '',
  back_concept         text not null default '',
  silhouette           text not null default '',
  colors               jsonb not null default '[]',
  materials            jsonb not null default '[]',
  placement            text not null default '',
  styling              text not null default '',
  cultural_inspiration text not null default '',
  why_it_connects      text not null default '',
  trend_connection     text not null default '',
  trend_slugs          jsonb not null default '[]',
  retail_price         numeric not null,
  cost_target          numeric not null,
  season               text not null default '',
  campaign_idea        text not null default '',
  sensitivity_notes    text not null default '',
  generated_by         text not null,
  created_at           text not null,
  data_status          text not null
);

create table if not exists saved_items (
  id       text primary key,
  kind     text not null,
  ref_id   text not null,
  notes    text not null default '',
  saved_at text not null
);

create table if not exists briefs (
  id                    text primary key,
  week_of               text not null,
  generated_at          text not null,
  rising                jsonb not null default '[]',
  declining             jsonb not null default '[]',
  cultural_signals      jsonb not null default '[]',
  product_opportunities jsonb not null default '[]',
  price_notes           jsonb not null default '[]',
  capsule               jsonb not null default '{}',
  next_trend            jsonb not null default '{}',
  evidence_links        jsonb not null default '[]',
  confidence            numeric not null,
  next_actions          jsonb not null default '[]',
  narrative             text,
  narrative_by          text,
  data_status           text not null
);

create table if not exists gtrends_points (
  id          text primary key,
  term        text not null,
  date        text not null,
  value       numeric not null,
  region      text not null,
  imported_at text not null,
  data_status text not null
);

create table if not exists meta (
  key   text primary key,
  value jsonb
);

-- Lock the anon/public role out entirely; the app uses the service key.
alter table signals          enable row level security;
alter table trends           enable row level security;
alter table phrases          enable row level security;
alter table price_points     enable row level security;
alter table cultural_moments enable row level security;
alter table predictions      enable row level security;
alter table product_ideas    enable row level security;
alter table saved_items      enable row level security;
alter table briefs           enable row level security;
alter table gtrends_points   enable row level security;
alter table meta             enable row level security;

create index if not exists signals_published_idx on signals (published_at);
create index if not exists predictions_period_idx on predictions (period);
create index if not exists gtrends_term_idx on gtrends_points (term);
