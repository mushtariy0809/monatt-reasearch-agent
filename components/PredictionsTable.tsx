"use client";

import { Fragment, useMemo, useState } from "react";
import type { ForecastPeriod, Prediction } from "@/lib/types";
import { DataBadge } from "./badges";
import { CsvButton } from "./buttons";

type Col = keyof Pick<
  Prediction,
  "trend_name" | "category" | "momentum" | "saturation" | "direction" | "confidence" | "commercial_potential" | "audience_fit" | "cultural_fit"
>;

const DIRECTION_STYLE: Record<string, string> = {
  rise: "text-emerald-800",
  hold: "text-amber-800",
  decline: "text-red-800",
};
const DIRECTION_GLYPH: Record<string, string> = { rise: "↑", hold: "→", decline: "↓" };

export function PredictionsTable({ predictions }: { predictions: Prediction[] }) {
  const [period, setPeriod] = useState<ForecastPeriod>("3m");
  const [sortCol, setSortCol] = useState<Col>("confidence");
  const [asc, setAsc] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const filtered = predictions.filter((p) => p.period === period);
    return [...filtered].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return asc ? cmp : -cmp;
    });
  }, [predictions, period, sortCol, asc]);

  const clickSort = (c: Col) => {
    if (c === sortCol) setAsc(!asc);
    else {
      setSortCol(c);
      setAsc(false);
    }
  };

  const csvRows = rows.map((p) => ({
    trend: p.trend_name, category: p.category, evidence: p.evidence_summary,
    region: p.region, audience_fit: p.audience_fit, cultural_fit: p.cultural_fit,
    momentum: p.momentum.toFixed(1), saturation: p.saturation,
    direction: p.direction, period: p.period, confidence: p.confidence,
    suggested_product: p.suggested_product, target_price: p.target_price,
    commercial_potential: p.commercial_potential, risks: p.risks,
    recommended_action: p.recommended_action, data_status: p.data_status,
  }));

  const th = (label: string, col?: Col) => (
    <th
      key={label}
      onClick={col ? () => clickSort(col) : undefined}
      className={`whitespace-nowrap px-3 py-2 text-left font-semibold ${col ? "cursor-pointer select-none hover:text-uzblue-ink" : ""}`}
    >
      {label}
      {col === sortCol ? (asc ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        {(["30d", "3m", "6m", "12m"] as ForecastPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
              p === period ? "bg-ink text-cream" : "border hairline bg-white/60 text-smoke hover:text-ink"
            }`}
          >
            {p === "30d" ? "Next 30 days" : `Next ${p.replace("m", " months")}`}
          </button>
        ))}
        <div className="ml-auto">
          <CsvButton filename={`monatt-predictions-${period}.csv`} rows={csvRows} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border hairline bg-white/70">
        <table className="w-full min-w-[1000px] text-xs">
          <thead>
            <tr className="border-b hairline">
              {th("Trend", "trend_name")}
              {th("Category", "category")}
              {th("Region")}
              {th("Audience", "audience_fit")}
              {th("Cultural", "cultural_fit")}
              {th("Momentum", "momentum")}
              {th("Saturation", "saturation")}
              {th("Direction", "direction")}
              {th("Confidence", "confidence")}
              {th("Commercial", "commercial_potential")}
              {th("Suggested product")}
              {th("Target price")}
              {th("Status")}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <Fragment key={p.id}>
                <tr
                  onClick={() => setOpen(open === p.id ? null : p.id)}
                  className="cursor-pointer border-b hairline hover:bg-pearl/40"
                >
                  <td className="px-3 py-2 font-semibold">{p.trend_name}</td>
                  <td className="px-3 py-2">{p.category}</td>
                  <td className="max-w-32 truncate px-3 py-2" title={p.region}>{p.region}</td>
                  <td className="px-3 py-2">{p.audience_fit}/10</td>
                  <td className="px-3 py-2">{p.cultural_fit}/10</td>
                  <td className="px-3 py-2">{p.momentum.toFixed(1)}</td>
                  <td className="px-3 py-2">{p.saturation}/10</td>
                  <td className={`px-3 py-2 font-bold ${DIRECTION_STYLE[p.direction]}`}>
                    {DIRECTION_GLYPH[p.direction]} {p.direction}
                  </td>
                  <td className="px-3 py-2">{Math.round(p.confidence * 100)}%</td>
                  <td className="px-3 py-2">{p.commercial_potential}/10</td>
                  <td className="max-w-56 truncate px-3 py-2" title={p.suggested_product}>{p.suggested_product}</td>
                  <td className="whitespace-nowrap px-3 py-2">{p.target_price}</td>
                  <td className="px-3 py-2"><DataBadge status={p.data_status} /></td>
                </tr>
                {open === p.id && (
                  <tr className="border-b hairline bg-pearl/30">
                    <td colSpan={13} className="px-4 py-3">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <div className="kicker mb-1">Evidence</div>
                          <p className="leading-relaxed">{p.evidence_summary}</p>
                        </div>
                        <div>
                          <div className="kicker mb-1">Reasoning & uncertainty</div>
                          <p className="leading-relaxed">{p.reasoning}</p>
                        </div>
                        <div>
                          <div className="kicker mb-1">Risks / Recommended action</div>
                          <p className="leading-relaxed">{p.risks}</p>
                          <p className="mt-1 font-semibold leading-relaxed">{p.recommended_action}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-smoke">
        Forecasts are rule-based model estimates from momentum, saturation, longevity and seasonality — labeled AI/SAMPLE
        accordingly, never guaranteed. Click a row for the full reasoning; click column headers to sort.
      </p>
    </div>
  );
}
