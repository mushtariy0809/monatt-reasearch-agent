import { DataBadge } from "@/components/badges";
import { SaveToggle } from "@/components/buttons";
import { PageHeader } from "@/components/PageHeader";
import { loadAll, savedIds } from "@/lib/data";

export const dynamic = "force-dynamic";

const LANG: Record<string, string> = {
  uz: "Uzbek",
  ru: "Russian",
  en: "English",
  mixed: "Mixed",
};

export default async function QuotesPage() {
  const data = await loadAll();
  const saved = savedIds(data.saved);
  return (
    <div>
      <PageHeader
        kicker="Quotes & Language"
        title="Phrase bank"
        subtitle="Trilingual phrases with translation, meaning, tone, audience and a concrete clothing application. Phrases are never attributed to a person without a source, and protected lyrics/slogans are excluded by policy."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {data.phrases.map((p) => (
          <div key={p.id} className="rounded-md border hairline bg-white/70 p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-2xl">“{p.text}”</div>
                <div className="mt-0.5 text-xs text-smoke">
                  {LANG[p.language]} · {p.translation !== "—" ? `“${p.translation}”` : "English original"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DataBadge status={p.data_status} />
                <SaveToggle kind="phrase" refId={p.id} initiallySaved={saved.includes(`phrase:${p.id}`)} />
              </div>
            </div>
            <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-[auto_1fr]">
              <dt className="kicker !text-[9px]">Meaning</dt>
              <dd>{p.meaning}</dd>
              <dt className="kicker !text-[9px]">Tone</dt>
              <dd>{p.tone}</dd>
              <dt className="kicker !text-[9px]">Audience</dt>
              <dd>{p.audience}</dd>
              <dt className="kicker !text-[9px]">On clothing</dt>
              <dd className="font-semibold">{p.clothing_application}</dd>
              <dt className="kicker !text-[9px]">Source</dt>
              <dd>
                {p.source_url ? (
                  <a className="underline" href={p.source_url} target="_blank" rel="noreferrer">link</a>
                ) : (
                  <span className="text-smoke">curated entry — verify with native speakers before print</span>
                )}
              </dd>
            </dl>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-smoke">
        Before printing any phrase: confirm spelling in both scripts (Latin & Cyrillic where relevant), check slang
        connotations with 2–3 native speakers of different ages, and avoid religious or political phrases entirely.
      </p>
    </div>
  );
}
