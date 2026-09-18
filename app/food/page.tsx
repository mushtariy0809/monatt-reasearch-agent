import { DataBadge } from "@/components/badges";
import { RefreshButton, SaveToggle } from "@/components/buttons";
import { PageHeader } from "@/components/PageHeader";
import { TrendExplorer } from "@/components/TrendExplorer";
import { loadAll, savedIds } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function FoodPage() {
  const data = await loadAll();
  const saved = savedIds(data.saved);
  const foodMoments = data.moments.filter((m) => m.type === "food");
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        kicker="Food & Lifestyle"
        title="Food, drink & everyday culture"
        subtitle="Food is the diaspora's most shareable culture — and food graphics are proven streetwear territory. These signals feed the food-capsule design lane."
      >
        <RefreshButton />
      </PageHeader>

      {foodMoments.length > 0 && (
        <section>
          <div className="kicker mb-3">Food moments</div>
          <div className="grid gap-3 md:grid-cols-2">
            {foodMoments.map((m) => (
              <div key={m.id} className="rounded-md border hairline bg-white/70 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display text-lg">{m.title}</div>
                  <div className="flex items-center gap-2">
                    <DataBadge status={m.data_status} />
                    <SaveToggle kind="moment" refId={m.id} initiallySaved={saved.includes(`moment:${m.id}`)} />
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{m.description}</p>
                <p className="mt-2 text-xs"><span className="kicker">Apply: </span>{m.application}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="kicker mb-3">Food & lifestyle trends</div>
        <TrendExplorer trends={data.trends} savedIds={saved} presetCategories={["food", "cultural"]} />
      </section>
    </div>
  );
}
