import { NextResponse } from "next/server";
import { ensureSeeded, runRefresh } from "@/lib/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    await ensureSeeded();
    const result = await runRefresh();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Refresh failed" },
      { status: 500 },
    );
  }
}
