"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GtrendsImport() {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [region, setRegion] = useState("Global");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/import/google-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, region }),
      });
      const j = (await res.json()) as { imported?: number; term?: string; error?: string };
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setErr(false);
      setMsg(`Imported ${j.imported} data points for "${j.term}". Trend scores recomputed.`);
      setCsv("");
      router.refresh();
    } catch (e) {
      setErr(true);
      setMsg(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-md border hairline bg-white/70 p-5">
      <div className="kicker mb-2">Import Google Trends data (official CSV export)</div>
      <p className="mb-3 text-xs leading-relaxed text-smoke">
        Google Trends has no public API, so this app uses the CSV Google itself provides: open{" "}
        <a href="https://trends.google.com" target="_blank" rel="noreferrer" className="underline">trends.google.com</a>,
        search a term (e.g. “baggy jeans”), click the download icon on “Interest over time”, then paste the CSV here.
        Matching trends gain a measured “Search growth” score component.
      </p>
      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        placeholder={"Category: All categories\n\nWeek,baggy jeans: (United States)\n2026-05-24,62\n2026-05-31,64\n…"}
        rows={5}
        className="w-full rounded-sm border hairline bg-white p-2 font-mono text-[11px]"
      />
      <div className="mt-2 flex items-center gap-2">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-sm border hairline bg-white px-2 py-1.5 text-xs"
        >
          {["Global", "US", "UK", "EU", "CA", "CentralAsia"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button
          onClick={submit}
          disabled={busy || !csv.trim()}
          className="rounded-sm bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream disabled:opacity-50"
        >
          {busy ? "Importing…" : "Import CSV"}
        </button>
        {msg && <span className={`text-xs ${err ? "text-red-700" : "text-emerald-800"}`}>{msg}</span>}
      </div>
    </div>
  );
}
