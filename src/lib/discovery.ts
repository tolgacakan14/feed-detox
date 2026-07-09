import type { DiscoveryResult, Platform } from "@/types";
import { isStructurallyValid } from "@/lib/validateUrl";

/**
 * Search/Discovery Module.
 *
 * Today it produces two kinds of results:
 *  - "curated" destinations (from data/curatedSources)
 *  - "generated_search_url" search actions (real platform search pages)
 *
 * The searchProvider seam below is where a web-search API / YouTube API /
 * research-agent tools plug in later — they should return DiscoveryResult[]
 * with source "api" | "web_search" so the guard and ranking apply unchanged.
 */

/** Returns raw search hits; the pipeline classifies and extracts direct
 * links from them via extractDirectLinks. Plug Tavily/Serper/YouTube API in
 * here (Stage 2). */
export type SearchProvider = (
  query: string,
) => Promise<{ title: string; url: string; snippet?: string }[]>;

/** No live search API configured yet — curated + discovery links carry the pack. */
export const searchProvider: SearchProvider | null = null;

// ── Search-action builders (real, always-working search pages) ─────────────

const q = encodeURIComponent;

const SEARCH_BUILDERS: Partial<Record<Platform, (query: string) => string>> = {
  x: (query) => `https://x.com/search?q=${q(query)}&src=typed_query&f=user`,
  instagram: (query) =>
    `https://www.instagram.com/explore/search/keyword/?q=${q(query)}`,
  tiktok: (query) => `https://www.tiktok.com/search?q=${q(query)}`,
  youtube: (query) => `https://www.youtube.com/results?search_query=${q(query)}`,
  reddit: (query) => `https://www.reddit.com/search/?q=${q(query)}`,
  newsletter: (query) => `https://substack.com/search/${q(query)}`,
  spotify: (query) => `https://open.spotify.com/search/${q(query)}`,
  web: (query) => `https://www.google.com/search?q=${q(query)}`,
};

/* Confident, product-voiced titles — discovery links are a feature, never a
 * fallback. No "search action" wording anywhere user-facing. */
const DISCOVERY_TITLES: Record<Platform, (query: string) => string> = {
  x: (query) => `Explore “${query}” creators on X`,
  instagram: (query) => `Find “${query}” creators on Instagram`,
  tiktok: (query) => `Explore “${query}” on TikTok`,
  youtube: (query) => `Top “${query}” videos on YouTube`,
  reddit: (query) => `Explore “${query}” on Reddit`,
  newsletter: (query) => `Discover “${query}” newsletters`,
  spotify: (query) => `Explore “${query}” on Spotify`,
  web: (query) => `Discover the best “${query}” sources`,
};

const DEFAULT_DISCOVERY_REASON =
  "Open this and interact with 3–5 high-quality posts to teach your feed what to show next.";

export function searchAction(
  platform: Platform,
  query: string,
  reason?: string,
  title?: string,
): DiscoveryResult {
  const build = SEARCH_BUILDERS[platform] ?? SEARCH_BUILDERS.web!;
  return {
    id: `search-${platform}-${query.toLowerCase().replace(/\s+/g, "-")}`,
    title: title ?? DISCOVERY_TITLES[platform](query),
    url: build(query),
    platform,
    type: "search_action",
    source: "generated_search_url",
    confidence: "search_action",
    isDirectLink: false,
    rawQuery: query,
    reason: reason ?? DEFAULT_DISCOVERY_REASON,
  };
}

/** Subreddit discovery (community-type search) — real Reddit filter. */
export function redditCommunitySearch(topic: string): DiscoveryResult {
  return {
    ...searchAction("reddit", topic, "Joining an active community keeps the topic alive in your history."),
    id: `search-reddit-sr-${topic.toLowerCase().replace(/\s+/g, "-")}`,
    url: `https://www.reddit.com/search/?q=${q(topic)}&type=sr`,
    title: `Explore “${topic}” communities`,
  };
}

/** YouTube channel discovery — real channel-filter param. */
export function youtubeChannelSearch(topic: string): DiscoveryResult {
  return {
    ...searchAction("youtube", topic, "Subscribing to 2–3 quality channels reshapes your YouTube Home fastest."),
    id: `search-youtube-ch-${topic.toLowerCase().replace(/\s+/g, "-")}`,
    url: `https://www.youtube.com/results?search_query=${q(topic)}&sp=EgIQAg%253D%253D`,
    title: `Top “${topic}” channels on YouTube`,
  };
}

/** TikTok creator discovery — real user-search page. */
export function tiktokCreatorSearch(topic: string): DiscoveryResult {
  return {
    ...searchAction("tiktok", topic, "Follow 2–3 creators here — TikTok reshapes your For You page within days."),
    id: `search-tiktok-user-${topic.toLowerCase().replace(/\s+/g, "-")}`,
    url: `https://www.tiktok.com/search/user?q=${q(topic)}`,
    title: `Find “${topic}” creators on TikTok`,
  };
}

// ── URL classification & direct-link extraction ────────────────────────────
// Turns raw search results (from a future web-search/API provider) into
// classified DiscoveryResults. Only recognizable direct links survive;
// search/login/hashtag/homepage URLs are rejected here and can only enter
// the pack as explicitly generated discovery links.

export interface RawSearchResult {
  title: string;
  url: string;
  snippet?: string;
}

interface UrlClass {
  platform: Platform;
  type: DiscoveryResult["type"];
}

const DIRECT_URL_PATTERNS: [RegExp, UrlClass][] = [
  [/^https:\/\/(www\.)?(x|twitter)\.com\/[A-Za-z0-9_]{1,15}\/?$/i, { platform: "x", type: "account" }],
  [/^https:\/\/(www\.)?youtube\.com\/(@[\w.-]+|channel\/[\w-]+|c\/[\w-]+|user\/[\w-]+)\/?$/i, { platform: "youtube", type: "channel" }],
  [/^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/i, { platform: "youtube", type: "video" }],
  [/^https:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/i, { platform: "youtube", type: "video" }],
  [/^https:\/\/(www\.)?instagram\.com\/[\w.]{2,30}\/?$/i, { platform: "instagram", type: "account" }],
  [/^https:\/\/(www\.)?tiktok\.com\/@[\w.]+\/?$/i, { platform: "tiktok", type: "account" }],
  [/^https:\/\/(www\.)?reddit\.com\/r\/\w+\/?$/i, { platform: "reddit", type: "community" }],
  [/^https:\/\/[\w-]+\.substack\.com\/?$/i, { platform: "newsletter", type: "newsletter" }],
];

const NON_DIRECT_PATH = /search|login|signin|signup|explore\/tags|hashtag|\/results/i;
const PLATFORM_HOMEPAGES =
  /^https:\/\/(www\.)?(x|twitter|youtube|instagram|tiktok|reddit|substack)\.com\/?$/i;

/** Classify a URL; returns null for anything that isn't a usable direct link. */
export function classifyUrl(url: string): (UrlClass & { isDirectLink: true }) | null {
  if (NON_DIRECT_PATH.test(url) || PLATFORM_HOMEPAGES.test(url)) return null;
  for (const [pattern, cls] of DIRECT_URL_PATTERNS) {
    if (pattern.test(url)) return { ...cls, isDirectLink: true };
  }
  // Non-platform https site with a real hostname → website.
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol === "https:" &&
      !/(x|twitter|youtube|instagram|tiktok|reddit)\.com$/i.test(
        parsed.hostname.replace(/^www\./, ""),
      )
    ) {
      return { platform: "web", type: "website", isDirectLink: true };
    }
  } catch {
    return null;
  }
  return null;
}

/** Convert raw search results into guarded, classified direct links. */
export function extractDirectLinks(
  results: RawSearchResult[],
  origin: "api" | "web_search" = "web_search",
): DiscoveryResult[] {
  return results.flatMap((raw) => {
    const cls = classifyUrl(raw.url);
    if (!cls) return [];
    return [
      {
        id: `extracted-${raw.url.replace(/\W+/g, "-").slice(0, 60)}`,
        title: raw.title,
        url: raw.url,
        platform: cls.platform,
        type: cls.type,
        source: origin,
        confidence: "verified" as const,
        isDirectLink: true,
        snippet: raw.snippet,
        reason: "Found in live results — engage with it to teach your feed this is the good stuff.",
      },
    ];
  });
}

// ── Anti-hallucination guard ───────────────────────────────────────────────

const PROFILE_PATH =
  /^https:\/\/(www\.)?(x\.com|twitter\.com|instagram\.com|tiktok\.com)\/@?[\w.]+\/?$/i;

/**
 * Final gate before display. Rejects anything that could be an invented
 * link: profile-looking URLs are only allowed from trusted sources, search
 * URLs are only allowed to be labeled search_action, and every result must
 * pass structural URL validation.
 */
export function guardResults(results: DiscoveryResult[]): DiscoveryResult[] {
  return results.filter((r) => {
    if (!r.url || !isStructurallyValid(r)) return false;
    // A social profile URL must come from a real source, never generated.
    if (PROFILE_PATH.test(r.url) && r.source === "generated_search_url") return false;
    // Generated URLs may only ever be search actions, never "direct links".
    if (r.source === "generated_search_url" && r.confidence !== "search_action") return false;
    if (r.source === "generated_search_url" && r.isDirectLink) return false;
    // "verified" requires a trusted origin.
    if (r.confidence === "verified" && r.source === "generated_search_url") return false;
    return true;
  });
}

// ── Ranking ────────────────────────────────────────────────────────────────

const CONFIDENCE_SCORE = { verified: 1, likely: 0.8, search_action: 0.55 };
const SOURCE_SCORE = { api: 1, web_search: 0.9, curated: 0.85, generated_search_url: 0.6 };

/**
 * final_score = 0.25 relevance + 0.20 direct_link_quality + 0.15 authority
 *             + 0.15 link_validity + 0.15 freshness + 0.10 training_value
 * Direct links always outrank discovery links within a section. Freshness is
 * constant for now (no live data); diversity is applied by capping
 * per-platform counts during assembly.
 */
export function scoreResult(r: DiscoveryResult, topics: string[]): number {
  const hay = `${r.title} ${r.rawQuery ?? ""} ${r.snippet ?? ""}`.toLowerCase();
  const relevance =
    topics.length === 0
      ? 0.5
      : topics.filter((t) => hay.includes(t.toLowerCase())).length / topics.length;
  const direct = r.isDirectLink ? 1 : 0.35;
  const validity = CONFIDENCE_SCORE[r.confidence];
  const authority = SOURCE_SCORE[r.source];
  const trainingValue = r.type === "search_action" ? 0.9 : 0.7;
  return (
    0.25 * relevance + 0.2 * direct + 0.15 * authority + 0.15 * validity + 0.15 * 0.5 + 0.1 * trainingValue
  );
}

export function dedupeByUrl(results: DiscoveryResult[]): DiscoveryResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    // Normalize trailing slash + query so demo and curated entries for the
    // same destination (e.g. r/galatasaray vs r/galatasaray/) collapse.
    const key = r.url.toLowerCase().replace(/\/+(\?|$)/, "$1").replace(/\/$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
