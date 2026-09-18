"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WeeklyBrief } from "@/lib/types";
import { DataBadge } from "./badges";
import { PrintButton } from "./buttons";

export function BriefPanel({ brief, aiConfigured }: { brief: WeeklyBrief | null; aiConfigured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/brief", { method: "POST" });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Brief generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-md border hairline bg-white/70 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="kicker">Weekly Monatt Brief</div>
          {brief && (
            <div className="mt-1 text-xs text-smoke">
              Week of {brief.week_of} · generated {new Date(brief.generated_at).toLocaleString()} · overall confidence{" "}
              {Math.round(brief.confidence * 100)}% <DataBadge status={brief.data_status} />
            </div>
          )}
        </div>
        <div className="no-print flex gap-2">
          {brief && <PrintButton label="Print / PDF" />}
          <button
            onClick={generate}
            disabled={busy}
            className="rounded-sm bg-uzblue px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Generating…" : "Generate Weekly Monatt Brief"}
          </button>
        </div>
      </div>
      {err && <p className="mb-3 text-xs text-red-700">{err}</p>}

      {!brief ? (
        <p className="text-sm text-smoke">
          No brief yet. Generate one to get the week&apos;s fastest-rising trends, decliners to avoid, cultural
          signals, product opportunities, a capsule sketch and next actions —{" "}
          {aiConfigured ? "with an AI-written narrative." : "add an ANTHROPIC_API_KEY for an AI-written narrative."}
        </p>
      ) : (
        <div className="grid gap-6 text-sm md:grid-cols-2">
          {brief.narrative && (
            <div className="md:col-span-2 rounded-sm bg-pearl/60 p-4">
              <div className="kicker mb-1">Narrative <DataBadge status="ai" /></div>
              <p className="leading-relaxed">{brief.narrative}</p>
            </div>
          )}
          <div>
            <div className="kicker mb-2">Fastest-growing</div>
            <ol className="list-decimal space-y-1 pl-5 text-xs">
              {brief.rising.map((r) => (
                <li key={r.slug}><span className="font-semibold">{r.name}</span> ({r.score}/100) — {r.reason}</li>
              ))}
            </ol>
          </div>
          <div>
            <div className="kicker mb-2">Declining — avoid</div>
            <ol className="list-decimal space-y-1 pl-5 text-xs">
              {brief.declining.length === 0 && <li className="list-none text-smoke">None flagged this week.</li>}
              {brief.declining.map((r) => (
                <li key={r.slug}><span className="font-semibold">{r.name}</span> — {r.reason}</li>
              ))}
            </ol>
          </div>
          <div>
            <div className="kicker mb-2">Cultural signals</div>
            <ul className="space-y-1 text-xs">
              {brief.cultural_signals.map((c, i) => (
                <li key={i}><span className="font-semibold">{c.title}:</span> {c.why}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="kicker mb-2">Product opportunities</div>
            <ul className="space-y-1 text-xs">
              {brief.product_opportunities.map((p, i) => (
                <li key={i}><span className="font-semibold">{p.name}:</span> {p.why}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="kicker mb-2">Price notes</div>
            <ul className="space-y-1 text-xs">
              {brief.price_notes.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
          <div>
            <div className="kicker mb-2">Capsule sketch</div>
            <p className="text-xs font-semibold">{brief.capsule.name}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs">
              {brief.capsule.pieces.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
            <p className="mt-1 text-[11px] text-smoke">{brief.capsule.rationale}</p>
          </div>
          <div>
            <div className="kicker mb-2">Predicted next trend</div>
            <p className="text-xs">
              <span className="font-semibold">{brief.next_trend.name}</span> — {brief.next_trend.reasoning}{" "}
              <span className="text-smoke">(confidence {Math.round(brief.next_trend.confidence * 100)}%)</span>
            </p>
          </div>
          <div>
            <div className="kicker mb-2">Next actions</div>
            <ul className="list-disc space-y-0.5 pl-5 text-xs">
              {brief.next_actions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
          {brief.evidence_links.length > 0 && (
            <div className="md:col-span-2">
              <div className="kicker mb-2">Evidence links</div>
              <ul className="space-y-0.5 text-xs">
                {brief.evidence_links.map((e, i) => (
                  <li key={i}>
                    <a href={e.url} target="_blank" rel="noreferrer" className="underline decoration-line hover:text-uzblue-ink">
                      {e.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
