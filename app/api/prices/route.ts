import { NextResponse } from "next/server";
import { signalId } from "@/lib/dedup";
import { ensureSeeded } from "@/lib/pipeline";
import { toUSD } from "@/lib/pricing";
import { getDriver } from "@/lib/store";
import type { PricePoint } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Add a manually-checked comparable price. */
export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const b = (await req.json()) as Partial<PricePoint>;
    const listed = Number(b.listed_price);
    if (!b.brand || !b.product || !b.category || !Number.isFinite(listed) || listed <= 0) {
      return NextResponse.json(
        { error: "brand, product, category and a positive listed_price are required" },
        { status: 400 },
      );
    }
    const currency = (b.currency ?? "USD").toUpperCase();
    const usd = toUSD(listed, currency);
    if (usd === null) {
      return NextResponse.json(
        { error: `Unsupported currency "${currency}" — supported: USD, EUR, GBP, CAD, UZS` },
        { status: 400 },
      );
    }
    const sale = b.sale_price !== undefined && b.sale_price !== null && Number(b.sale_price) > 0
      ? Number(b.sale_price)
      : null;
    const point: PricePoint = {
      id: signalId(`${b.brand}-${b.product}-${Date.now()}`, "manual-price"),
      brand: String(b.brand),
      product: String(b.product),
      category: String(b.category),
      listed_price: listed,
      sale_price: sale,
      currency,
      usd_price: usd,
      material: b.material ? String(b.material) : null,
      url: b.url ? String(b.url) : null,
      checked_at: new Date().toISOString(),
      data_status: "manual",
    };
    await getDriver().upsert("price_points", [point]);
    return NextResponse.json(point);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Price add failed" },
      { status: 500 },
    );
  }
}

/** Remove a price point (e.g. clearing sample rows). Body: { id } */
export async function DELETE(req: Request) {
  try {
    const b = (await req.json()) as { id?: string };
    if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await getDriver().removeByKey("price_points", b.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 },
    );
  }
}
