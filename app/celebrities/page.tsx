import { DataBadge } from "@/components/badges";
import { SaveToggle } from "@/components/buttons";
import { PageHeader } from "@/components/PageHeader";
import { loadAll, savedIds } from "@/lib/data";

export const dynamic = "force-dynamic";

const OPPORTUNITY_STYLE: Record<string, string> = {
  organic: "bg-emerald-700/10 text-emerald-800",
  "short-term": "bg-amber-500/15 text-amber-800",
  risky: "bg-red-700/10 text-red-800",
  oversaturated: "bg-stone-500/15 text-stone-700",
};

export default async function CelebritiesPage() {
  const data = await loadAll();
  const saved = savedIds(data.saved);
  const people = data.moments.filter((m) => m.type === "celebrity" || m.type === "creator");
  return (
    <div>
      <PageHeader
        kicker="Celebrities & Creators"
        title="People driving attention"
        subtitle="Public figures and creator ecosystems relevant to the audience, with an honest read on whether the opportunity is organic, short-term, risky or oversaturated. Relevance never implies endorsement — names, faces and likenesses require permission before any product use."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {people.map((m) => (
          <div key={m.id} className="rounded-md border hairline bg-white/70 p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="font-display text-xl">{m.title}</div>
              <div className="flex items-center gap-2">
                <DataBadge status={m.data_status} />
                <SaveToggle kind="moment" refId={m.id} initiallySaved={saved.includes(`moment:${m.id}`)} />
              </div>
            </div>
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${OPPORTUNITY_STYLE[m.opportunity]}`}>
              {m.opportunity}
            </span>
            <p className="mt-2 text-sm leading-relaxed">{m.description}</p>
            <p className="mt-2 text-xs"><span className="kicker">Why relevant: </span>{m.relevance}</p>
            <p className="mt-1 text-xs"><span className="kicker">How to use: </span>{m.application}</p>
            <p className="mt-2 border-t hairline pt-2 text-[11px] text-red-900/80">⚠ {m.risk_notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
