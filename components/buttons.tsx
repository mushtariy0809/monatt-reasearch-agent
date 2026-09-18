"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { downloadCsv } from "@/lib/csv";
import type { RefreshResult } from "@/lib/types";

export function RefreshButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  const run = async () => {
    setBusy(true);
    setMsg("Contacting sources — Reddit and RSS feeds…");
    setErr(false);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      if (!res.ok) throw new Error(`Refresh failed (HTTP ${res.status})`);
      const r = (await res.json()) as RefreshResult;
      const failed = r.connectors.filter((c) => !c.ok);
      setMsg(
        `Fetched ${r.connectors.reduce((a, c) => a + c.fetched, 0)} items · ${r.new_signals} new · ${r.duplicates_merged} duplicates merged` +
          (failed.length ? ` · ${failed.length} source(s) failed (see Sources page)` : ""),
      );
      router.refresh();
    } catch (e) {
      setErr(true);
      setMsg(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={run}
        disabled={busy}
        className="rounded-sm bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {busy ? "Refreshing…" : "Refresh sources"}
      </button>
      {msg && (
        <div className={`max-w-xs text-right text-[11px] ${err ? "text-red-700" : "text-smoke"}`}>
          {msg}
        </div>
      )}
    </div>
  );
}

export function CsvButton({
  filename,
  rows,
  label = "Export CSV",
}: {
  filename: string;
  rows: Record<string, unknown>[];
  label?: string;
}) {
  return (
    <button
      onClick={() => downloadCsv(filename, rows)}
      disabled={rows.length === 0}
      className="rounded-sm border hairline bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-white disabled:opacity-40"
    >
      {label}
    </button>
  );
}

export function PrintButton({ label = "Export PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-sm border hairline bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink hover:bg-white"
    >
      {label}
    </button>
  );
}

export function SaveToggle({
  kind,
  refId,
  initiallySaved,
}: {
  kind: "trend" | "product" | "phrase" | "moment";
  refId: string;
  initiallySaved: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ref_id: refId }),
      });
      if (res.ok) {
        const j = (await res.json()) as { saved: boolean };
        setSaved(j.saved);
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={saved ? "Remove from Saved Ideas" : "Add to Saved Ideas"}
      className={`rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
        saved
          ? "border-uzblue bg-uzblue text-white"
          : "hairline bg-white/60 text-smoke hover:text-ink"
      }`}
    >
      {saved ? "Saved ✓" : "Save"}
    </button>
  );
}
