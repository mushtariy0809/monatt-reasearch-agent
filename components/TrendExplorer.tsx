"use client";

import { useMemo, useState } from "react";
import type { Trend, TrendCategory } from "@/lib/types";
import { DataBadge, ScorePill, TrendStatusBadge } from "./badges";
import { CsvButton, SaveToggle } from "./buttons";
import { EmptyState } from "./PageHeader";

type SortKey = "score" | "velocity" | "name" | "updated" | "evidence";

function velocityOf(t: Trend): number | null {
  const c = t.score_components.find((x) => x.key === "growth_velocity");
  return c && !c.unavailable ? c.value : null;
}

export function TrendExplorer({
  trends,
  savedIds,
  presetCategories,
}: {
  trends: Trend[];
  savedIds: string[];
  presetCategories?: TrendCategory[];
}) {
  const base = useMemo(
    () =>
      presetCategories
        ? trends.filter((t) => presetCategories.includes(t.category))
        : trends,
    [trends, presetCategories],
  );

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [region, setRegion] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<SortKey>("score");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);

  const categories = useMemo(
    () => [...new Set(base.map((t) => t.category))].sort(),
    [base],
  );
  const regions = useMemo(
    () => [...new Set(base.flatMap((t) => t.regions))].sort(),
    [base],
  );
  const platforms = useMemo(
    () => [...new Set(base.flatMap((t) => t.platforms))].sort(),
    [base],
  );

  const filtered = useMemo(() => {
    let out = base.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (status !== "all" && t.status !== status) return false;
      if (region !== "all" && !t.regions.includes(region as Trend["regions"][number])) return false;
      if (platform !== "all" && !t.platforms.includes(platform as Trend["platforms"][number]))
        return false;
      if (t.score < minScore) return false;
      if (q) {
        const hay = `${t.name} ${t.description} ${t.cultural_relevance}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "score": return b.score - a.score;
        case "velocity": return (velocityOf(b) ?? -1) - (velocityOf(a) ?? -1);
        case "name": return a.name.localeCompare(b.name);
        case "updated": return b.last_updated.localeCompare(a.last_updated);
        case "evidence": return b.evidence_count - a.evidence_count;
      }
    });
    return out;
  }, [base, q, category, status, region, platform, minScore, sort]);

  const csvRows = filtered.map((t) => ({
    name: t.name, category: t.category, status: t.status, score: t.score,
    velocity: velocityOf(t)?.toFixed(1) ?? "unavailable",
    regions: t.regions.join("|"), audience: t.audience,
    evidence_count: t.evidence_count, lifespan: t.estimated_lifespan,
    recommended_action: t.recommended_action, data_status: t.data_status,
    last_updated: t.last_updated,
  }));

  const compared = base.filter((t) => compare.includes(t.slug));

  const sel = "rounded-sm border hairline bg-white/70 px-2 py-1.5 text-xs";

  return (
    <div>
      {/* Filter bar */}
      <div className="no-print mb-5 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search trends…"
          className={`${sel} w-44`}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={sel}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={sel}>
          <option value="all">Any status</option>
          {["emerging", "growing", "peaking", "saturated", "declining"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={sel}>
          <option value="all">All regions</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={sel}>
          <option value="all">All platforms</option>
          {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <label className="flex items-center gap-1 text-xs text-smoke">
          Min score
          <input
            type="number" min={0} max={100} value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value) || 0)}
            className={`${sel} w-16`}
          />
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={sel}>
          <option value="score">Sort: score</option>
          <option value="velocity">Sort: velocity</option>
          <option value="evidence">Sort: evidence</option>
          <option value="name">Sort: name</option>
          <option value="updated">Sort: updated</option>
        </select>
        <div className="ml-auto">
          <CsvButton filename="monatt-trends.csv" rows={csvRows} />
        </div>
      </div>

      {/* Comparison panel */}
      {compared.length >= 2 && (
        <div className="mb-6 overflow-x-auto rounded-md border hairline bg-white/70 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="kicker">Comparison</div>
            <button onClick={() => setCompare([])} className="text-[11px] text-smoke underline">
              clear
            </button>
          </div>
          <table className="w-full min-w-[520px] text-xs">
            <thead>
              <tr className="border-b hairline text-left">
                <th className="py-1 pr-3 font-semibold">Factor</th>
                {compared.map((t) => (
                  <th key={t.slug} className="py-1 pr-3 font-semibold">{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hairline">
                <td className="py-1 pr-3 text-smoke">Score</td>
                {compared.map((t) => <td key={t.slug} className="py-1 pr-3 font-display text-base">{t.score}</td>)}
              </tr>
              <tr className="border-b hairline">
                <td className="py-1 pr-3 text-smoke">Status</td>
                {compared.map((t) => <td key={t.slug} className="py-1 pr-3">{t.status}</td>)}
              </tr>
              {compared[0].score_components.map((c) => (
                <tr key={c.key} className="border-b hairline last:border-0">
                  <td className="py-1 pr-3 text-smoke">{c.label}</td>
                  {compared.map((t) => {
                    const comp = t.score_components.find((x) => x.key === c.key);
                    return (
                      <td key={t.slug} className="py-1 pr-3">
                        {comp?.unavailable ? <span className="text-smoke">n/a</span> : comp?.value.toFixed(1)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No trends match these filters"
          hint="Loosen a filter, clear the search box, or hit Refresh sources to collect new signals."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((t) => {
            const v = velocityOf(t);
            const open = expanded === t.slug;
            return (
              <li key={t.slug} className="rounded-md border hairline bg-white/70">
                <div className="flex items-start gap-4 p-4">
                  <ScorePill score={t.score} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setExpanded(open ? null : t.slug)}
                        className="text-left font-display text-lg hover:text-uzblue-ink"
                      >
                        {t.name}
                      </button>
                      <TrendStatusBadge status={t.status} />
                      <DataBadge status={t.data_status} />
                      <span className="kicker !text-[9px]">{t.category}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-charcoal/90">{t.description}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-smoke">
                      <span>Velocity: {v === null ? "n/a" : `${v.toFixed(1)}/10`}</span>
                      <span>{t.evidence_count} mention(s)</span>
                      <span>{t.regions.join(" · ")}</span>
                      <span>{t.audience}</span>
                      <span>Lifespan: {t.estimated_lifespan}</span>
                    </div>
                  </div>
                  <div className="no-print flex shrink-0 flex-col items-end gap-2">
                    <SaveToggle kind="trend" refId={t.slug} initiallySaved={savedIds.includes(`trend:${t.slug}`)} />
                    <label className="flex items-center gap-1 text-[10px] text-smoke">
                      <input
                        type="checkbox"
                        checked={compare.includes(t.slug)}
                        onChange={(e) =>
                          setCompare((prev) =>
                            e.target.checked ? [...prev, t.slug].slice(-3) : prev.filter((s) => s !== t.slug),
                          )
                        }
                      />
                      compare
                    </label>
                  </div>
                </div>

                {open && (
                  <div className="border-t hairline p-4 text-sm">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <div className="kicker mb-2">Score breakdown</div>
                        <table className="w-full text-xs">
                          <tbody>
                            {t.score_components.map((c) => (
                              <tr key={c.key} className="border-b hairline last:border-0 align-top">
                                <td className="py-1.5 pr-2">
                                  <div className="font-semibold">{c.label}</div>
                                  <div className="text-[10px] text-smoke">
                                    {c.kind === "measured" ? "measured" : "estimated"} · weight {(c.weight * 100).toFixed(0)}%
                                  </div>
                                </td>
                                <td className="w-14 py-1.5 pr-2 font-display text-sm">
                                  {c.unavailable ? <span className="text-[10px] text-smoke">n/a</span> : `${c.value.toFixed(1)}`}
                                </td>
                                <td className="py-1.5 text-[11px] leading-snug text-smoke">{c.explanation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="mt-2 text-[11px] italic leading-snug text-smoke">{t.score_explanation}</p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="kicker mb-1">Cultural relevance</div>
                          <p className="text-xs leading-relaxed">{t.cultural_relevance}</p>
                        </div>
                        <div>
                          <div className="kicker mb-1">Commercial opportunity</div>
                          <p className="text-xs leading-relaxed">{t.commercial_opportunity}</p>
                        </div>
                        <div>
                          <div className="kicker mb-1">Risks & concerns</div>
                          <p className="text-xs leading-relaxed">{t.risks}</p>
                        </div>
                        <div>
                          <div className="kicker mb-1">Recommended action</div>
                          <p className="text-xs font-semibold leading-relaxed">{t.recommended_action}</p>
                        </div>
                        <div>
                          <div className="kicker mb-1">Evidence ({t.evidence_count})</div>
                          {t.evidence.length === 0 ? (
                            <p className="text-xs text-smoke">No collected mentions yet.</p>
                          ) : (
                            <ul className="flex flex-col gap-1">
                              {t.evidence.map((e, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs">
                                  <DataBadge status={e.data_status} />
                                  <span className="min-w-0">
                                    {e.url ? (
                                      <a href={e.url} target="_blank" rel="noreferrer" className="underline decoration-line hover:text-uzblue-ink">
                                        {e.title}
                                      </a>
                                    ) : (
                                      <span>{e.title}</span>
                                    )}
                                    <span className="text-smoke"> — {e.platform}, {new Date(e.published_at).toLocaleDateString()}{e.engagement > 0 ? `, engagement ${e.engagement.toLocaleString()}` : ""}</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
