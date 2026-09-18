"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { computeStats, recommendPrice } from "@/lib/pricing";
import type { PricePoint } from "@/lib/types";
import { DataBadge } from "./badges";
import { CsvButton } from "./buttons";

const CATEGORIES = ["tee", "hoodie", "crewneck", "cap", "jacket", "pants", "accessory"];

export function PriceTracker({ prices }: { prices: PricePoint[] }) {
  const router = useRouter();
  const [category, setCategory] = useState("tee");
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    brand: "", product: "", category: "tee", listed_price: "",
    sale_price: "", currency: "USD", material: "", url: "",
  });

  const filtered = useMemo(
    () => prices.filter((p) => p.category === category),
    [prices, category],
  );
  const stats = useMemo(() => computeStats(prices, category), [prices, category]);
  const rec = useMemo(() => recommendPrice(prices, category, "mid"), [prices, category]);

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          listed_price: Number(form.listed_price),
          sale_price: form.sale_price ? Number(form.sale_price) : null,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setForm({ brand: "", product: "", category: form.category, listed_price: "", sale_price: "", currency: "USD", material: "", url: "" });
      setShowForm(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to add price");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await fetch("/api/prices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  const input = "rounded-sm border hairline bg-white px-2 py-1.5 text-xs";
  const csvRows = filtered.map((p) => ({
    brand: p.brand, product: p.product, category: p.category,
    listed_price: p.listed_price, sale_price: p.sale_price ?? "",
    currency: p.currency, usd_price: p.usd_price, material: p.material ?? "",
    checked_at: p.checked_at, url: p.url ?? "", data_status: p.data_status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
              c === category ? "bg-ink text-cream" : "border hairline bg-white/60 text-smoke hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <CsvButton filename={`monatt-prices-${category}.csv`} rows={csvRows} />
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-sm bg-uzblue px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90"
          >
            {showForm ? "Cancel" : "Add checked price"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-md border hairline bg-white/70 p-4">
          <div className="kicker mb-3">Add a manually-checked comparable (with source link)</div>
          <div className="grid gap-2 sm:grid-cols-4">
            <input className={input} placeholder="Brand *" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <input className={input} placeholder="Product *" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
            <select className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className={input} placeholder="Listed price *" type="number" value={form.listed_price} onChange={(e) => setForm({ ...form, listed_price: e.target.value })} />
            <input className={input} placeholder="Sale price" type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
            <select className={input} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {["USD", "EUR", "GBP", "CAD", "UZS"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className={input} placeholder="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
            <input className={input} placeholder="Source URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>
          {err && <p className="mt-2 text-xs text-red-700">{err}</p>}
          <button
            onClick={submit}
            disabled={busy}
            className="mt-3 rounded-sm bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save price point"}
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-5">
        {stats ? (
          <>
            {[
              ["Low", stats.low], ["Average", stats.average],
              ["Median", stats.median], ["High", stats.high],
            ].map(([label, v]) => (
              <div key={label as string} className="rounded-md border hairline bg-white/70 p-4">
                <div className="font-display text-2xl">${v}</div>
                <div className="kicker mt-1">{label} ({stats.count} pts)</div>
              </div>
            ))}
            <div className="rounded-md border border-uzblue/40 bg-uzblue/5 p-4">
              <div className="font-display text-2xl text-uzblue-ink">
                {rec.recommended_retail !== null ? `$${rec.recommended_retail}` : "n/a"}
              </div>
              <div className="kicker mt-1">Monatt target</div>
            </div>
          </>
        ) : (
          <div className="col-span-full rounded-md border hairline bg-pearl/50 p-4 text-sm text-smoke">
            Data unavailable — no comparables for “{category}” yet.
          </div>
        )}
      </div>

      <div className="rounded-md border hairline bg-white/70 p-4 text-sm leading-relaxed">
        <div className="kicker mb-1">Recommendation</div>
        {rec.explanation}
      </div>

      <div className="overflow-x-auto rounded-md border hairline bg-white/70">
        <table className="w-full min-w-[760px] text-xs">
          <thead>
            <tr className="border-b hairline text-left">
              {["Brand", "Product", "Listed", "Sale", "USD", "Material", "Checked", "Source", "Status", ""].map((h) => (
                <th key={h} className="px-3 py-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b hairline last:border-0">
                <td className="px-3 py-2">{p.brand}</td>
                <td className="px-3 py-2">{p.product}</td>
                <td className="px-3 py-2">{p.listed_price} {p.currency}</td>
                <td className="px-3 py-2">{p.sale_price ?? "—"}</td>
                <td className="px-3 py-2 font-semibold">${p.usd_price}</td>
                <td className="px-3 py-2">{p.material ?? "—"}</td>
                <td className="px-3 py-2">{new Date(p.checked_at).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  {p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="underline">link</a> : <span className="text-smoke">none</span>}
                </td>
                <td className="px-3 py-2"><DataBadge status={p.data_status} /></td>
                <td className="px-3 py-2">
                  <button onClick={() => remove(p.id)} title="Delete this price point" className="text-smoke hover:text-red-700">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
