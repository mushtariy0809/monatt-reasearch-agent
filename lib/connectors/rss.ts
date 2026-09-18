// RSS connector — fashion publications that publish public RSS feeds.
// RSS is an explicitly-offered syndication format, so this is the cleanest
// legal path to editorial trend coverage.

import Parser from "rss-parser";
import type { Region, Signal } from "../types";
import { signalId } from "../dedup";
import type { Connector, ConnectorResult } from "./types";

export function makeRssConnector(
  name: string,
  feedUrl: string,
  region: Region,
  description: string,
): Connector {
  const source = `rss:${name}`;
  return {
    source,
    description,
    access: `Public RSS feed (${feedUrl}).`,
    async fetchSignals(): Promise<ConnectorResult> {
      try {
        const parser = new Parser({
          timeout: 15000,
          headers: {
            "User-Agent":
              "MonattTrendIntelligence/0.1 (personal fashion-trend research tool)",
          },
        });
        const feed = await parser.parseURL(feedUrl);
        const now = new Date().toISOString();
        const signals: Signal[] = (feed.items ?? [])
          .filter((i) => i.title && i.link)
          .slice(0, 40)
          .map((i) => ({
            id: signalId(i.title!, i.link!),
            source,
            platform: "rss" as const,
            title: i.title!,
            url: i.link!,
            published_at: i.isoDate ?? i.pubDate ?? now,
            collected_at: now,
            region,
            engagement: 0, // RSS carries no engagement metric
            confidence: 0.8, // editorial sources are curated
            data_status: "live" as const,
          }));
        return { source, signals, error: null };
      } catch (e) {
        return {
          source,
          signals: [],
          error: e instanceof Error ? e.message : "Unknown feed error",
        };
      }
    },
  };
}
