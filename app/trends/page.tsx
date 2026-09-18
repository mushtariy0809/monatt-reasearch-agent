import { RefreshButton } from "@/components/buttons";
import { PageHeader } from "@/components/PageHeader";
import { TrendExplorer } from "@/components/TrendExplorer";
import { loadAll, savedIds } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  const data = await loadAll();
  return (
    <div>
      <PageHeader
        kicker="Live Trends"
        title="Every tracked trend"
        subtitle="All trends the agent monitors, scored 0–100 from measured signals plus editorial priors. Expand any trend for the full score breakdown, evidence links and recommended action. Select 2–3 to compare."
      >
        <RefreshButton />
      </PageHeader>
      <TrendExplorer trends={data.trends} savedIds={savedIds(data.saved)} />
    </div>
  );
}
