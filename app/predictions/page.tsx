import { PageHeader } from "@/components/PageHeader";
import { PredictionsTable } from "@/components/PredictionsTable";
import { loadAll } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PredictionsPage() {
  const data = await loadAll();
  return (
    <div>
      <PageHeader
        kicker="Predictions"
        title="Where each trend is heading"
        subtitle="Sortable forecasts for every tracked trend across four horizons. Each row explains its evidence, reasoning and uncertainty — click to expand."
      />
      <PredictionsTable predictions={data.predictions} />
    </div>
  );
}
