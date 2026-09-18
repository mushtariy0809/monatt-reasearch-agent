// Sample seed data — EVERY record here carries data_status: "sample" and is
// labeled as such throughout the UI. Sample data exists so the app is
// explorable before live connectors run; it is never presented as real
// market fact. Engagement numbers and price figures below are illustrative
// placeholders, not observations. Phrases and cultural notes are accurate
// translations/descriptions, but their "trending" framing is editorial.

import type {
  CulturalMoment,
  Phrase,
  PricePoint,
  Signal,
} from "./types";
import { signalId } from "./dedup";

const daysAgo = (n: number, base: Date) =>
  new Date(base.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

export function buildSampleSignals(now: Date): Signal[] {
  const mk = (
    title: string,
    platform: Signal["platform"],
    engagement: number,
    days: number,
    region: Signal["region"] = "Global",
  ): Signal => ({
    id: signalId(title, `sample:${title}`),
    source: `sample:${platform}`,
    platform,
    title,
    url: "",
    published_at: daysAgo(days, now),
    collected_at: now.toISOString(),
    region,
    engagement,
    confidence: 0.3,
    data_status: "sample",
  });

  return [
    // Rising: baggy / wide-leg (dense recent mentions)
    mk("Baggy jeans outfit formulas for fall", "tiktok", 14200, 2, "US"),
    mk("Why wide-leg denim replaced everything in my closet", "reddit", 890, 4, "US"),
    mk("Wide leg trouser styling for class", "pinterest", 3100, 6, "EU"),
    mk("Parachute pants are back on the feed", "instagram", 5400, 12, "UK"),
    mk("Baggy fit check thread — weekly", "reddit", 640, 20, "US"),
    // Rising: heavyweight tees
    mk("Best heavyweight tee blanks ranked (260gsm+)", "reddit", 1200, 3, "US"),
    mk("Garment-dyed boxy tee haul", "tiktok", 8900, 5, "US"),
    mk("Oversized tee brands that actually fit boxy", "instagram", 2100, 15, "EU"),
    // Football jerseys — post-World-Cup afterglow
    mk("Blokecore isn't dead, it just went vintage", "tiktok", 11000, 4, "UK"),
    mk("Retro jersey finds from the World Cup summer", "instagram", 4300, 7, "US"),
    mk("Football shirt collecting after the tournament", "reddit", 510, 9, "EU"),
    mk("Uzbekistan world cup run — best diaspora watch-party moments", "tiktok", 21000, 18, "US"),
    // Track jackets
    mk("Track jacket layering for early autumn", "pinterest", 1900, 5, "EU"),
    mk("Retro sportswear staples under $80", "tiktok", 6100, 11, "US"),
    // Burgundy rising into autumn
    mk("Burgundy is THE color for fall fits", "tiktok", 16800, 1, "US"),
    mk("Oxblood leather and maroon knits everywhere at fashion week", "rss", 0, 3, "EU"),
    mk("Wine color palette moodboard", "pinterest", 4700, 8, "Global"),
    // Butter yellow fading post-summer
    mk("Butter yellow was everywhere in June — archive it", "instagram", 2300, 24, "US"),
    mk("Pastel yellow summer capsule recap", "pinterest", 1100, 26, "EU"),
    // Suede
    mk("Suede sneakers and corduroy — texture season begins", "rss", 0, 6, "US"),
    mk("Nubuck everything this autumn", "tiktok", 5200, 9, "UK"),
    // Embroidery
    mk("Why embroidered chest hits beat big prints", "reddit", 780, 5, "US"),
    mk("Chainstitch embroidery small-brand appreciation", "instagram", 3400, 10, "US"),
    mk("Embroidered detail as the new quality signal", "rss", 0, 16, "EU"),
    // Cyrillic / multilingual type
    mk("Cyrillic typography tees and diaspora identity", "tiktok", 7600, 6, "US"),
    mk("Multilingual streetwear graphics are having a moment", "instagram", 2900, 13, "EU"),
    // Workwear
    mk("Carpenter pants and chore coats — the forever uniform", "reddit", 950, 8, "US"),
    mk("Workwear canvas jacket patina thread", "reddit", 620, 22, "CA"),
    // Leopard fading (older mentions only)
    mk("Leopard print bags recap from spring", "pinterest", 800, 21, "EU"),
    mk("Animal print: still in or done?", "tiktok", 2600, 25, "UK"),
    // Scarves rising pre-winter
    mk("Scarf styling tutorials are back on the fyp", "tiktok", 9800, 3, "UK"),
    mk("Balaclava and layered hood season prep", "pinterest", 2200, 7, "EU"),
    // Doppi & culture
    mk("Modern doppi styling — heritage headwear done right", "instagram", 1800, 4, "US"),
    mk("Tubeteika appreciation post", "reddit", 340, 14, "CentralAsia"),
    // Ikat
    mk("Ikat-inspired prints on the runway again", "rss", 0, 10, "Global"),
    mk("Atlas silk and adras — the original ikat", "instagram", 1500, 17, "CentralAsia"),
    // Food content rising
    mk("Making plov for my roommates (they cried)", "tiktok", 45000, 2, "US"),
    mk("Somsa vs empanada vs börek — dough debate", "tiktok", 18700, 5, "US"),
    mk("Best Uzbek restaurant in NYC? thread", "reddit", 430, 7, "US"),
    mk("Lagman noodle pull ASMR", "instagram", 8900, 12, "EU"),
    mk("Trying kurt for the first time (world snacks ep. 12)", "tiktok", 26000, 6, "US"),
    // Tea culture
    mk("Tea over coffee: the choyxona mindset", "tiktok", 12400, 4, "US"),
    mk("Piala tea bowls and the blue cotton pattern explained", "instagram", 3600, 9, "Global"),
    // Tashkent metro / travel
    mk("Tashkent metro stations are unreal (photo dump)", "instagram", 15600, 5, "Global"),
    mk("Uzbekistan travel is trending — Samarkand itinerary", "tiktok", 22000, 8, "Global"),
    mk("Soviet modernism architecture tour: Tashkent edition", "rss", 0, 15, "EU"),
    // Tico nostalgia
    mk("POV: your uncle's white Tico could fit 9 people", "tiktok", 19800, 7, "US"),
    mk("Daewoo Nexia appreciation meme dump", "instagram", 4100, 19, "CentralAsia"),
    // Diaspora humor
    mk("Diaspora kid lunchbox stories: growing up Uzbek in America", "tiktok", 31000, 3, "US"),
    mk("Immigrant parents reacting to ripped jeans", "tiktok", 27500, 10, "US"),
    mk("Third culture kid problems: which language do I dream in", "instagram", 6800, 14, "EU"),
    // Modest layering
    mk("Modest streetwear layering formulas", "pinterest", 5400, 4, "UK"),
    mk("Maxi length + oversized: modest fits masterclass", "tiktok", 13900, 6, "UK"),
  ];
}

export function buildSamplePhrases(now: Date): Phrase[] {
  const c = now.toISOString();
  const mk = (
    text: string,
    language: Phrase["language"],
    translation: string,
    meaning: string,
    tone: string,
    audience: string,
    clothing_application: string,
    trend_slug: string | null = null,
  ): Phrase => ({
    id: signalId(text, "phrase"),
    text, language, translation, meaning, tone, audience,
    clothing_application, source_url: null, trend_slug,
    collected_at: c, data_status: "sample",
  });
  return [
    mk("Zo'r", "uz", "Awesome / great", "Universal Uzbek approval word; short, punchy, instantly recognized.", "playful, proud", "All Uzbek speakers; readable even to non-speakers as a design mark", "Small embroidered chest hit or cap embroidery; works as a logo-like mark.", "cyrillic-multilingual-type"),
    mk("Mazza", "uz", "Delicious / so good", "Said about food and good moments alike; warm and casual.", "warm, fun", "Diaspora Gen Z; food-content crossover", "Pairs with food-capsule graphics (plov, non); back-print sub-line.", "plov-food-content"),
    mk("Oshga keling", "uz", "Come over for plov", "The classic Uzbek invitation — hospitality in two words.", "warm, welcoming", "Diaspora all ages; instantly nostalgic", "Back print over a plov graphic; event-merch natural (supper clubs).", "plov-food-content"),
    mk("Non ursin", "uz", "May bread strike me (I swear on bread)", "Folk oath on bread — bread is sacred in Uzbek culture; funny and deeply specific.", "humorous, nostalgic", "Diaspora Gen Z + millennials", "Tee graphic with a non (bread) motif; conversation-starter piece.", "plov-food-content"),
    mk("Voy dod", "uz", "Oh no / good grief", "Exasperated exclamation every Uzbek kid heard from parents.", "self-deprecating humor", "Second-gen diaspora", "Small front hit; meme-adjacent; pairs with 'immigrant parents' content.", "diaspora-identity-humor"),
    mk("Jonim", "uz", "My dear / my soul", "Term of endearment used constantly by family.", "tender, warm", "Broad diaspora; giftable", "Embroidered script on beanies/hoodies; strong gift product.", "embroidery-detail"),
    mk("Bo'ladi", "uz", "It'll work out / okay, fine", "The Uzbek 'it's fine' — optimistic fatalism in one word.", "chill, ironic", "Diaspora Gen Z", "Minimal type tee; slacker-humor energy in Uzbek.", "cyrillic-multilingual-type"),
    mk("Davay", "ru", "Come on / let's go / bye", "Russian loanword used across Central Asia for everything from hype to goodbyes.", "hype, playful", "Russian-speaking diaspora broadly", "Sleeve print or cap; readable across the whole post-Soviet diaspora.", "cyrillic-multilingual-type"),
    mk("Halol mehnat", "uz", "Honest work", "Work-ethic phrase; honors immigrant-parent sacrifice without irony.", "sincere, proud", "Second-gen diaspora; parents approve", "Workwear capsule anchor: chore coat interior print or chest embroidery.", "quiet-workwear"),
    mk("Where are you actually from?", "en", "—", "The question every diaspora kid gets; owning it flips it into identity pride.", "wry, knowing", "All second-gen immigrants (crossover beyond Uzbeks)", "Back print with map-dot or route motif; broad-market crossover piece.", "diaspora-identity-humor"),
  ];
}

export function buildSamplePrices(now: Date): PricePoint[] {
  const c = now.toISOString();
  const mk = (
    brand: string,
    product: string,
    category: string,
    listed: number,
    sale: number | null,
    material: string | null,
  ): PricePoint => ({
    id: signalId(`${brand}-${product}`, "price"),
    brand, product, category,
    listed_price: listed, sale_price: sale, currency: "USD",
    usd_price: listed, material, url: null,
    checked_at: c, data_status: "sample",
  });
  // Anonymized illustrative comparables — typical indie/culture-streetwear
  // price levels, NOT real observed listings. Replace via manual entry.
  return [
    mk("SAMPLE — indie culture brand A", "Heavyweight graphic tee", "tee", 40, null, "100% cotton 260gsm"),
    mk("SAMPLE — indie culture brand B", "Boxy printed tee", "tee", 38, 32, "100% cotton 240gsm"),
    mk("SAMPLE — indie culture brand C", "Embroidered logo tee", "tee", 45, null, "100% cotton 280gsm"),
    mk("SAMPLE — diaspora brand D", "Bilingual type tee", "tee", 36, null, "100% cotton 220gsm"),
    mk("SAMPLE — indie culture brand E", "Premium boxy tee", "tee", 48, null, "100% cotton 300gsm"),
    mk("SAMPLE — indie culture brand A", "Fleece hoodie 450gsm", "hoodie", 78, null, "80/20 cotton fleece"),
    mk("SAMPLE — indie culture brand B", "Embroidered hoodie", "hoodie", 85, 68, "100% cotton 420gsm"),
    mk("SAMPLE — diaspora brand D", "Graphic hoodie", "hoodie", 65, null, "70/30 fleece"),
    mk("SAMPLE — indie culture brand E", "Heavy zip hoodie", "hoodie", 95, null, "100% cotton 480gsm"),
    mk("SAMPLE — indie culture brand C", "Crewneck sweatshirt", "crewneck", 68, null, "80/20 fleece"),
    mk("SAMPLE — diaspora brand D", "Embroidered crewneck", "crewneck", 60, 52, "80/20 fleece"),
    mk("SAMPLE — indie culture brand A", "Crewneck 400gsm", "crewneck", 72, null, "100% cotton"),
    mk("SAMPLE — indie culture brand B", "Embroidered dad cap", "cap", 32, null, "cotton twill"),
    mk("SAMPLE — indie culture brand E", "Corduroy cap", "cap", 38, null, "corduroy"),
    mk("SAMPLE — diaspora brand D", "Snapback", "cap", 28, 24, "cotton twill"),
    mk("SAMPLE — indie culture brand C", "Coach jacket", "jacket", 110, null, "nylon"),
    mk("SAMPLE — indie culture brand A", "Track jacket", "jacket", 120, 99, "poly/cotton"),
    mk("SAMPLE — indie culture brand E", "Canvas chore coat", "jacket", 140, null, "12oz canvas"),
    mk("SAMPLE — indie culture brand B", "Baggy work pant", "pants", 88, null, "canvas"),
    mk("SAMPLE — indie culture brand C", "Wide-leg denim", "pants", 98, 79, "14oz denim"),
    mk("SAMPLE — diaspora brand D", "Printed scarf", "accessory", 30, null, "viscose"),
    mk("SAMPLE — indie culture brand E", "Beanie with patch", "accessory", 26, null, "acrylic knit"),
  ];
}

export function buildSampleMoments(now: Date): CulturalMoment[] {
  const c = now.toISOString();
  const mk = (
    title: string,
    type: CulturalMoment["type"],
    description: string,
    relevance: string,
    opportunity: CulturalMoment["opportunity"],
    risk_notes: string,
    date: string | null,
    application: string,
  ): CulturalMoment => ({
    id: signalId(title, "moment"),
    title, type, description, relevance, opportunity, risk_notes,
    date, source_url: null, application, collected_at: c, data_status: "sample",
  });
  return [
    mk("Uzbekistan Independence Day — 35th anniversary", "date",
      "September 1, 2026 marks 35 years of independence; diaspora communities hold events in major cities.",
      "The biggest secular national date; round-number anniversary amplifies it.",
      "organic", "Keep celebratory and cultural, not political.", "2026-09-01",
      "Anniversary content week + a small flag-palette (blue/white/green) capsule; event pop-up potential."),
    mk("Navruz 2027", "date",
      "Spring new year (March 21) — sumalak gatherings, family tables, spring cleaning rituals.",
      "Most beloved cultural holiday; predictable annual spike every March.",
      "organic", "Shared across Persian/Turkic cultures — celebrate inclusively.", "2027-03-21",
      "Annual Navruz capsule; design lock by January 2027."),
    mk("Uzbek Language Day", "date",
      "October 21 — state language day; language-pride content performs in diaspora accounts.",
      "Directly feeds the bilingual-typography design lane.",
      "organic", "Educational tone works best.", "2026-10-21",
      "Phrase-tee mini-drop + 'teach your friends one Uzbek word' content series."),
    mk("Ramadan & Eid 2027", "date",
      "Ramadan expected to begin early February 2027 (moon-sighting dependent); Eid al-Fitr in early March.",
      "Large observant segment of the audience; modest styling and gifting peak.",
      "organic", "Respectful, non-commercialized tone; verify dates near the time (moon-sighting).", "2027-02-08",
      "Modest-layering lookbook and gift-ready packaging; no 'Ramadan sale' framing."),
    mk("Post–World Cup afterglow", "sport",
      "Uzbekistan's first-ever World Cup appearance (summer 2026) is still generating retrospectives and highlight edits.",
      "Historic pride moment fresh in memory; commemorative demand is live now.",
      "short-term", "No federation crests/kit replicas; original commemorative art only.", null,
      "Limited 'first World Cup summer' commemorative tee while the memory is warm."),
    mk("AFC Asian Cup — January 2027", "sport",
      "The national team's next major tournament; diaspora watch parties will resurface.",
      "Next predictable football spike after the World Cup.",
      "organic", "Same IP constraints as all football products.", "2027-01-07",
      "Original supporters' scarf + tee, designed by November 2026."),
    mk("Abdukodir Khusanov (Manchester City)", "celebrity",
      "First Uzbek player in the Premier League (signed to Manchester City in January 2025); every appearance drives diaspora clips.",
      "The most-visible Uzbek athlete for the UK/EU audience; organic pride figure.",
      "organic", "Do NOT use name, number or likeness on product without a licensing agreement — relevance is for content/timing only.", null,
      "Time football-capsule content around big matches; never player merch without a license."),
    mk("Bakhodir Jalolov (Olympic boxing champion)", "celebrity",
      "Two-time Olympic super-heavyweight gold medalist (Tokyo 2020, Paris 2024); major following in Uzbekistan.",
      "Boxing resonates strongly with Central Asian male audiences.",
      "organic", "Same likeness rule: no name/face on product without permission.", null,
      "Boxing-adjacent content moments; gym-culture capsule timing."),
    mk("Central Asian food creators wave", "creator",
      "Plov, somsa and lagman cook-along content keeps crossing into mainstream FYPs; several diaspora creators growing fast.",
      "Feeds the food capsule directly; collab-friendly ecosystem.",
      "organic", "Approach creators for paid collabs properly; don't repost without credit. Add the specific creators you follow to this list.", null,
      "Seed food-capsule pieces to 3–5 food creators; cook-along wearing the merch."),
    mk("Tashkent metro photo-tourism", "nostalgia",
      "Photography of Tashkent's ornate metro stations circulates steadily on design/travel platforms since photo restrictions lifted.",
      "Stunning, ownable visual language for city-pride graphics.",
      "organic", "Commission original illustrations; don't reprint photographers' work.", null,
      "'Tashkent Metro' graphic series — station typography + mosaic geometry."),
    mk("White Tico nostalgia memes", "nostalgia",
      "The Daewoo Tico remains the diaspora's favorite recurring childhood meme.",
      "Instant recognition inside the community; affectionate humor.",
      "organic", "Stylize the silhouette; no Daewoo/Chevrolet logos.", null,
      "One stylized Tico tee/sticker in the nostalgia capsule."),
    mk("Uzbek pop & rap crossover", "music",
      "Uzbek-language artists keep growing on streaming platforms, with diaspora playlists bridging scenes.",
      "Soundtrack layer for content; potential future artist collabs.",
      "short-term", "Music partnerships need proper agreements; track specific artists in your own list before acting.", null,
      "Use trending Uzbek tracks (licensed/original audio rules per platform) in campaign content."),
  ];
}
