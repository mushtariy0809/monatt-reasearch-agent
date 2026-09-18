import { Generator } from "@/components/Generator";
import { PageHeader } from "@/components/PageHeader";
import { loadAll, savedIds } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function GeneratorPage() {
  const data = await loadAll();
  return (
    <div>
      <PageHeader
        kicker="Outfit Generator"
        title="Trend → Monatt concept"
        subtitle="Turns tracked trends into original product concepts: front/back, silhouette, colors, materials, placement, styling, pricing, campaign idea and cultural-sensitivity notes. Concepts are starting points for a designer — never direct copies of anyone's work."
      />
      <Generator
        trends={data.trends}
        ideas={data.ideas}
        savedIds={savedIds(data.saved)}
        aiConfigured={data.aiConfigured}
      />
    </div>
  );
}
