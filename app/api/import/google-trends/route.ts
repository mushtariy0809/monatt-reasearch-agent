import { NextResponse } from "next/server";
import { parseGoogleTrendsCsv } from "@/lib/connectors/google-trends";
import { ensureSeeded, recomputeAnalysis } from "@/lib/pipeline";
import { getDriver } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Import a Google Trends "interest over time" CSV export. Body: { csv, region? } */
export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const b = (await req.json()) as { csv?: string; region?: string };
    if (!b.csv || typeof b.csv !== "string") {
      return NextResponse.json({ error: "csv text required" }, { status: 400 });
    }
    const { points, term, error } = parseGoogleTrendsCsv(b.csv, b.region || "Global");
    if (error) return NextResponse.json({ error }, { status: 400 });
    await getDriver().upsert("gtrends_points", points);
    await recomputeAnalysis();
    return NextResponse.json({ imported: points.length, term });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Import failed" },
      { status: 500 },
    );
  }
}
