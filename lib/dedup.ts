// Signal deduplication.
//
// The same story often arrives from several feeds (and from repeated
// refreshes). Two signals are duplicates when they share a URL or when
// their normalized titles collide. Merging keeps the earliest published
// date and the highest engagement seen.

import type { Signal } from "./types";

const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "for", "and", "or", "to", "is", "are",
  "with", "at", "by", "from", "this", "that", "its", "it's", "how", "why",
]);

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .sort()
    .join(" ");
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    // strip tracking params
    for (const p of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|ref|source)/i.test(p)) u.searchParams.delete(p);
    }
    return `${u.host.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}${u.search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

/** djb2 — stable, dependency-free string hash. */
export function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function signalId(title: string, url: string): string {
  return hashString(`${normalizeTitle(title)}|${normalizeUrl(url)}`);
}

export interface DedupResult {
  merged: Signal[];
  added: number;
  duplicates: number;
}

/**
 * Merge incoming signals into an existing set. Duplicate = same normalized
 * URL or same normalized title. On merge: keep earliest published_at,
 * highest engagement, and prefer the existing record's identity.
 */
export function dedupeSignals(existing: Signal[], incoming: Signal[]): DedupResult {
  const byUrl = new Map<string, Signal>();
  const byTitle = new Map<string, Signal>();
  const merged: Signal[] = [];

  const index = (s: Signal) => {
    byUrl.set(normalizeUrl(s.url), s);
    const nt = normalizeTitle(s.title);
    if (nt) byTitle.set(nt, s);
  };

  for (const s of existing) {
    merged.push(s);
    index(s);
  }

  let added = 0;
  let duplicates = 0;
  for (const s of incoming) {
    const hit = byUrl.get(normalizeUrl(s.url)) ?? byTitle.get(normalizeTitle(s.title));
    if (hit) {
      duplicates++;
      if (new Date(s.published_at) < new Date(hit.published_at))
        hit.published_at = s.published_at;
      hit.engagement = Math.max(hit.engagement, s.engagement);
      // A live re-observation upgrades stale/cached provenance.
      if (s.data_status === "live") hit.data_status = "live";
    } else {
      merged.push(s);
      index(s);
      added++;
    }
  }
  return { merged, added, duplicates };
}
