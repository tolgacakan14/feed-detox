import type {
  BestAction,
  DiscoveryResult,
  Freshness,
  NicheLevel,
  NoiseRisk,
  Platform,
} from "@/types";
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

// Live search is provided by lib/searchProviders (env-keyed: YouTube Data
// API, Tavily, SerpAPI, Bing, Google CSE). This module classifies/extracts
// whatever those providers return — only recognizable direct social URLs
// survive into the pack.

// ── Search-action builders (real, always-working search pages) ─────────────

const q = encodeURIComponent;

const SEARCH_BUILDERS: Partial<Record<Platform, (query: string) => string>> = {
  // "Top" tab, not People (f=user) — People search on a quoted generic
  // phrase routinely returns "No results", which is a dead end for the user.
  x: (query) => `https://x.com/search?q=${q(query)}&src=typed_query`,
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
    whyItMatters: reason ?? DEFAULT_DISCOVERY_REASON,
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

// Most specific first — a status/reel/video URL must not be classified as a
// bare account by a looser pattern.
const DIRECT_URL_PATTERNS: [RegExp, UrlClass][] = [
  [/^https:\/\/(www\.)?(x|twitter)\.com\/[A-Za-z0-9_]{1,15}\/status\/\d+/i, { platform: "x", type: "post" }],
  [/^https:\/\/(www\.)?(x|twitter)\.com\/[A-Za-z0-9_]{1,15}\/?$/i, { platform: "x", type: "account" }],
  [/^https:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/i, { platform: "youtube", type: "short" }],
  [/^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/i, { platform: "youtube", type: "video" }],
  [/^https:\/\/(www\.)?youtube\.com\/(@[\w.-]+|channel\/[\w-]+|c\/[\w-]+|user\/[\w-]+)\/?$/i, { platform: "youtube", type: "channel" }],
  [/^https:\/\/(www\.)?instagram\.com\/reel\/[\w-]+\/?/i, { platform: "instagram", type: "reel" }],
  [/^https:\/\/(www\.)?instagram\.com\/p\/[\w-]+\/?/i, { platform: "instagram", type: "post" }],
  [/^https:\/\/(www\.)?instagram\.com\/[\w.]{2,30}\/?$/i, { platform: "instagram", type: "account" }],
  [/^https:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/i, { platform: "tiktok", type: "video" }],
  [/^https:\/\/(www\.)?tiktok\.com\/@[\w.]+\/?$/i, { platform: "tiktok", type: "account" }],
  [/^https:\/\/(www\.)?reddit\.com\/r\/\w+\/?$/i, { platform: "reddit", type: "community" }],
  [/^https:\/\/[\w-]+\.substack\.com\/?$/i, { platform: "newsletter", type: "newsletter" }],
];

const NON_DIRECT_PATH = /\/search|\/login|signin|signup|\/accounts\/|explore\/tags|hashtag|\/results|\/discover\b/i;
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

const SOCIAL_PLATFORMS = new Set(["x", "instagram", "tiktok", "youtube"]);

/** Platform-aware title prefixes for extracted content items — makes a raw
 * search title immediately legible as "what am I about to open?". */
const TITLE_PREFIX: Partial<Record<string, string>> = {
  "youtube:video": "YouTube video",
  "youtube:short": "YouTube Short",
  "youtube:channel": "YouTube channel",
  "instagram:reel": "Instagram Reel",
  "instagram:post": "Instagram post",
  "tiktok:video": "TikTok video",
  "x:post": "X post",
};

/** Clean raw search-result titles: strip site suffixes providers append and
 * fix all-lowercase first letters. Never invents content — cosmetic only. */
export function cleanTitle(raw: string): string {
  let t = raw
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s*[-|–]\s*(YouTube|TikTok|Instagram|X|Twitter)\s*$/i, "")
    .replace(/\s*\/\s*(Posts\s*\/\s*)?(X|Twitter)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (t && t[0] === t[0].toLowerCase() && /[a-z]/.test(t[0])) {
    t = t[0].toUpperCase() + t.slice(1);
  }
  return t;
}

/**
 * Convert raw search results into guarded, classified direct links.
 * `socialOnly` (default true for live extraction) drops generic websites —
 * the live pipeline exists to find SOCIAL accounts/content, not random
 * blogs. Search rank is recorded as a ranking input; results that appear
 * across multiple queries get merged and boosted by mergeExtracted().
 */
export function extractDirectLinks(
  results: RawSearchResult[],
  origin: "api" | "web_search" = "web_search",
  socialOnly = true,
): DiscoveryResult[] {
  return results.flatMap((raw, index) => {
    const cls = classifyUrl(raw.url);
    if (!cls) return [];
    if (socialOnly && !SOCIAL_PLATFORMS.has(cls.platform)) return [];
    const prefix = TITLE_PREFIX[`${cls.platform}:${cls.type}`];
    const base = cleanTitle(raw.title);
    return [
      {
        id: `extracted-${raw.url.replace(/\W+/g, "-").slice(0, 60)}`,
        title: prefix ? `${prefix}: ${base}` : base,
        url: raw.url,
        platform: cls.platform,
        type: cls.type,
        source: origin,
        confidence: "verified" as const,
        isDirectLink: true,
        snippet: raw.snippet,
        searchRank: index,
        popularitySignal:
          origin === "api"
            ? "YouTube API result"
            : index < 3
              ? "High-ranking search result"
              : "Direct search result",
        whyItMatters: "Found in live results — engage with it to teach your feed this is the good stuff.",
      },
    ];
  });
}

/**
 * Merge extracted links from multiple queries: a URL that shows up in more
 * than one search is a real popularity signal (never a fabricated metric) —
 * it keeps its best rank and gets the cross-search popularitySignal.
 */
export function mergeExtracted(batches: DiscoveryResult[][]): DiscoveryResult[] {
  const byUrl = new Map<string, { item: DiscoveryResult; hits: number }>();
  for (const batch of batches) {
    for (const item of batch) {
      const key = item.url.toLowerCase().replace(/\/$/, "");
      const existing = byUrl.get(key);
      if (!existing) byUrl.set(key, { item, hits: 1 });
      else {
        existing.hits += 1;
        if ((item.searchRank ?? 99) < (existing.item.searchRank ?? 99)) existing.item = item;
      }
    }
  }
  return [...byUrl.values()].map(({ item, hits }) =>
    hits > 1
      ? { ...item, popularitySignal: "Appears across multiple social searches" }
      : item,
  );
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
const FRESHNESS_SCORE = { trending: 1, active_recently: 0.75, evergreen: 0.5 };
const ENGAGEMENT_SCORE: Record<string, number> = {
  "High engagement": 1,
  Popular: 0.85,
  "Editor pick": 0.75,
  Rising: 0.7,
  "Niche quality": 0.6,
};

/**
 * Social-first ranking tier — the product trains social algorithms, so
 * direct social CONTENT (a post/Reel/TikTok/Short the user can watch right
 * now) outranks profiles, profiles outrank communities, and generic
 * websites sit below all social results. Discovery/search links last.
 */
function socialTier(r: DiscoveryResult): number {
  if (r.type === "search_action") return 0.2;
  const social = SOCIAL_PLATFORMS.has(r.platform);
  if (social && ["post", "reel", "short", "video"].includes(r.type)) return 1;
  if (social) return 0.85; // creator/account/channel
  if (r.type === "community") return 0.6;
  return 0.4; // website/newsletter/article — supporting sources
}

/**
 * final_score = 0.22 relevance + 0.20 social_tier + 0.13 authority
 *             + 0.13 link_validity + 0.12 freshness + 0.10 engagement
 *             + 0.10 training_value
 * Social content > social profiles > communities > websites > discovery.
 * Diversity is applied by capping per-platform counts during assembly.
 */
export function scoreResult(r: DiscoveryResult, topics: string[]): number {
  const hay = `${r.title} ${r.rawQuery ?? ""} ${r.snippet ?? ""}`.toLowerCase();
  const relevance =
    topics.length === 0
      ? 0.5
      : topics.filter((t) => hay.includes(t.toLowerCase())).length / topics.length;
  const direct = socialTier(r);
  const validity = CONFIDENCE_SCORE[r.confidence];
  const authority = SOURCE_SCORE[r.source];
  const freshness = r.freshness ? FRESHNESS_SCORE[r.freshness] : 0.5;
  // Real popularity inputs when available: curated engagement labels, or for
  // live-extracted results, search rank + cross-search repetition. Never a
  // fabricated number — just ordering evidence we actually have.
  const engagement = r.engagementLabel
    ? (ENGAGEMENT_SCORE[r.engagementLabel] ?? 0.5)
    : r.popularitySignal === "Appears across multiple social searches"
      ? 0.9
      : r.searchRank !== undefined
        ? Math.max(0.4, 1 - r.searchRank * 0.08)
        : 0.5;
  const trainingValue = r.type === "search_action" ? 0.9 : 0.7;
  return (
    0.22 * relevance +
    0.2 * direct +
    0.13 * authority +
    0.13 * validity +
    0.12 * freshness +
    0.1 * engagement +
    0.1 * trainingValue
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

// ── Verified Feed Pack quality signals ──────────────────────────────────────
// Every card needs bestAction/noiseRisk/nicheLevel/freshness. Rather than
// hand-author these on ~150 data entries, they're inferred conservatively
// from type/platform/confidence/engagementLabel — the same "quality
// assignment rules" a human curator would apply. Never invents numbers
// (follower counts, engagement %) — only qualitative labels.

/**
 * What should the user actually DO with this result? Platform-aware per
 * product rule — X/Instagram/TikTok/YouTube each train their algorithm
 * differently, so the action verb and description change per platform, not
 * just per content type.
 */
export function inferBestAction(item: DiscoveryResult): BestAction {
  // Discovery/search paths — platform-flavored "Explore" framing.
  if (item.type === "search_action") {
    if (item.platform === "x") {
      return { label: "Explore", description: "Explore this search, then follow 3–5 real accounts and bookmark the good threads." };
    }
    if (item.platform === "instagram") {
      return { label: "Explore", description: "Explore this search, follow the strongest pages, and watch a few Reels fully." };
    }
    if (item.platform === "tiktok") {
      return { label: "Explore", description: "Explore this search and watch 3–5 videos fully — that's what retrains your For You page." };
    }
    if (item.platform === "youtube") {
      return { label: "Explore", description: "Explore this search and watch one full video or Short to start." };
    }
    return { label: "Explore", description: "Explore this discovery path and open the strongest results." };
  }

  if (item.type === "community") {
    return { label: "Join", description: "Join and read a few threads before you post." };
  }
  if (item.type === "newsletter") {
    return { label: "Subscribe", description: "Subscribe to keep quality input flowing even while your feed relearns." };
  }
  if (item.type === "website" || item.type === "article") {
    return { label: "Read", description: "Read through once — bookmark it if it earns a repeat visit." };
  }

  // Direct content items — the click IS the training signal.
  if (item.type === "post") {
    return { label: "Bookmark", description: "Read the thread, bookmark it, and follow the author if it holds up." };
  }
  if (item.type === "reel") {
    return { label: "Watch", description: "Watch the Reel fully and save it — Explore updates fast on saves." };
  }
  if (item.type === "short") {
    return { label: "Watch", description: "Watch the Short fully — completion is YouTube's strongest Shorts signal." };
  }
  if (item.platform === "tiktok" && item.type === "video") {
    return { label: "Watch", description: "Watch fully and save it — completion rate retrains your For You page." };
  }

  // Direct accounts, channels, videos — platform-specific training actions.
  if (item.platform === "x") {
    return { label: "Follow", description: "Follow, add to a private list, and bookmark useful threads. Mute noisy keywords, avoid ragebait replies." };
  }
  if (item.platform === "instagram") {
    return { label: "Follow", description: "Follow, then watch Reels fully and save the good posts. Tap Not Interested on spam." };
  }
  if (item.platform === "tiktok") {
    return { label: "Watch", description: "Watch 3–5 videos fully, save the good ones, and long-press Not Interested on the rest." };
  }
  if (item.platform === "youtube") {
    if (item.type === "video") {
      return { label: "Watch", description: "Watch the full video — that's YouTube's strongest signal. Save it to a playlist if it's a keeper." };
    }
    return { label: "Subscribe", description: "Subscribe, then watch one full video or Short to start training your recommendations." };
  }
  return { label: "Follow", description: "Follow and interact with 2–3 useful posts." };
}

/** How likely is this source to surface ragebait, rumors, or spam? */
export function inferNoiseRisk(item: DiscoveryResult): NoiseRisk {
  if (item.type === "search_action") {
    if (item.platform === "x") return "High"; // rumor/gossip/ragebait-prone
    return "Medium"; // instagram/tiktok/reddit/youtube/web discovery — mixed quality
  }
  if (item.confidence === "verified") return "Low";
  if (item.type === "newsletter" || item.type === "article") return "Low";
  if (item.type === "community") return "Medium";
  if (item.engagementLabel === "Editor pick" || item.engagementLabel === "High engagement") return "Low";
  return "Medium";
}

/** How obvious/mainstream vs. specialist/enthusiast is this source? */
export function inferNicheLevel(item: DiscoveryResult): NicheLevel {
  if (item.type === "search_action" || item.type === "community") return "Balanced";
  if (item.type === "newsletter" || item.type === "article") return "Niche";
  if (item.popularity === "niche") return "Niche";
  if (item.popularity === "emerging") return "Balanced";
  if (item.popularity === "global") return item.confidence === "verified" ? "Mainstream" : "Balanced";
  return "Balanced";
}

/** Discovery/search paths default to "trending" (time-sensitive by nature);
 * everything else defaults to "active_recently" if no freshness was set. */
function inferFreshness(item: DiscoveryResult): Freshness {
  if (item.freshness) return item.freshness;
  return item.type === "search_action" ? "trending" : "active_recently";
}

const PLATFORM_TRAINING_NAME: Record<string, string> = {
  x: "X timeline",
  instagram: "Instagram feed",
  tiktok: "TikTok For You",
  youtube: "YouTube recommendations",
};

/** Honest one-liner explaining why the item ranks where it does. */
function inferRankingReason(item: DiscoveryResult): string {
  const feed = PLATFORM_TRAINING_NAME[item.platform];
  if (item.type === "search_action") {
    return "Discovery path — secondary to direct social results.";
  }
  if (["post", "reel", "short"].includes(item.type) || (item.type === "video" && feed)) {
    return `Direct short-form content result for ${feed ?? "social"} training.`;
  }
  if (feed) {
    return `Direct ${item.type === "channel" ? "channel" : "profile"} result for ${feed} training.`;
  }
  if (item.type === "community") {
    return "High-signal community — supports the social sections.";
  }
  return "Useful reference, but secondary to social algorithm training.";
}

/** popularitySignal default for items that didn't get one at extraction. */
function inferPopularitySignal(item: DiscoveryResult): string {
  if (item.popularitySignal) return item.popularitySignal;
  if (item.source === "curated") {
    return SOCIAL_PLATFORMS.has(item.platform) ? "Curated source" : "Supporting web source";
  }
  if (item.type === "search_action") return "In-app discovery path";
  return "Direct result";
}

/**
 * Fills in the Verified Feed Pack quality fields on every item right before
 * it's returned to the API/UI. Idempotent — never overwrites a value a
 * producer already set, only fills gaps.
 */
export function finalizeFeedPackItem(item: DiscoveryResult): DiscoveryResult {
  return {
    ...item,
    bestAction: item.bestAction ?? inferBestAction(item),
    noiseRisk: item.noiseRisk ?? inferNoiseRisk(item),
    nicheLevel: item.nicheLevel ?? inferNicheLevel(item),
    freshness: inferFreshness(item),
    popularitySignal: inferPopularitySignal(item),
    rankingReason: item.rankingReason ?? inferRankingReason(item),
  };
}
