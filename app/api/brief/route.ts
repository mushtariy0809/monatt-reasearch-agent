import { NextResponse } from "next/server";
import { buildWeeklyBrief } from "@/lib/brief";
import { ensureSeeded } from "@/lib/pipeline";
import { getDriver } from "@/lib/store";
import type {
  CulturalMoment,
  Prediction,
  PricePoint,
  Trend,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  try {
    await ensureSeeded();
    const d = getDriver();
    const [trends, predictions, moments, prices] = await Promise.all([
      d.all<Trend>("trends"),
      d.all<Prediction>("predictions"),
      d.all<CulturalMoment>("cultural_moments"),
      d.all<PricePoint>("price_points"),
    ]);
    const brief = await buildWeeklyBrief(trends, predictions, moments, prices);
    await d.upsert("briefs", [brief]);
    return NextResponse.json(brief);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Brief generation failed" },
      { status: 500 },
    );
  }
}
