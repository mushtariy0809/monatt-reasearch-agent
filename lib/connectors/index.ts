// Connector registry. To add a source, construct it here.
// Failures are isolated per-connector — one dead feed never blocks a refresh.

import { makeRedditConnector } from "./reddit";
import { makeRssConnector } from "./rss";
import type { Connector, ConnectorResult } from "./types";

export const CONNECTORS: Connector[] = [
  makeRedditConnector(
    "streetwear",
    "Global",
    "r/streetwear — the largest streetwear community; top weekly posts show what fits/pieces the audience is actually wearing.",
  ),
  makeRedditConnector(
    "malefashionadvice",
    "US",
    "r/malefashionadvice — mainstream menswear discussion; slower-moving corroboration of silhouette and fabric trends.",
  ),
  makeRedditConnector(
    "femalefashionadvice",
    "US",
    "r/femalefashionadvice — womenswear discussion; corroborates color, styling and modest-layering signals.",
  ),
  makeRedditConnector(
    "Uzbekistan",
    "CentralAsia",
    "r/Uzbekistan — diaspora + local discussion; surfaces cultural moments, food and language topics.",
  ),
  makeRedditConnector(
    "AskCentralAsia",
    "CentralAsia",
    "r/AskCentralAsia — regional identity and culture conversations across Central Asian communities.",
  ),
  makeRssConnector(
    "hypebeast",
    "https://hypebeast.com/feed",
    "Global",
    "Hypebeast — streetwear news and drops; the fastest editorial signal for hype-cycle items.",
  ),
  makeRssConnector(
    "highsnobiety",
    "https://www.highsnobiety.com/feed/",
    "EU",
    "Highsnobiety — style editorial with a European lean.",
  ),
  makeRssConnector(
    "dazed",
    "https://www.dazeddigital.com/rss",
    "UK",
    "Dazed — youth culture and fashion editorial (UK).",
  ),
  makeRssConnector(
    "vogue",
    "https://www.vogue.com/feed/rss",
    "US",
    "Vogue — runway and mainstream fashion coverage; validates when a street trend goes mass.",
  ),
];

export async function runAllConnectors(): Promise<ConnectorResult[]> {
  return Promise.all(CONNECTORS.map((c) => c.fetchSignals()));
}
