// Connector contract. Every data source implements this interface, so new
// APIs (TikTok Creative Center exports, Pinterest Trends, paid firehoses…)
// can be added by dropping a file in this folder and registering it in
// index.ts — nothing else in the app changes.

import type { Signal } from "../types";

export interface ConnectorResult {
  source: string;
  signals: Signal[];
  error: string | null;
}

export interface Connector {
  /** Stable id, e.g. "reddit:r/streetwear" */
  source: string;
  /** Human description shown on the Sources page. */
  description: string;
  /** Legal basis / access method, shown on the Sources page. */
  access: string;
  fetchSignals(): Promise<ConnectorResult>;
}
