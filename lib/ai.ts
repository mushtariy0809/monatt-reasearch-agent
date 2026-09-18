// Claude integration (optional — activates when ANTHROPIC_API_KEY is set).
//
// Uses the official Anthropic SDK with claude-opus-5. Server-side refusal
// fallbacks are enabled by default so a safety decline re-routes to another
// Claude model inside the same call instead of failing the request.
// Everything produced here is labeled "ai" in the UI — AI interpretation is
// never presented as collected fact.

import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = "claude-opus-5";

export function aiAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export const BRAND_SYSTEM = `You are the design and trend brain for Monatt, an Uzbek-American streetwear brand for Gen Z Uzbeks and Central Asians living abroad (US, UK, EU, Canada). Brand rules, non-negotiable:
- Modern streetwear first: wearable, current, Gen Z — never costume-like or stereotypically "ethnic".
- Cultural elements are used thoughtfully: original motifs INSPIRED by Uzbek visual culture (suzani, ikat/adras, paxta pattern, doppi, food, language), never direct copies of traditional artworks, other designers, or existing products.
- Never fabricate quotes, prices, statistics, or attribute phrases to people without a source.
- Never propose using a real person's name or likeness on product without a license.
- Uzbek/Russian text must be accurate; flag anything needing native-speaker review.
- Respect religious and cultural sensitivities; avoid political and religious slogans.
- Mid-tier pricing: tees ~$35–48, crewnecks ~$55–70, hoodies ~$60–85, caps ~$28–38, outerwear ~$95–140.`;

/**
 * Ask Claude for a JSON answer. Returns null when no API key is configured,
 * when the model declines, or when output cannot be parsed — callers always
 * have a rule-based fallback.
 */
export async function askClaudeJSON<T>(
  task: string,
  maxTokens = 16000,
): Promise<{ data: T | null; error: string | null }> {
  if (!aiAvailable()) return { data: null, error: "No ANTHROPIC_API_KEY configured" };
  try {
    const response = await getClient().beta.messages.create({
      model: AI_MODEL,
      max_tokens: maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: BRAND_SYSTEM,
      messages: [
        {
          role: "user",
          content: `${task}\n\nRespond with ONLY valid JSON — no markdown fences, no commentary.`,
        },
      ],
    });
    if (response.stop_reason === "refusal") {
      return {
        data: null,
        error: `Model declined the request${response.stop_details?.explanation ? `: ${response.stop_details.explanation}` : ""}`,
      };
    }
    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
    try {
      return { data: JSON.parse(text) as T, error: null };
    } catch {
      return { data: null, error: "Model output was not valid JSON" };
    }
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError)
      return { data: null, error: "Invalid ANTHROPIC_API_KEY" };
    if (e instanceof Anthropic.RateLimitError)
      return { data: null, error: "Anthropic rate limit — try again shortly" };
    if (e instanceof Anthropic.APIError)
      return { data: null, error: `Anthropic API error ${e.status}: ${e.message}` };
    return {
      data: null,
      error: e instanceof Error ? e.message : "Unknown AI error",
    };
  }
}

/** Plain-text variant for narrative writing (weekly brief). */
export async function askClaudeText(
  task: string,
  maxTokens = 16000,
): Promise<{ text: string | null; error: string | null }> {
  if (!aiAvailable()) return { text: null, error: "No ANTHROPIC_API_KEY configured" };
  try {
    const response = await getClient().beta.messages.create({
      model: AI_MODEL,
      max_tokens: maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: BRAND_SYSTEM,
      messages: [{ role: "user", content: task }],
    });
    if (response.stop_reason === "refusal")
      return { text: null, error: "Model declined the request" };
    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return { text, error: null };
  } catch (e) {
    return {
      text: null,
      error: e instanceof Error ? e.message : "Unknown AI error",
    };
  }
}
