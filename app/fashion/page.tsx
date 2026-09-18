import { RefreshButton } from "@/components/buttons";
import { PageHeader } from "@/components/PageHeader";
import { TrendExplorer } from "@/components/TrendExplorer";
import { loadAll, savedIds } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function FashionPage() {
  const data = await loadAll();
  return (
    <div>
      <PageHeader
        kicker="Fashion & Streetwear"
        title="Garments, fits, colors & materials"
        subtitle="The wearable layer: silhouettes, garments, colors, fabrics, graphics, embroidery, accessories and styling moves relevant to the next Monatt drop."
      >
        <RefreshButton />
      </PageHeader>
      <TrendExplorer
        trends={data.trends}
        savedIds={savedIds(data.saved)}
        presetCategories={[
          "garment", "silhouette", "color", "fabric", "graphic",
          "embroidery", "accessory", "footwear", "styling", "aesthetic", "seasonal",
        ]}
      />
    </div>
  );
}
