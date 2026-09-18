// Reddit connector — uses Reddit's public JSON listings (no login, no
// scraping of restricted content). Rate-limited and identified with a
// descriptive User-Agent per Reddit's API guidelines.

import type { Region, Signal } from "../types";
import { signalId } from "../dedup";
import type { Connector, ConnectorResult } from "./types";

interface RedditChild {
  data: {
    title: string;
    permalink: string;
    score: number;
    created_utc: number;
    over_18: boolean;
    stickied: boolean;
  };
}

export function makeRedditConnector(
  subreddit: string,
  region: Region,
  description: string,
): Connector {
  const source = `reddit:r/${subreddit}`;
  return {
    source,
    description,
    access: "Public JSON listing (reddit.com/r/<sub>/top.json), identified User-Agent, top posts of the week only.",
    async fetchSignals(): Promise<ConnectorResult> {
      try {
        const res = await fetch(
          `https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=40&raw_json=1`,
          {
            headers: {
              "User-Agent":
                "MonattTrendIntelligence/0.1 (personal fashion-trend research tool)",
            },
            signal: AbortSignal.timeout(15000),
            cache: "no-store",
          },
        );
        if (!res.ok) {
          const hint =
            res.status === 403 || res.status === 429
              ? " (Reddit blocks unauthenticated requests from some networks — usually works from home connections; the durable fix is free Reddit OAuth, see README → Adding stronger data sources)"
              : "";
          return { source, signals: [], error: `HTTP ${res.status} from Reddit${hint}` };
        }
        const json = (await res.json()) as { data?: { children?: RedditChild[] } };
        const now = new Date().toISOString();
        const signals: Signal[] = (json.data?.children ?? [])
          .filter((c) => !c.data.over_18 && !c.data.stickied)
          .map((c) => {
            const url = `https://www.reddit.com${c.data.permalink}`;
            return {
              id: signalId(c.data.title, url),
              source,
              platform: "reddit" as const,
              title: c.data.title,
              url,
              published_at: new Date(c.data.created_utc * 1000).toISOString(),
              collected_at: now,
              region,
              engagement: c.data.score,
              confidence: 0.7,
              data_status: "live" as const,
            };
          });
        return { source, signals, error: null };
      } catch (e) {
        return {
          source,
          signals: [],
          error: e instanceof Error ? e.message : "Unknown fetch error",
        };
      }
    },
  };
}
