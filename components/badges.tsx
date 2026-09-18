import type { DataStatus, TrendStatus } from "@/lib/types";

const DATA_STYLES: Record<DataStatus, { bg: string; label: string; title: string }> = {
  live: { bg: "bg-emerald-700 text-white", label: "LIVE", title: "Collected from a live source this refresh" },
  cached: { bg: "bg-emerald-900/70 text-white", label: "CACHED", title: "Collected live on an earlier refresh" },
  sample: { bg: "bg-amber-600 text-white", label: "SAMPLE", title: "Illustrative sample data — not a real observation" },
  manual: { bg: "bg-uzblue text-white", label: "MANUAL", title: "Entered or imported by you" },
  ai: { bg: "bg-charcoal text-white", label: "AI", title: "AI/model interpretation — not collected fact" },
};

export function DataBadge({ status }: { status: DataStatus }) {
  const s = DATA_STYLES[status];
  return (
    <span
      title={s.title}
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${s.bg}`}
    >
      {s.label}
    </span>
  );
}

const TREND_STYLES: Record<TrendStatus, string> = {
  emerging: "bg-uzblue/15 text-uzblue-ink border-uzblue/40",
  growing: "bg-emerald-700/10 text-emerald-800 border-emerald-700/30",
  peaking: "bg-amber-500/15 text-amber-800 border-amber-600/30",
  saturated: "bg-stone-500/15 text-stone-700 border-stone-500/30",
  declining: "bg-red-700/10 text-red-800 border-red-700/30",
};

export function TrendStatusBadge({ status }: { status: TrendStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TREND_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 70 ? "bg-ink text-cream" : score >= 50 ? "bg-charcoal/80 text-cream" : "bg-pearl text-smoke";
  return (
    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full font-display text-sm ${tone}`}>
      {score}
    </span>
  );
}
