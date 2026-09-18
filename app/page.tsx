import Link from "next/link";
import { BriefPanel } from "@/components/BriefPanel";
import { DataBadge, ScorePill, TrendStatusBadge } from "@/components/badges";
import { RefreshButton } from "@/components/buttons";
import { PageHeader } from "@/components/PageHeader";
import { loadAll } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await loadAll();
  const { trends, lastRefresh } = data;

  const byStatus = (s: string) => trends.filter((t) => t.status === s).length;
  const liveCount = trends.filter((t) => t.data_status === "live" || t.data_status === "cached").length;
  const rising = trends
    .filter((t) => t.status === "emerging" || t.status === "growing")
    .slice(0, 5);
  const declining = trends.filter((t) => t.status === "declining").slice(0, 3);

  const stats: { label: string; value: string | number }[] = [
    { label: "Tracked trends", value: trends.length },
    { label: "Emerging", value: byStatus("emerging") },
    { label: "Growing", value: byStatus("growing") },
    { label: "Declining", value: byStatus("declining") },
    { label: "With live evidence", value: liveCount },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker="Overview"
        title="Trend Intelligence"
        subtitle={`Storage: ${data.storage === "supabase" ? "Supabase" : "local file (.data/db.json) — add Supabase keys for cloud storage"} · AI analysis: ${data.aiConfigured ? "Claude configured" : "not configured (rule-based mode)"} · Last refresh: ${lastRefresh ? new Date(lastRefresh.finished_at).toLocaleString() : "never — data below is SAMPLE until you refresh"}`}
      >
        <RefreshButton />
      </PageHeader>

      {!lastRefresh && (
        <div className="rounded-md border border-amber-600/40 bg-amber-500/10 p-4 text-sm">
          <span className="font-semibold">You&apos;re looking at sample data.</span>{" "}
          Everything marked <DataBadge status="sample" /> is illustrative seed content. Hit{" "}
          <span className="font-semibold">Refresh sources</span> to collect live signals from Reddit and
          fashion RSS feeds — trends re-score automatically from real evidence.
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border hairline bg-white/70 p-4">
            <div className="font-display text-3xl">{s.value}</div>
            <div className="kicker mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border hairline bg-white/70 p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <div className="kicker">Top rising</div>
            <Link href="/trends" className="text-[11px] underline decoration-line hover:text-uzblue-ink">
              all trends →
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {rising.map((t) => (
              <li key={t.slug} className="flex items-center gap-3">
                <ScorePill score={t.score} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display">{t.name}</span>
                    <TrendStatusBadge status={t.status} />
                    <DataBadge status={t.data_status} />
                  </div>
                  <div className="truncate text-[11px] text-smoke">{t.recommended_action}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border hairline bg-white/70 p-6">
          <div className="kicker mb-3">Cooling off</div>
          {declining.length === 0 ? (
            <p className="text-sm text-smoke">No tracked trend is measurably declining right now.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {declining.map((t) => (
                <li key={t.slug} className="flex items-center gap-3">
                  <ScorePill score={t.score} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display">{t.name}</span>
                      <TrendStatusBadge status={t.status} />
                    </div>
                    <div className="truncate text-[11px] text-smoke">{t.risks}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="kicker mt-6 mb-3">Quick links</div>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              ["/generator", "Generate a product concept"],
              ["/predictions", "Predictions table"],
              ["/prices", "Price tracker"],
              ["/quotes", "Phrase bank"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-sm border hairline bg-cream px-3 py-1.5 hover:bg-pearl">
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <BriefPanel brief={data.briefs[0] ?? null} aiConfigured={data.aiConfigured} />
    </div>
  );
}
