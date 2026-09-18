// Curated trend taxonomy — the list of trends the agent tracks.
//
// Each entry defines WHAT to look for in collected signals (keywords) and
// carries editorial priors (0–10) for factors that cannot be measured from
// free data sources: diaspora relevance, authenticity, originality, etc.
// Priors are ALWAYS labeled "estimated" in the UI and score breakdowns —
// they are informed interpretation, not measured fact. Measured factors
// (velocity, cross-platform presence, engagement) come from live signals.
//
// To track a new trend: add an entry here and hit Refresh. Connectors are
// generic; the taxonomy is the only place trend definitions live.

import type { Region, TrendCategory } from "./types";

export interface TaxonomyEntry {
  slug: string;
  name: string;
  category: TrendCategory;
  description: string;
  keywords: string[]; // matched with word boundaries, case-insensitive
  regions: Region[];
  audience: string;
  priors: {
    diaspora_relevance: number; // 0–10 relevance to Uzbek/Central Asian Gen Z abroad
    genz_relevance: number; // 0–10 wider Gen Z relevance
    originality: number; // 0–10 room for an original Monatt take
    cultural_authenticity: number; // 0–10 how authentically Monatt can own this
    commercial_potential: number; // 0–10
    saturation: number; // 0–10 (10 = everyone is doing it)
    longevity_months: number; // editorial estimate of remaining lifespan
    seasonal_months: number[]; // 1–12 months where the trend peaks ([] = year-round)
  };
  prior_rationale: string;
  cultural_relevance: string;
  commercial_opportunity: string;
  risks: string;
  recommended_action: string;
}

const t = (e: TaxonomyEntry) => e;

export const TAXONOMY: TaxonomyEntry[] = [
  // ── Garments & silhouettes ──────────────────────────────────────────
  t({
    slug: "baggy-wide-leg",
    name: "Baggy & wide-leg bottoms",
    category: "silhouette",
    description:
      "Relaxed, wide and baggy fits in denim, cargos and trousers continue to dominate Gen Z streetwear, fully displacing skinny fits.",
    keywords: ["baggy jeans", "baggy denim", "wide leg", "wide-leg", "baggy fit", "parachute pants", "baggy cargo"],
    regions: ["US", "UK", "EU", "CA"],
    audience: "Gen Z, unisex",
    priors: {
      diaspora_relevance: 6, genz_relevance: 9, originality: 4, cultural_authenticity: 5,
      commercial_potential: 8, saturation: 7, longevity_months: 18, seasonal_months: [],
    },
    prior_rationale:
      "Silhouette is a baseline expectation rather than a differentiator; diaspora relevance is indirect (it is simply what the audience wears). Saturation is high but the fit itself is not going away soon.",
    cultural_relevance:
      "Wide silhouettes echo the volume of traditional Central Asian garments (chapan, ishton) — a subtle, wearable bridge without costume risk.",
    commercial_opportunity:
      "Cut all Monatt bottoms and heavyweight tees in relaxed/boxy fits; do not launch slim fits.",
    risks: "Commodity silhouette — differentiation must come from fabric, graphics and story, not the fit alone.",
    recommended_action: "Adopt as default fit standard across the range; not a marketing story by itself.",
  }),
  t({
    slug: "boxy-heavyweight-tee",
    name: "Boxy heavyweight tees",
    category: "garment",
    description:
      "Heavy 220–320gsm cotton tees with boxy, cropped-length cuts are the standard canvas for graphic-led streetwear brands.",
    keywords: ["heavyweight tee", "boxy tee", "garment dyed", "garment-dyed", "260gsm", "300gsm", "oversized tee"],
    regions: ["US", "UK", "EU", "CA"],
    audience: "Gen Z, unisex",
    priors: {
      diaspora_relevance: 6, genz_relevance: 8, originality: 4, cultural_authenticity: 5,
      commercial_potential: 9, saturation: 8, longevity_months: 24, seasonal_months: [3, 4, 5, 6, 7, 8, 9],
    },
    prior_rationale:
      "The core commercial vehicle for a graphics brand: high commercial score, low originality (the garment is standard — the print is the product).",
    cultural_relevance: "Neutral canvas; culture is carried by the graphic, not the garment.",
    commercial_opportunity: "Primary product: $38–48 heavyweight tees with Monatt cultural graphics.",
    risks: "Blank quality is table stakes — thin blanks would undercut the premium positioning.",
    recommended_action: "Make this the first production run; sample 2–3 blank suppliers for weight and shrinkage.",
  }),
  t({
    slug: "football-jersey",
    name: "Football jerseys & blokecore",
    category: "garment",
    description:
      "Vintage and fashion football jerseys worn as everyday streetwear; club culture aesthetics crossing into fashion.",
    keywords: ["blokecore", "football jersey", "soccer jersey", "football shirt", "retro jersey", "kit culture"],
    regions: ["UK", "EU", "US"],
    audience: "Gen Z, leaning male but increasingly unisex",
    priors: {
      diaspora_relevance: 8, genz_relevance: 8, originality: 7, cultural_authenticity: 8,
      commercial_potential: 7, saturation: 6, longevity_months: 12, seasonal_months: [5, 6, 7, 8],
    },
    prior_rationale:
      "Uzbekistan made its first-ever World Cup appearance in summer 2026 (hosted in the US/Canada/Mexico — where the diaspora lives). The moment is now in its afterglow, and the next tournament window is the AFC Asian Cup in January 2027.",
    cultural_relevance:
      "National-team pride is one of the strongest diaspora identity signals; the historic first World Cup just happened on the diaspora's home turf.",
    commercial_opportunity:
      "A commemorative 'first World Cup' capsule while the memory is warm, then an original supporters' piece for the January 2027 Asian Cup; original designs only, never replicas of federation kit or crest.",
    risks:
      "Cannot copy the national federation crest, kit design or sponsor marks — original artwork only. Licensed-replica buyers are a different market.",
    recommended_action: "Drop a commemorative capsule this autumn; design the Asian Cup 2027 piece by November.",
  }),
  t({
    slug: "trackjacket-sportswear",
    name: "Track jackets & retro sportswear",
    category: "garment",
    description: "Retro track jackets, nylon warm-ups and 90s sportswear staples in rotation with denim and workwear.",
    keywords: ["track jacket", "tracksuit", "windbreaker", "retro sportswear", "track pants"],
    regions: ["US", "UK", "EU"],
    audience: "Gen Z, unisex",
    priors: {
      diaspora_relevance: 7, genz_relevance: 7, originality: 6, cultural_authenticity: 7,
      commercial_potential: 6, saturation: 6, longevity_months: 12, seasonal_months: [2, 3, 4, 9, 10, 11],
    },
    prior_rationale:
      "Post-Soviet sportswear nostalgia (the 'dvor' tracksuit) is a genuinely ownable angle for a Central Asian brand — priors reflect that specific angle, not generic sportswear.",
    cultural_relevance: "The tracksuit is loaded with post-Soviet childhood memory — instantly legible to the diaspora with humor and affection.",
    commercial_opportunity: "A Monatt track jacket with subtle Uzbek color-blocking (blue/white/green) as a hero outerwear piece.",
    risks: "Avoid direct Adidas three-stripe references; the post-Soviet gopnik meme is played out if handled lazily.",
    recommended_action: "Prototype one track jacket colorway for autumn; test demand via pre-order.",
  }),

  // ── Colors, fabrics, graphics ───────────────────────────────────────
  t({
    slug: "burgundy-oxblood",
    name: "Burgundy & oxblood tones",
    category: "color",
    description: "Deep reds — burgundy, oxblood, maroon — as the dominant seasonal accent across streetwear and sneakers.",
    keywords: ["burgundy", "oxblood", "maroon", "dark red", "wine color", "bordeaux"],
    regions: ["US", "UK", "EU"],
    audience: "Gen Z & young millennial, unisex",
    priors: {
      diaspora_relevance: 7, genz_relevance: 8, originality: 5, cultural_authenticity: 7,
      commercial_potential: 8, saturation: 5, longevity_months: 9, seasonal_months: [9, 10, 11, 12, 1, 2],
    },
    prior_rationale:
      "Deep red maps directly onto anor (pomegranate), a central Uzbek motif — a color trend the brand can own with a cultural story instead of just following.",
    cultural_relevance: "Anor (pomegranate) is a beloved symbol of abundance in Uzbek art and suzani embroidery.",
    commercial_opportunity: "An 'Anor' colorway across tees/hoodies with a single embroidered pomegranate.",
    risks: "Color trends rotate fast; commit to small runs.",
    recommended_action: "Use as the hero accent for the autumn/winter drop.",
  }),
  t({
    slug: "butter-yellow",
    name: "Butter & soft yellows",
    category: "color",
    description: "Soft butter-yellow tones as the spring/summer pastel of choice, replacing harsher neons.",
    keywords: ["butter yellow", "pale yellow", "soft yellow", "pastel yellow"],
    regions: ["US", "UK", "EU"],
    audience: "Gen Z, leaning female but broadly unisex",
    priors: {
      diaspora_relevance: 5, genz_relevance: 7, originality: 5, cultural_authenticity: 5,
      commercial_potential: 6, saturation: 5, longevity_months: 6, seasonal_months: [3, 4, 5, 6, 7],
    },
    prior_rationale: "A follow-the-market color; connects loosely to non (bread) and sariyog' (butter) food nostalgia for a playful capsule.",
    cultural_relevance: "Pairs naturally with food-nostalgia graphics (non, halva, kurt).",
    commercial_opportunity: "One butter-yellow tee colorway in the food capsule.",
    risks: "Pastels can read soft for a streetwear-first audience; keep graphics bold.",
    recommended_action: "Test one colorway; do not build a whole drop on it.",
  }),
  t({
    slug: "suede-texture",
    name: "Suede & tactile materials",
    category: "fabric",
    description: "Suede, brushed and napped textures across footwear and outerwear; texture as the new logo.",
    keywords: ["suede", "nubuck", "brushed cotton", "corduroy"],
    regions: ["US", "UK", "EU"],
    audience: "Gen Z & young millennial, unisex",
    priors: {
      diaspora_relevance: 5, genz_relevance: 7, originality: 5, cultural_authenticity: 5,
      commercial_potential: 5, saturation: 6, longevity_months: 10, seasonal_months: [9, 10, 11, 12, 1, 2],
    },
    prior_rationale: "Material story mostly lives in footwear (out of MVP scope); relevant to Monatt via corduroy caps and brushed fleece.",
    cultural_relevance: "Velvet/baxmal has deep roots in Uzbek textile culture — a premium-fabric angle for later drops.",
    commercial_opportunity: "Corduroy cap and baxmal-trim details as premium accents.",
    risks: "Higher production cost; keep to accessories first.",
    recommended_action: "Add a corduroy doppi-inspired cap to the accessories line.",
  }),
  t({
    slug: "embroidery-detail",
    name: "Embroidery-first graphics",
    category: "embroidery",
    description:
      "Embroidered chest hits, motifs and text replacing large screen prints on premium streetwear; craft as a signal of quality.",
    keywords: ["embroidered", "embroidery", "chain stitch", "chainstitch"],
    regions: ["US", "UK", "EU", "CA"],
    audience: "Gen Z & young millennial, unisex",
    priors: {
      diaspora_relevance: 9, genz_relevance: 7, originality: 8, cultural_authenticity: 9,
      commercial_potential: 8, saturation: 4, longevity_months: 18, seasonal_months: [],
    },
    prior_rationale:
      "Suzani embroidery tradition gives Monatt an authentic claim to embroidery-led design that most streetwear brands cannot make. One of the brand's strongest structural advantages.",
    cultural_relevance:
      "Suzani is a living Uzbek craft. Modernized single motifs (anor, quyosh/sun, paxta/cotton) read premium and personal, not costume.",
    commercial_opportunity: "Embroidered essentials line at a $5–8 retail premium over printed equivalents.",
    risks:
      "Do not reproduce specific traditional suzani compositions wholesale or uncredited — design original motifs inspired by the vocabulary, and say so.",
    recommended_action: "Make embroidery the signature Monatt finish; commission original motif designs.",
  }),
  t({
    slug: "cyrillic-multilingual-type",
    name: "Multilingual & Cyrillic typography",
    category: "graphic",
    description:
      "Non-Latin and mixed-script typography (Cyrillic, Arabic, CJK) on streetwear as an identity statement.",
    keywords: ["cyrillic", "typography tee", "text graphic", "multilingual", "script tee"],
    regions: ["US", "UK", "EU"],
    audience: "Gen Z diaspora communities",
    priors: {
      diaspora_relevance: 10, genz_relevance: 6, originality: 8, cultural_authenticity: 9,
      commercial_potential: 8, saturation: 4, longevity_months: 24, seasonal_months: [],
    },
    prior_rationale:
      "Uzbek uniquely spans Latin and Cyrillic scripts, plus Russian loan-slang — trilingual wordplay is a defensible design language competitors can't copy credibly.",
    cultural_relevance:
      "Language is the sharpest identity marker for second-generation kids; a phrase their parents say, set in great type, is instantly personal.",
    commercial_opportunity: "Phrase-led tees and hoodies; rotate phrases seasonally like a media brand.",
    risks: "Translate accurately and check slang connotations; avoid religious or political phrases.",
    recommended_action: "Build a phrase pipeline (see Quotes & Language page) and drop 2–3 phrase tees per season.",
  }),

  // ── Aesthetics & styling ────────────────────────────────────────────
  t({
    slug: "quiet-workwear",
    name: "Workwear & carpenter staples",
    category: "aesthetic",
    description: "Carhartt-style workwear — carpenter pants, chore coats, canvas — as a durable Gen Z baseline.",
    keywords: ["workwear", "carpenter pants", "chore coat", "double knee", "canvas jacket", "carhartt"],
    regions: ["US", "CA", "EU"],
    audience: "Gen Z, unisex",
    priors: {
      diaspora_relevance: 6, genz_relevance: 7, originality: 4, cultural_authenticity: 6,
      commercial_potential: 6, saturation: 7, longevity_months: 18, seasonal_months: [9, 10, 11, 1, 2, 3],
    },
    prior_rationale:
      "Immigrant-family labor pride ('halol mehnat' — honest work) gives workwear a sincere diaspora resonance beyond the aesthetic.",
    cultural_relevance: "First-generation work ethic is core diaspora storytelling; handle with respect, not irony.",
    commercial_opportunity: "A 'Halol Mehnat' chore-coat or canvas cap honoring immigrant parents.",
    risks: "Crowded category dominated by heritage brands at low prices.",
    recommended_action: "Enter through storytelling accessories, not core workwear garments.",
  }),
  t({
    slug: "leopard-animal-print",
    name: "Leopard & animal print accents",
    category: "graphic",
    description: "Leopard print in accessories, trims and statement pieces continuing from its 2024–25 revival.",
    keywords: ["leopard print", "animal print", "cheetah print", "leopard"],
    regions: ["US", "UK", "EU"],
    audience: "Gen Z, leaning female",
    priors: {
      diaspora_relevance: 6, genz_relevance: 7, originality: 6, cultural_authenticity: 6,
      commercial_potential: 5, saturation: 7, longevity_months: 6, seasonal_months: [],
    },
    prior_rationale:
      "The snow leopard (irbis) is native to Central Asian mountains — a differentiated, region-true angle on a saturated print trend.",
    cultural_relevance: "Snow leopard as a Central Asian icon flips a generic trend into regional storytelling.",
    commercial_opportunity: "Snow-leopard graphic tee or beanie patch; conservation-angle collab potential.",
    risks: "Generic leopard print is near saturation; only the snow-leopard angle is worth doing.",
    recommended_action: "Design a snow-leopard graphic; skip allover animal print.",
  }),
  t({
    slug: "layered-scarves",
    name: "Statement scarves & layered headwear",
    category: "accessory",
    description: "Scarves, shemagh-style wraps, headscarves and layered hood/cap combinations as key styling moves.",
    keywords: ["scarf styling", "headscarf", "layered hood", "balaclava", "neck scarf", "shemagh"],
    regions: ["UK", "EU", "US"],
    audience: "Gen Z, unisex",
    priors: {
      diaspora_relevance: 8, genz_relevance: 7, originality: 7, cultural_authenticity: 8,
      commercial_potential: 6, saturation: 5, longevity_months: 10, seasonal_months: [10, 11, 12, 1, 2, 3],
    },
    prior_rationale:
      "Central Asian textile heritage (ro'mol) meets a live styling trend; a printed Monatt scarf is low-MOQ and high-story.",
    cultural_relevance: "The ro'mol (scarf) spans generations — grandmother to Gen Z styling — a genuinely warm bridge.",
    commercial_opportunity: "Printed scarf with modernized ikat-inspired original pattern; strong gift product.",
    risks: "Respect religious head-covering contexts; market as styling, never as costume or parody.",
    recommended_action: "Add one scarf to the winter accessories drop.",
  }),
  t({
    slug: "doppi-modern-headwear",
    name: "Modernized doppi & caps",
    category: "accessory",
    description:
      "Interest in modern takes on the doppi (Uzbek skullcap) and culturally-coded headwear within diaspora fashion conversations.",
    keywords: ["doppi", "tubeteika", "skullcap", "kufi cap"],
    regions: ["US", "EU", "CentralAsia"],
    audience: "Uzbek & Central Asian Gen Z diaspora",
    priors: {
      diaspora_relevance: 10, genz_relevance: 4, originality: 9, cultural_authenticity: 10,
      commercial_potential: 6, saturation: 2, longevity_months: 24, seasonal_months: [],
    },
    prior_rationale:
      "Maximum authenticity and near-zero competition; the design challenge is making it wearable daily (structure, materials) rather than ceremonial.",
    cultural_relevance: "The doppi is the single most recognizable Uzbek garment; a respectful modern cut is a flagship statement.",
    commercial_opportunity: "A structured corduroy/canvas doppi-inspired cap; also strong Navruz gifting product.",
    risks:
      "Highest cultural-sensitivity stakes in the range: consult community feedback before launch; avoid sacred-context imagery in marketing.",
    recommended_action: "Prototype with community input; soft-launch to diaspora audience first.",
  }),
  t({
    slug: "ikat-adras-pattern",
    name: "Ikat / adras-inspired pattern",
    category: "graphic",
    description:
      "Global fashion's recurring use of ikat-style patterns; adras and atlas silk patterns are the Uzbek original.",
    keywords: ["ikat", "adras", "atlas silk", "ikat print"],
    regions: ["US", "EU", "CentralAsia"],
    audience: "Gen Z & millennial, unisex",
    priors: {
      diaspora_relevance: 9, genz_relevance: 5, originality: 8, cultural_authenticity: 10,
      commercial_potential: 7, saturation: 3, longevity_months: 36, seasonal_months: [],
    },
    prior_rationale:
      "Uzbekistan is a historical home of ikat — when global brands borrow it, Monatt can answer with the real lineage. Best used as accents, not allover costume.",
    cultural_relevance: "Atlas/adras is national textile heritage; margilan ikat is UNESCO-recognized craft.",
    commercial_opportunity: "Ikat-inspired linings, sleeve tape, sock stripes, packaging — accents that reward close attention.",
    risks: "Allover ikat reads traditional/costume for this audience; keep it to details. Credit the tradition in product copy.",
    recommended_action: "Develop one original simplified ikat-derived stripe as a recurring brand code.",
  }),

  // ── Food & culture ──────────────────────────────────────────────────
  t({
    slug: "plov-food-content",
    name: "Plov / Central Asian food content",
    category: "food",
    description:
      "Central Asian cuisine (plov/osh, somsa, lag'mon, manti) growing in Western food media and creator content.",
    keywords: ["plov", "osh", "somsa", "samsa", "lagman", "lag'mon", "manti", "uzbek food", "central asian food", "uzbek restaurant"],
    regions: ["US", "UK", "EU", "Global"],
    audience: "Foodie Gen Z + diaspora",
    priors: {
      diaspora_relevance: 10, genz_relevance: 6, originality: 8, cultural_authenticity: 10,
      commercial_potential: 8, saturation: 3, longevity_months: 36, seasonal_months: [],
    },
    prior_rationale:
      "Food is the diaspora's proudest, funniest, most shareable content category — and food graphics on streetwear (ramen, bagels, hot sauce brands) have repeatedly proven commercial.",
    cultural_relevance: "Plov is identity; 'Oshga keling' (come over for plov) is the universal Uzbek invitation.",
    commercial_opportunity: "A food capsule: plov, non, kurt, choy graphics with bilingual wordplay.",
    risks: "Keep designs witty, not kitsch; avoid restaurant-brand trade dress.",
    recommended_action: "Design the food capsule as drop two; strong content-marketing flywheel (cook-along reels).",
  }),
  t({
    slug: "kurt-snack",
    name: "Kurt & regional snacks",
    category: "food",
    description: "Kurt (dried yogurt balls) and Central Asian snacks appearing in 'trying world snacks' creator content.",
    keywords: ["kurt", "qurt", "dried yogurt", "central asian snack"],
    regions: ["US", "EU", "CentralAsia"],
    audience: "Gen Z snack-content viewers + diaspora",
    priors: {
      diaspora_relevance: 9, genz_relevance: 5, originality: 9, cultural_authenticity: 9,
      commercial_potential: 5, saturation: 2, longevity_months: 12, seasonal_months: [],
    },
    prior_rationale: "Niche but hyper-ownable; kurt is a childhood-memory trigger and a funny, specific graphic subject.",
    cultural_relevance: "The snack every diaspora kid had to explain to classmates — perfect meme material.",
    commercial_opportunity: "A small kurt graphic tee or sticker pack; low-risk test product.",
    risks: "Niche appeal outside the community; keep run sizes small.",
    recommended_action: "Include one kurt design in the food capsule; A/B against plov and non designs.",
  }),
  t({
    slug: "choy-tea-culture",
    name: "Choy / tea culture & the piala",
    category: "cultural",
    description:
      "Tea-culture content (tea over coffee, matcha rituals) trending globally; the Uzbek choyxona and paxta-pattern piala are the local original.",
    keywords: ["tea culture", "tea ritual", "choy", "piala", "teahouse", "chaikhana", "choyxona"],
    regions: ["US", "UK", "EU", "CentralAsia"],
    audience: "Gen Z, unisex",
    priors: {
      diaspora_relevance: 9, genz_relevance: 7, originality: 8, cultural_authenticity: 10,
      commercial_potential: 7, saturation: 3, longevity_months: 24, seasonal_months: [],
    },
    prior_rationale:
      "Global tea-ritual content is rising while the blue-and-white paxta (cotton) piala pattern is an instantly recognizable, non-costume Uzbek visual — one of the best graphic assets available.",
    cultural_relevance: "Every Uzbek household object; the paxta pattern is shorthand for home.",
    commercial_opportunity: "Paxta-pattern accents (embroidered piala motif, pattern socks, mug merch) and choyxona-themed content.",
    risks: "The pattern itself is traditional/common heritage, but design an original redraw rather than scanning existing ceramics.",
    recommended_action: "Commission an original paxta-pattern redraw; use as a recurring brand motif.",
  }),
  t({
    slug: "navruz-moment",
    name: "Navruz as a content & product moment",
    category: "event",
    description: "Navruz (March 21) — spring new year across Central Asia — as an annual cultural peak for the diaspora.",
    keywords: ["navruz", "nowruz", "nauryz", "sumalak", "spring equinox"],
    regions: ["US", "EU", "CentralAsia", "Global"],
    audience: "All ages diaspora; Gen Z content moment",
    priors: {
      diaspora_relevance: 10, genz_relevance: 5, originality: 7, cultural_authenticity: 10,
      commercial_potential: 7, saturation: 3, longevity_months: 60, seasonal_months: [2, 3],
    },
    prior_rationale: "Recurring, predictable, deeply-owned moment; measured interest spikes every March (visible in search data).",
    cultural_relevance: "The biggest secular cultural holiday; sumalak-making is peak communal nostalgia.",
    commercial_opportunity: "Annual Navruz capsule + gifting push in the 4 weeks before March 21.",
    risks: "Shared across many cultures (Persian, Kazakh, Kyrgyz…) — celebrate inclusively, don't claim exclusively.",
    recommended_action: "Lock a Navruz capsule into the annual calendar; design by January each year.",
  }),
  t({
    slug: "uzbek-football-moment",
    name: "Uzbek football breakthrough",
    category: "cultural",
    description:
      "Uzbekistan's historic first World Cup appearance (summer 2026) and Uzbek players in top European leagues keeping national-team visibility high; next peak: AFC Asian Cup, January 2027.",
    keywords: ["uzbekistan national team", "uzbekistan football", "khusanov", "shomurodov", "uzbekistan world cup", "white wolves"],
    regions: ["US", "EU", "CentralAsia", "Global"],
    audience: "Diaspora all ages; sports-adjacent Gen Z",
    priors: {
      diaspora_relevance: 10, genz_relevance: 6, originality: 8, cultural_authenticity: 9,
      commercial_potential: 8, saturation: 3, longevity_months: 10, seasonal_months: [12, 1, 2],
    },
    prior_rationale:
      "The once-in-history World Cup debut just happened in North America — where the diaspora lives. Afterglow demand for commemorative pieces is live now, and the January 2027 Asian Cup is the next measurable spike.",
    cultural_relevance: "First World Cup in national history; enormous collective pride moment, still fresh.",
    commercial_opportunity:
      "Commemorative 'we were there' capsule now; original supporters' piece (scarf, tee) for the January 2027 Asian Cup.",
    risks:
      "No federation crests, player names/likenesses or replica designs without licenses; celebrate the moment, not the IP.",
    recommended_action: "Ship a commemorative piece this autumn; Asian Cup capsule designed by November 2026.",
  }),
  t({
    slug: "tashkent-metro-aesthetic",
    name: "Tashkent metro & Soviet-modernist aesthetics",
    category: "aesthetic",
    description:
      "Photo/video content of Tashkent's ornate metro stations and Central Asian Soviet-modernist architecture circulating on design and travel platforms.",
    keywords: ["tashkent metro", "soviet modernism", "soviet architecture", "tashkent", "samarkand", "bukhara", "silk road travel", "uzbekistan travel"],
    regions: ["Global", "US", "EU"],
    audience: "Design-minded Gen Z & millennials",
    priors: {
      diaspora_relevance: 9, genz_relevance: 6, originality: 8, cultural_authenticity: 9,
      commercial_potential: 6, saturation: 3, longevity_months: 24, seasonal_months: [],
    },
    prior_rationale:
      "Uzbekistan tourism is growing and metro/architecture content performs consistently; graphic potential (station typography, mosaic geometry) is high and distinctly non-costume.",
    cultural_relevance: "Home-city pride for Tashkent kids abroad; visually stunning and specific.",
    commercial_opportunity: "A 'Tashkent Metro' graphic series — station-inspired typography and mosaic geometry.",
    risks: "Reference the visual language, don't reproduce photographers' images or exact mosaics without permission.",
    recommended_action: "Commission original illustrations inspired by 2–3 stations for a city-pride capsule.",
  }),
  t({
    slug: "tico-nexia-nostalgia",
    name: "Tico & Nexia post-Soviet car nostalgia",
    category: "meme",
    description:
      "Daewoo Tico/Nexia/Matiz nostalgia memes — the cars of every Uzbek childhood — recurring in diaspora humor content.",
    keywords: ["daewoo tico", "tico", "nexia", "matiz", "damas", "uzbek car"],
    regions: ["CentralAsia", "US", "EU"],
    audience: "Uzbek Gen Z & millennial diaspora",
    priors: {
      diaspora_relevance: 10, genz_relevance: 3, originality: 9, cultural_authenticity: 9,
      commercial_potential: 5, saturation: 2, longevity_months: 18, seasonal_months: [],
    },
    prior_rationale:
      "Inside-joke gold: near-zero relevance outside the community and near-universal recognition inside it — exactly the split a diaspora brand wants for community products.",
    cultural_relevance: "The white Tico is a universally shared memory object; affectionate humor, not mockery.",
    commercial_opportunity: "A Tico graphic tee/sticker as a community signal product; strong meme-marketing potential.",
    risks: "Car trade dress: stylize the silhouette, avoid Daewoo/Chevrolet logos.",
    recommended_action: "Include one stylized Tico design in the nostalgia capsule.",
  }),
  t({
    slug: "diaspora-identity-humor",
    name: "Diaspora identity humor",
    category: "diaspora",
    description:
      "'Growing up Uzbek abroad' content: bilingual struggles, strict-parents jokes, food-at-school stories, 'where are you actually from'.",
    keywords: ["uzbek diaspora", "central asian diaspora", "growing up immigrant", "diaspora kid", "immigrant parents", "third culture kid"],
    regions: ["US", "UK", "EU", "CA"],
    audience: "Second-generation Gen Z",
    priors: {
      diaspora_relevance: 10, genz_relevance: 7, originality: 8, cultural_authenticity: 9,
      commercial_potential: 8, saturation: 3, longevity_months: 36, seasonal_months: [],
    },
    prior_rationale:
      "The emotional core of the brand: relatable second-gen humor converts to shares and to wearable one-liners better than any other category.",
    cultural_relevance: "This IS the audience's lived experience; authenticity is structural.",
    commercial_opportunity: "Phrase tees, caps and content series built on shared second-gen moments.",
    risks: "Punch in (self-deprecating warmth), never at parents or the home country; test phrasing with community.",
    recommended_action: "Maintain a running list of validated jokes/phrases; convert the best into quarterly drops.",
  }),
  t({
    slug: "modest-layering",
    name: "Modest fashion & layering",
    category: "styling",
    description:
      "Modest streetwear styling — longer hemlines, layered silhouettes, covered fits — growing across mainstream and Muslim Gen Z fashion.",
    keywords: ["modest fashion", "modest streetwear", "layered fit", "modest outfit", "maxi length"],
    regions: ["UK", "EU", "US"],
    audience: "Gen Z, significant female diaspora segment",
    priors: {
      diaspora_relevance: 9, genz_relevance: 7, originality: 6, cultural_authenticity: 8,
      commercial_potential: 7, saturation: 4, longevity_months: 36, seasonal_months: [],
    },
    prior_rationale:
      "A large share of the target audience styles modestly; oversized/layered streetwear already aligns — designing for it is low-cost and high-loyalty.",
    cultural_relevance: "Meets a real need for culturally-comfortable fashion without a separate 'modest line' label.",
    commercial_opportunity: "Longer-cut tees, roomy hoodies, maxi skirt/wide pant pairings in lookbooks; style guides featuring modest styling.",
    risks: "Represent authentically in imagery; avoid tokenism.",
    recommended_action: "Ensure every drop includes modest-stylable pieces and show them styled that way.",
  }),
];

export function findEntry(slug: string): TaxonomyEntry | undefined {
  return TAXONOMY.find((e) => e.slug === slug);
}
