import { DataBadge, ScorePill, TrendStatusBadge } from "@/components/badges";
import { SaveToggle } from "@/components/buttons";
import { IdeaCard } from "@/components/Generator";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { loadAll } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const data = await loadAll();
  const savedTrends = data.saved
    .filter((s) => s.kind === "trend")
    .map((s) => data.trends.find((t) => t.slug === s.ref_id))
    .filter(Boolean);
  const savedIdeas = data.saved
    .filter((s) => s.kind === "product")
    .map((s) => data.ideas.find((i) => i.id === s.ref_id))
    .filter(Boolean);
  const savedPhrases = data.saved
    .filter((s) => s.kind === "phrase")
    .map((s) => data.phrases.find((p) => p.id === s.ref_id))
    .filter(Boolean);
  const savedMoments = data.saved
    .filter((s) => s.kind === "moment")
    .map((s) => data.moments.find((m) => m.id === s.ref_id))
    .filter(Boolean);

  const empty =
    savedTrends.length + savedIdeas.length + savedPhrases.length + savedMoments.length === 0;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        kicker="Saved Ideas"
        title="Your shortlist"
        subtitle="Everything you've saved across trends, product concepts, phrases and cultural moments."
      />
      {empty && (
        <EmptyState
          title="Nothing saved yet"
          hint="Use the Save button on any trend, generated concept, phrase or cultural moment to build your shortlist here."
        />
      )}

      {savedTrends.length > 0 && (
        <section>
          <div className="kicker mb-3">Trends</div>
          <ul className="flex flex-col gap-3">
            {savedTrends.map((t) => (
              <li key={t!.slug} className="flex items-center gap-3 rounded-md border hairline bg-white/70 p-4">
                <ScorePill score={t!.score} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg">{t!.name}</span>
                    <TrendStatusBadge status={t!.status} />
                    <DataBadge status={t!.data_status} />
                  </div>
                  <div className="text-xs text-smoke">{t!.recommended_action}</div>
                </div>
                <SaveToggle kind="trend" refId={t!.slug} initiallySaved />
              </li>
            ))}
          </ul>
        </section>
      )}

      {savedIdeas.length > 0 && (
        <section>
          <div className="kicker mb-3">Product concepts</div>
          <div className="flex flex-col gap-4">
            {savedIdeas.map((i) => (
              <IdeaCard key={i!.id} idea={i!} saved />
            ))}
          </div>
        </section>
      )}

      {savedPhrases.length > 0 && (
        <section>
          <div className="kicker mb-3">Phrases</div>
          <ul className="grid gap-3 md:grid-cols-2">
            {savedPhrases.map((p) => (
              <li key={p!.id} className="rounded-md border hairline bg-white/70 p-4">
                <div className="flex items-start justify-between">
                  <div className="font-display text-xl">“{p!.text}”</div>
                  <SaveToggle kind="phrase" refId={p!.id} initiallySaved />
                </div>
                <p className="mt-1 text-xs text-smoke">{p!.translation} — {p!.clothing_application}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {savedMoments.length > 0 && (
        <section>
          <div className="kicker mb-3">Cultural moments</div>
          <ul className="grid gap-3 md:grid-cols-2">
            {savedMoments.map((m) => (
              <li key={m!.id} className="rounded-md border hairline bg-white/70 p-4">
                <div className="flex items-start justify-between">
                  <div className="font-display text-lg">{m!.title}</div>
                  <SaveToggle kind="moment" refId={m!.id} initiallySaved />
                </div>
                <p className="mt-1 text-xs text-smoke">{m!.application}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
