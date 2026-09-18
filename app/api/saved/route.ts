import { NextResponse } from "next/server";
import { getDriver } from "@/lib/store";
import type { SavedItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const KINDS = new Set(["trend", "product", "phrase", "moment"]);

/** Toggle an item in Saved Ideas. Body: { kind, ref_id, notes? } */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      kind?: string;
      ref_id?: string;
      notes?: string;
    };
    if (!body.kind || !KINDS.has(body.kind) || !body.ref_id) {
      return NextResponse.json({ error: "kind and ref_id required" }, { status: 400 });
    }
    const d = getDriver();
    const id = `${body.kind}:${body.ref_id}`;
    const existing = await d.all<SavedItem>("saved_items");
    const hit = existing.find((s) => s.id === id);
    if (hit && body.notes === undefined) {
      await d.removeByKey("saved_items", id);
      return NextResponse.json({ saved: false });
    }
    const item: SavedItem = {
      id,
      kind: body.kind as SavedItem["kind"],
      ref_id: body.ref_id,
      notes: body.notes ?? hit?.notes ?? "",
      saved_at: hit?.saved_at ?? new Date().toISOString(),
    };
    await d.upsert("saved_items", [item]);
    return NextResponse.json({ saved: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 },
    );
  }
}
