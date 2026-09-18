import { DataBadge } from "@/components/badges";
import { RefreshButton } from "@/components/buttons";
import { GtrendsImport } from "@/components/GtrendsImport";
import { PageHeader } from "@/components/PageHeader";
import { CONNECTORS } from "@/lib/connectors";
import { loadAll } from "@/lib/data";
import { WEIGHTS } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const WEIGHT_LABELS: Record<string, [string, string]> = {
  growth_velocity: ["Growth velocity", "measured — mentions last 7 days vs prior 3 weeks"],
  search_growth: ["Search growth", "measured — imported Google Trends interest, recent vs earlier"],
  cross_platform: ["Cross-platform presence", "measured — distinct platforms with mentions"],
  engagement: ["Engagement", "measured — recency-weighted engagement across mentions"],
  diaspora_relevance: ["Uzbek diaspora relevance", "estimated — editorial prior from the taxonomy"],
  genz_relevance: ["Wider Gen Z relevance", "estimated — editorial prior"],
  originality: ["Originality headroom", "estimated — editorial prior"],
  cultural_authenticity: ["Cultural authenticity", "estimated — editorial prior"],
  commercial_potential: ["Commercial potential", "estimated — editorial prior"],
  seasonal_fit: ["Seasonal fit", "estimated — seasonal months vs current date"],
  market_headroom: ["Market headroom", "estimated — inverse of saturation prior"],
  longevity: ["Estimated longevity", "estimated — editorial lifespan prior"],
};

export default async function SourcesPage() {
  const data = await loadAll();
  const last = data.lastRefresh;
  const connStatus = new Map(last?.connectors.map((c) => [c.source, c]) ?? []);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        kicker="Sources & Methodology"
        title="How this intelligence is made"
        subtitle={`Storage: ${data.storage === "supabase" ? "Supabase (cloud)" : "local file — .data/db.json"}. Every data point stores its source, collection date, region and confidence. No restricted platforms are scraped; only public JSON APIs, RSS feeds and official CSV exports are used.`}
      >
        <RefreshButton />
      </PageHeader>

      <section>
        <div className="kicker mb-3">Connectors</div>
        <div className="overflow-x-auto rounded-md border hairline bg-white/70">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className="border-b hairline text-left">
                {["Source", "What it provides", "Access method", "Last refresh"].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONNECTORS.map((c) => {
                const s = connStatus.get(c.source);
                return (
                  <tr key={c.source} className="border-b hairline last:border-0 align-top">
                    <td className="whitespace-nowrap px-3 py-2 font-semibold">{c.source}</td>
                    <td className="px-3 py-2">{c.description}</td>
                    <td className="px-3 py-2 text-smoke">{c.access}</td>
                    <td className="px-3 py-2">
                      {!last ? (
                        <span className="text-smoke">never run</span>
                      ) : s?.ok ? (
                        <span className="text-emerald-800">✓ {s.fetched} items</span>
                      ) : (
                        <span className="text-red-800" title={s?.error ?? ""}>✗ {s?.error ?? "not run"}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="align-top">
                <td className="whitespace-nowrap px-3 py-2 font-semibold">google-trends:csv</td>
                <td className="px-3 py-2">Search-interest series powering the “Search growth” score component.</td>
                <td className="px-3 py-2 text-smoke">Official CSV export from trends.google.com, pasted below.</td>
                <td className="px-3 py-2 text-smoke">manual import</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <GtrendsImport />

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border hairline bg-white/70 p-5">
          <div className="kicker mb-3">Data provenance legend</div>
          <ul className="flex flex-col gap-2 text-xs">
            <li><DataBadge status="live" /> Collected from a live source during the most recent refresh.</li>
            <li><DataBadge status="cached" /> Collected live on an earlier refresh; still stored evidence.</li>
            <li><DataBadge status="sample" /> Illustrative seed data. Never a real observation; replace by refreshing or manual entry.</li>
            <li><DataBadge status="manual" /> Entered or imported by you (checked prices, Trends CSVs).</li>
            <li><DataBadge status="ai" /> Model interpretation (scores’ estimated factors, forecasts, generated concepts) — clearly separated from measured fact.</li>
          </ul>
        </div>
        <div className="rounded-md border hairline bg-white/70 p-5">
          <div className="kicker mb-3">Scoring model (0–100)</div>
          <table className="w-full text-xs">
            <tbody>
              {Object.entries(WEIGHTS).map(([k, w]) => (
                <tr key={k} className="border-b hairline last:border-0">
                  <td className="py-1 pr-2 font-semibold">{WEIGHT_LABELS[k][0]}</td>
                  <td className="w-12 py-1 pr-2">{Math.round(w * 100)}%</td>
                  <td className="py-1 text-smoke">{WEIGHT_LABELS[k][1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] leading-relaxed text-smoke">
            Unavailable measured factors are excluded and weights renormalized — a trend is never punished for
            missing data, and the gap is disclosed in its score explanation. Recent evidence is weighted
            exponentially (half-life ≈ 10 days). Duplicates across sources are merged by URL and normalized title.
          </p>
        </div>
      </section>

      <section className="rounded-md border hairline bg-white/70 p-5 text-xs leading-relaxed">
        <div className="kicker mb-2">Method & ethics notes</div>
        <ul className="list-disc space-y-1 pl-5">
          <li>Sources: Reddit public JSON listings and publisher RSS feeds (both explicitly public), plus official Google Trends CSV exports and your own manual entries. No scraping of TikTok, Instagram or Pinterest — observations from those platforms enter only as labeled manual/sample entries.</li>
          <li>Predictions are rule-based estimates with stated reasoning and confidence — never guarantees.</li>
          <li>Prices are never invented; recommendations require 3+ comparables or show “Data unavailable”.</li>
          <li>Phrases are never attributed to a person without a source; protected lyrics and slogans are excluded.</li>
          <li>Celebrity/creator relevance never implies endorsement; likeness use requires permission.</li>
          <li>Cultural elements are treated as inspiration for original design — never direct reproduction of traditional artworks, other designers, or existing products.</li>
        </ul>
      </section>
    </div>
  );
}
