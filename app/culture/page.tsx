import { DataBadge } from "@/components/badges";
import { RefreshButton, SaveToggle } from "@/components/buttons";
import { PageHeader } from "@/components/PageHeader";
import { TrendExplorer } from "@/components/TrendExplorer";
import { loadAll, savedIds } from "@/lib/data";

export const dynamic = "force-dynamic";

const OPPORTUNITY_STYLE: Record<string, string> = {
  organic: "bg-emerald-700/10 text-emerald-800",
  "short-term": "bg-amber-500/15 text-amber-800",
  risky: "bg-red-700/10 text-red-800",
  oversaturated: "bg-stone-500/15 text-stone-700",
};

export default async function CulturePage() {
  const data = await loadAll();
  const saved = savedIds(data.saved);
  const dates = data.moments
    .filter((m) => m.type === "date" || m.type === "sport")
    .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
  const nostalgia = data.moments.filter((m) =>
    ["nostalgia", "meme", "collab", "event", "music"].includes(m.type),
  );

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        kicker="Uzbek & Diaspora Culture"
        title="Cultural signals"
        subtitle="Cultural moments, important dates, nostalgia and diaspora identity trends — the raw material for products that feel personal, not costume."
      >
        <RefreshButton />
      </PageHeader>

      <section>
        <div className="kicker mb-3">Dates & moments on the calendar</div>
        <div className="grid gap-3 md:grid-cols-2">
          {dates.map((m) => (
            <div key={m.id} className="rounded-md border hairline bg-white/70 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="font-display text-lg">{m.title}</div>
                <div className="flex items-center gap-2">
                  <DataBadge status={m.data_status} />
                  <SaveToggle kind="moment" refId={m.id} initiallySaved={saved.includes(`moment:${m.id}`)} />
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                {m.date && <span className="font-semibold text-uzblue-ink">{m.date}</span>}
                <span className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider ${OPPORTUNITY_STYLE[m.opportunity]}`}>
                  {m.opportunity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{m.description}</p>
              <p className="mt-2 text-xs"><span className="kicker">Apply: </span>{m.application}</p>
              <p className="mt-1 text-[11px] text-smoke">{m.risk_notes}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="kicker mb-3">Nostalgia, memes & collab territory</div>
        <div className="grid gap-3 md:grid-cols-2">
          {nostalgia.map((m) => (
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
              <p className="mt-1 text-[11px] text-smoke">{m.risk_notes}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="kicker mb-3">Cultural & diaspora trends</div>
        <TrendExplorer
          trends={data.trends}
          savedIds={saved}
          presetCategories={["cultural", "diaspora", "food", "meme", "event", "music", "phrase", "celebrity"]}
        />
      </section>
    </div>
  );
}
