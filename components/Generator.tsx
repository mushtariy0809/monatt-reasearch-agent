"use client";

import { useState } from "react";
import type { ProductIdea, Trend } from "@/lib/types";
import { DataBadge } from "./badges";
import { SaveToggle } from "./buttons";

const CATEGORIES = ["tee", "hoodie", "crewneck", "cap", "jacket", "pants", "accessory"];
const SEASONS = ["Autumn/Winter 2026", "Spring/Summer 2027", "Navruz 2027 capsule", "Year-round essential"];

export function IdeaCard({ idea, saved }: { idea: ProductIdea; saved: boolean }) {
  const row = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-[110px_1fr] gap-2 border-b hairline py-1.5 text-xs last:border-0">
      <div className="kicker !text-[9px] pt-0.5">{label}</div>
      <div className="leading-relaxed">{value}</div>
    </div>
  );
  return (
    <div className="rounded-md border hairline bg-white/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-xl">{idea.name}</div>
          <div className="mt-0.5 text-xs text-smoke">
            {idea.category} · {idea.season} · generated {new Date(idea.created_at).toLocaleDateString()} ·{" "}
            {idea.generated_by === "ai" ? "Claude concept" : "rule-based draft"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DataBadge status={idea.data_status} />
          <SaveToggle kind="product" refId={idea.id} initiallySaved={saved} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <div className="rounded-sm bg-ink px-3 py-1.5 text-cream">
          Retail <span className="font-display">${idea.retail_price}</span>
        </div>
        <div className="rounded-sm bg-pearl px-3 py-1.5">
          Cost target <span className="font-display">${idea.cost_target}</span>
        </div>
      </div>
      <div className="mt-4">
        {row("Front", idea.front_concept)}
        {row("Back", idea.back_concept)}
        {row("Silhouette", idea.silhouette)}
        {row("Colors", idea.colors.join(" · "))}
        {row("Materials", idea.materials.join(" · "))}
        {row("Placement", idea.placement)}
        {row("Styling", idea.styling)}
        {row("Cultural inspiration", idea.cultural_inspiration)}
        {row("Why it connects", idea.why_it_connects)}
        {row("Trend connection", idea.trend_connection)}
        {row("Campaign idea", idea.campaign_idea)}
        {row("Sensitivity notes", <span className="text-red-900/80">{idea.sensitivity_notes}</span>)}
      </div>
    </div>
  );
}

export function Generator({
  trends,
  ideas,
  savedIds,
  aiConfigured,
}: {
  trends: Trend[];
  ideas: ProductIdea[];
  savedIds: string[];
  aiConfigured: boolean;
}) {
  const [category, setCategory] = useState("tee");
  const [season, setSeason] = useState(SEASONS[0]);
  const [count, setCount] = useState(2);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [fresh, setFresh] = useState<ProductIdea[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setErr(null);
    setNote(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, season, count, trendSlugs: selected }),
      });
      const j = (await res.json()) as { ideas?: ProductIdea[]; note?: string; error?: string };
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setFresh(j.ideas ?? []);
      setNote(j.note ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  const input = "rounded-sm border hairline bg-white px-2 py-1.5 text-xs";
  const shown = fresh.length > 0 ? fresh : [];
  const history = ideas.filter((i) => !shown.some((s) => s.id === i.id));

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-md border hairline bg-white/70 p-5">
        <div className="kicker mb-3">Brief the generator</div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={season} onChange={(e) => setSeason(e.target.value)} className={input}>
            {SEASONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} className={input}>
            {[1, 2, 3].map((n) => <option key={n} value={n}>{n} concept{n > 1 ? "s" : ""}</option>)}
          </select>
          <button
            onClick={generate}
            disabled={busy}
            className="rounded-sm bg-uzblue px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Designing…" : "Generate concepts"}
          </button>
        </div>
        <div className="mt-3">
          <div className="mb-1 text-[11px] text-smoke">
            Build on specific trends (optional — top-scored trends are used otherwise):
          </div>
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
            {trends.map((t) => (
              <button
                key={t.slug}
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(t.slug) ? prev.filter((s) => s !== t.slug) : [...prev, t.slug].slice(-4),
                  )
                }
                className={`rounded-full border px-2.5 py-1 text-[11px] ${
                  selected.includes(t.slug)
                    ? "border-uzblue bg-uzblue/10 text-uzblue-ink"
                    : "hairline bg-white/60 text-smoke hover:text-ink"
                }`}
              >
                {t.name} · {t.score}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[11px] text-smoke">
          {aiConfigured
            ? "Claude writes original concepts under Monatt's cultural guardrails (labeled AI)."
            : "No ANTHROPIC_API_KEY configured — concepts are transparent rule-based drafts. Add a key in .env.local for AI concepts."}
        </p>
      </div>

      {err && <p className="text-sm text-red-700">{err}</p>}
      {note && <p className="text-xs text-smoke">{note}</p>}

      {shown.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="kicker">Fresh concepts</div>
          {shown.map((i) => (
            <IdeaCard key={i.id} idea={i} saved={savedIds.includes(`product:${i.id}`)} />
          ))}
        </section>
      )}

      {history.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="kicker">Previously generated</div>
          {history.map((i) => (
            <IdeaCard key={i.id} idea={i} saved={savedIds.includes(`product:${i.id}`)} />
          ))}
        </section>
      )}
    </div>
  );
}
