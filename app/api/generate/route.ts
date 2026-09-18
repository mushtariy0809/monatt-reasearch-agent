import { NextResponse } from "next/server";
import { generateIdeas, type GenerateOptions } from "@/lib/generator";
import { ensureSeeded } from "@/lib/pipeline";
import { getDriver } from "@/lib/store";
import type { PricePoint, Trend } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const CATEGORIES = new Set(["tee", "hoodie", "crewneck", "cap", "jacket", "pants", "accessory"]);

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const body = (await req.json()) as Partial<GenerateOptions>;
    if (!body.category || !CATEGORIES.has(body.category)) {
      return NextResponse.json({ error: "Valid category required" }, { status: 400 });
    }
    const opts: GenerateOptions = {
      category: body.category,
      trendSlugs: Array.isArray(body.trendSlugs) ? body.trendSlugs.slice(0, 4) : [],
      season: typeof body.season === "string" && body.season ? body.season : "Autumn/Winter 2026",
      count: Math.min(Math.max(Number(body.count) || 2, 1), 3),
    };
    const d = getDriver();
    const [trends, prices] = await Promise.all([
      d.all<Trend>("trends"),
      d.all<PricePoint>("price_points"),
    ]);
    const result = await generateIdeas(opts, trends.sort((a, b) => b.score - a.score), prices);
    await d.upsert("product_ideas", result.ideas);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 },
    );
  }
}
