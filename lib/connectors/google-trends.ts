// Google Trends importer.
//
// Google Trends has no official public API, and scraping it would violate
// its terms — so this connector works from the CSV files Google itself
// lets you export from trends.google.com ("Interest over time" → download
// icon). Paste the CSV on the Sources page; points feed the "Search growth"
// score component for any trend whose name or keywords match the term.

import type { GoogleTrendsPoint } from "../types";
import { hashString } from "../dedup";

export interface GtrendsParseResult {
  points: GoogleTrendsPoint[];
  term: string | null;
  error: string | null;
}

/**
 * Parses a Google Trends "interest over time" CSV export.
 * Format: a couple of header lines ("Category: ...", blank), then
 * `Week,term: (region)` followed by `YYYY-MM-DD,value` rows.
 * `<1` values are treated as 0.
 */
export function parseGoogleTrendsCsv(
  csv: string,
  region = "Global",
): GtrendsParseResult {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const headerIdx = lines.findIndex((l) => /^(week|day|month),/i.test(l));
  if (headerIdx === -1) {
    return {
      points: [],
      term: null,
      error:
        'Could not find a "Week,…" / "Day,…" header row. Export "Interest over time" from trends.google.com and paste the whole CSV.',
    };
  }
  const header = lines[headerIdx].split(",");
  const rawTerm = header[1] ?? "unknown";
  const term = rawTerm.replace(/:\s*\(.*\)$/, "").trim().toLowerCase();
  const imported_at = new Date().toISOString();
  const points: GoogleTrendsPoint[] = [];
  for (const line of lines.slice(headerIdx + 1)) {
    const [date, raw] = line.split(",");
    if (!date || raw === undefined) continue;
    if (!/^\d{4}-\d{2}-\d{2}/.test(date)) continue;
    const value = raw.trim() === "<1" ? 0 : Number(raw);
    if (Number.isNaN(value)) continue;
    points.push({
      id: hashString(`${term}|${date}|${region}`),
      term,
      date,
      value,
      region,
      imported_at,
      data_status: "manual",
    });
  }
  if (points.length === 0) {
    return { points: [], term, error: "Header found but no data rows parsed." };
  }
  return { points, term, error: null };
}

/** Match imported points to a trend by term ⊆ keywords or name. */
export function pointsForTrend(
  all: GoogleTrendsPoint[],
  name: string,
  keywords: string[],
): GoogleTrendsPoint[] {
  const targets = [name.toLowerCase(), ...keywords.map((k) => k.toLowerCase())];
  return all.filter((p) =>
    targets.some((t) => t.includes(p.term) || p.term.includes(t)),
  );
}
