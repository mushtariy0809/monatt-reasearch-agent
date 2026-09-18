import { PageHeader } from "@/components/PageHeader";
import { PriceTracker } from "@/components/PriceTracker";
import { loadAll } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PricesPage() {
  const data = await loadAll();
  const hasSample = data.prices.some((p) => p.data_status === "sample");
  return (
    <div>
      <PageHeader
        kicker="Price Tracker"
        title="Market pricing intelligence"
        subtitle={`Comparable streetwear prices with market stats and a recommended Monatt retail price per category (mid-tier positioning). Prices are never invented — recommendations appear only with 3+ comparables.${hasSample ? " ⚠ Sample rows are placeholders: replace them with checked prices (✕ deletes a row)." : ""}`}
      />
      <PriceTracker prices={data.prices} />
    </div>
  );
}
