import type {
  BestAction,
  DiscoveryResult,
  Freshness,
  NicheLevel,
  NoiseRisk,
  Platform,
} from "@/types";
import { isStructurallyValid } from "@/lib/validateUrl";
import type { TopicContext } from "@/lib/topicUnderstanding";

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

// Matches a bare platform name, and known generic page-title fallbacks the
// platforms themselves serve when a profile/video has no real title (e.g.
// TikTok's default og:title is literally "TikTok - Make Your Day").
const GENERIC_TITLE =
  /^(instagram|tiktok|x|twitter|youtube)(\s*[-–]\s*make your day)?$|^log ?in\b|^sign ?up\b/i;

/** Clean topic-aware fallback titles for weak metadata — honest labels, not
 * fake creator names: "Galatasaray Reel signal", "Deep house video signal". */
const FALLBACK_NOUN: Partial<Record<string, string>> = {
  reel: "Reel signal",
  post: "post signal",
  video: "video signal",
  short: "Shorts signal",
  account: "creator signal",
  creator: "creator signal",
  channel: "channel signal",
};

function fallbackTitle(topic: string, type: string): string {
  const t = topic ? topic[0].toUpperCase() + topic.slice(1) : "Topic";
  return `${t} ${FALLBACK_NOUN[type] ?? "signal"}`;
}

/**
 * When the cleaned title is too generic to be useful (search providers
 * sometimes return just the platform name for Instagram/TikTok, which
 * block most scraping), derive something meaningful — first from an @handle
 * in the snippet, then the snippet's own first sentence, then a clean
 * topic+platform fallback label. Never invents a name; only recombines real
 * text we already have, or falls back to an honest "… signal" label
 * (isFallback: true → the caller skips the "Instagram Reel:" prefix so it
 * doesn't read as a real extracted title).
 */
function deriveTitle(
  cleanedTitle: string,
  snippet: string | undefined,
  cls: UrlClass,
  topic: string,
): { text: string; isFallback: boolean } {
  if (cleanedTitle && cleanedTitle.length >= 4 && !GENERIC_TITLE.test(cleanedTitle)) {
    return { text: cleanedTitle, isFallback: false };
  }
  const handleMatch = snippet?.match(/@([\w.]{2,30})/);
  if (handleMatch) return { text: `@${handleMatch[1]}`, isFallback: false };
  const firstSentence = snippet?.split(/[.!?\n]/)[0]?.trim();
  if (firstSentence && firstSentence.length > 6 && firstSentence.length < 90) {
    return { text: cleanTitle(firstSentence), isFallback: false };
  }
  return { text: fallbackTitle(topic, cls.type), isFallback: true };
}

/**
 * Topic-aware "why it matters" — combines the topic, the platform, the
 * content type and the category's characteristic junk into one sentence
 * that explains the actual training mechanism, e.g. "Watching a full
 * galatasaray video tells YouTube to recommend deeper club and match
 * content instead of transfer drama and rival bait." Falls back to
 * neutral nouns when no TopicContext is available.
 */
export function buildWhyItMatters(
  platform: Platform,
  type: DiscoveryResult["type"],
  ctx?: TopicContext,
  lang: "en" | "tr" = "en",
): string {
  const t = ctx?.normalizedTopic || (lang === "tr" ? "bu konu" : "this topic");
  const junk = ctx?.junkLabel ?? "random viral content";
  const cat = ctx?.categoryLabel ?? "this topic";
  const key = `${platform}:${type}`;

  if (lang === "tr") {
    // Turkish sentences, product/social terms in English per product rule.
    switch (key) {
      case "x:post":
        return `Bu ${t} post’uyla etkileşmek, X timeline’ına ragebait yerine gerçek ${t} thread’leri göstermesi için signal verir.`;
      case "x:account":
      case "x:creator":
        return `Bu creator’ı follow edip faydalı post’ları bookmark etmek, X timeline’ını gerçek ${t} content’lerine yaklaştırır.`;
      case "instagram:reel":
        return `Bu ${t} Reel’ini sonuna kadar izleyip save etmek, Reels ve Explore’u ${t} signal’larına yaklaştırır.`;
      case "instagram:post":
        return `Bu ${t} post’unu save etmek, Explore’a spam yerine ${t} content’i istediğini öğretir.`;
      case "instagram:account":
      case "instagram:creator":
        return `Bu profile’ı follow edip post’ları save etmek, Explore’u ${t} styling ve content signal’larına yaklaştırır.`;
      case "tiktok:video":
        return `Bu content’i sonuna kadar izlemek, For You’ya generic viral content yerine ${t} istediğini öğretir.`;
      case "tiktok:account":
      case "tiktok:creator":
        return `Bu creator’ı follow etmek, For You’yu birkaç gün içinde ${t} content’ine yönlendirir.`;
      case "youtube:video":
        return `Bu ${t} content’ini sonuna kadar izlemek, YouTube’a random viral video yerine daha derin ${t} content önermesi için signal verir.`;
      case "youtube:short":
        return `Bu ${t} Short’unu bitirmek, Shorts algorithm’ine hızlı ve güçlü bir ${t} signal’ı gönderir.`;
      case "youtube:channel":
        return `Subscribe olmak, YouTube önerilerini gerçek bir ${t} source’una sabitler.`;
      default:
        if (type === "search_action") {
          return `Gerçek bir in-app arama — direct kaynak azken en iyi ${t} sonuçlarına ulaşmak için bir başlangıç noktası.`;
        }
        return `Gerçek, direct bir ${t} sonucu — etkileşmek feed’ine bunun kaliteli content olduğunu öğretir.`;
    }
  }

  switch (key) {
    case "x:post":
      return `Engaging with this ${t} post teaches your X timeline to surface real ${cat} threads instead of ${junk}.`;
    case "x:account":
    case "x:creator":
      return `Following this ${t} account and bookmarking its useful posts moves your X timeline toward ${cat} content instead of ${junk}.`;
    case "instagram:reel":
      return `Watching this ${t} Reel fully and saving it pushes Reels and Explore toward ${cat} signals instead of ${junk}.`;
    case "instagram:post":
      return `Saving this ${t} post tells Explore you want ${cat} content, not ${junk}.`;
    case "instagram:account":
    case "instagram:creator":
      return `Following and saving from this profile pushes Explore toward ${t} signals instead of ${junk}.`;
    case "tiktok:video":
      return `Watching this fully helps For You learn you prefer ${t} content over ${junk}.`;
    case "tiktok:account":
    case "tiktok:creator":
      return `Following this creator steers your For You page toward ${t} within days — faster than one-off searches.`;
    case "youtube:video":
      return `Watching a full ${t} video tells YouTube to recommend deeper ${cat} content instead of ${junk}.`;
    case "youtube:short":
      return `Finishing this ${t} Short is a fast Shorts-shelf signal — ${cat} instead of ${junk}.`;
    case "youtube:channel":
      return `Subscribing anchors your YouTube recommendations on a real ${t} source instead of ${junk}.`;
    default:
      if (type === "search_action") {
        return `A real in-app search — an honest entry point to the best ${t} results when direct coverage is thin.`;
      }
      return `A real, direct ${t} result — engaging with it teaches your feed this is the good stuff.`;
  }
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
  ctx?: TopicContext,
): DiscoveryResult[] {
  return results.flatMap((raw, index) => {
    const cls = classifyUrl(raw.url);
    if (!cls) return [];
    if (socialOnly && !SOCIAL_PLATFORMS.has(cls.platform)) return [];
    const prefix = TITLE_PREFIX[`${cls.platform}:${cls.type}`];
    const derived = deriveTitle(cleanTitle(raw.title), raw.snippet, cls, ctx?.normalizedTopic ?? "");
    return [
      {
        id: `extracted-${raw.url.replace(/\W+/g, "-").slice(0, 60)}`,
        // Fallback labels ("Galatasaray Reel signal") stand alone — never
        // dressed up with an "Instagram Reel:" prefix like a real title.
        title: derived.isFallback ? derived.text : prefix ? `${prefix}: ${derived.text}` : derived.text,
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
        whyItMatters: buildWhyItMatters(cls.platform, cls.type, ctx),
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

/** Minimal TopicContext for call sites that only have topics/siblings —
 * keeps scoreResult backward compatible while the full context (related
 * terms, negative terms, quality intent) comes from topicUnderstanding. */
function minimalContext(topics: string[], siblings: string[]): TopicContext {
  return {
    normalizedTopic: topics[0]?.toLowerCase() ?? "",
    topics,
    topicLanguage: "en",
    likelyCategory: "general",
    categoryLabel: "this topic",
    junkLabel: "random viral content",
    relatedTerms: [],
    positiveSignals: [],
    negativeTerms: [],
    qualityIntent: { wantsShorts: false, wantsAnalysis: false, wantsOfficial: false },
    platformIntent: [],
    prioritizeEntities: topics.map((t) => t.toLowerCase()),
    avoidEntities: siblings,
  };
}

/**
 * Topic relevance: is the topic (or its known aliases / category vocabulary)
 * actually the SUBJECT of this item, or just mentioned in passing? Title
 * match on the topic itself is the strongest signal; a category-related
 * term in the title (e.g. "harajuku" for japanese streetwear) is nearly as
 * good; snippet-only mentions are weak; a hashtag-only aside is noise.
 */
export function calculateTopicRelevance(r: DiscoveryResult, ctx: TopicContext): number {
  const title = r.title.toLowerCase();
  const snippet = (r.snippet ?? "").toLowerCase();
  const primaries = ctx.prioritizeEntities.filter(Boolean);
  if (primaries.length === 0) return 0.5;
  if (primaries.some((t) => title.includes(t))) return 1;
  if (ctx.relatedTerms.some((t) => title.includes(t))) return 0.7;
  if (primaries.some((t) => snippet.includes(t))) return 0.4;
  if (ctx.relatedTerms.some((t) => snippet.includes(t))) return 0.3;
  return 0.1;
}

/**
 * Platform fit: what each platform's algorithm actually trains on.
 * YouTube wants channels + full videos (random Shorts only if the user
 * asked for short-form); Instagram wants profiles + Reels; TikTok wants
 * creators + watchable videos; X wants accounts + strong posts.
 */
export function calculatePlatformFit(r: DiscoveryResult, ctx: TopicContext): number {
  if (r.type === "search_action") return 0.3;
  switch (r.platform) {
    case "youtube":
      if (r.type === "channel") return 1;
      if (r.type === "video") return 0.95;
      if (r.type === "short") return ctx.qualityIntent.wantsShorts ? 0.9 : 0.55;
      return 0.7;
    case "instagram":
      if (r.type === "account" || r.type === "creator") return 1;
      if (r.type === "reel") return 0.95;
      if (r.type === "post") return 0.85;
      return 0.7;
    case "tiktok":
      if (r.type === "account" || r.type === "creator") return 1;
      if (r.type === "video") return 0.95;
      return 0.7;
    case "x":
      if (r.type === "account" || r.type === "creator") return 1;
      if (r.type === "post") return 0.9;
      return 0.7;
    default:
      return r.type === "community" ? 0.75 : 0.6; // supporting sources
  }
}

const BETTING_PATTERN = /\b(bet|betting|bahis|odds?|stake|parlay|gambling|casino|kupon)\b/i;
const RAGEBAIT_PATTERN =
  /\b(shocking|you won'?t believe|scandal|exposed|drama|fight|beef|fake news|rumou?r|dedikodu|skandal)\b/i;

/** Betting/gambling content is never useful for training a feed — dropped
 * outright regardless of rank, not just demoted. */
export function isBettingContent(r: DiscoveryResult): boolean {
  return BETTING_PATTERN.test(`${r.title} ${r.snippet ?? ""}`);
}

/**
 * Watch quality for content items (Reels / TikToks / videos / Shorts /
 * posts): is this actually worth a full watch as a training signal?
 * Components: strong topic match, direct creator link, not clickbait,
 * not generic/hashtag-stuffed, fresh-or-evergreen.
 */
function watchQuality(r: DiscoveryResult, ctx: TopicContext): number {
  const title = r.title.toLowerCase();
  const hay = `${title} ${(r.snippet ?? "").toLowerCase()}`;
  let score = 0;
  const strongTopicMatch =
    ctx.prioritizeEntities.some((t) => t && title.includes(t)) ||
    ctx.relatedTerms.some((t) => title.includes(t));
  if (strongTopicMatch) score += 0.3;
  if (r.isDirectLink) score += 0.2;
  // Category positive signals ("tactical analysis", "full set", "lookbook",
  // "tutorial") mark the deeper content each platform's algorithm should be
  // steered toward — a real quality marker, not just a keyword hit.
  if (ctx.positiveSignals.some((s) => hay.includes(s))) score += 0.15;
  if (!RAGEBAIT_PATTERN.test(title)) score += 0.1; // not clickbait
  const hashtags = (r.title.match(/#\w+/g) ?? []).length;
  if (hashtags < 3 && r.title.trim().length >= 15) score += 0.1; // not generic
  if (r.freshness) score += 0.15; // fresh or evergreen — either beats unknown
  return Math.min(score, 1);
}

/**
 * Quality signal: source trust (API/web-search/curated), confidence,
 * official-looking markers, and — for watchable content — watchQuality.
 */
export function calculateQualitySignal(r: DiscoveryResult, ctx: TopicContext): number {
  const validity = CONFIDENCE_SCORE[r.confidence];
  const authority = SOURCE_SCORE[r.source];
  const title = r.title.toLowerCase();
  const handleSlug = r.handle?.toLowerCase().replace(/\W/g, "") ?? "";
  const looksOfficial =
    /\b(official|resmi)\b/.test(title) ||
    (handleSlug.length > 0 &&
      ctx.prioritizeEntities.some((e) => handleSlug.includes(e.replace(/\W/g, ""))));
  let base = 0.45 * validity + 0.35 * authority + (looksOfficial ? 0.2 : 0.08);
  // Positive category vocabulary in a profile's bio/snippet ("tactical
  // analysis", "curated") marks a quality source, not a spam page.
  if (ctx.positiveSignals.some((s) => `${title} ${(r.snippet ?? "").toLowerCase()}`.includes(s))) {
    base = Math.min(base + 0.07, 1);
  }
  if (["reel", "video", "short", "post"].includes(r.type)) {
    base = (base + watchQuality(r, ctx)) / 2;
  }
  return Math.min(base, 1);
}

/** Noise penalty (0–0.3): ragebait language, hashtag-stuffed titles, and the
 * category's characteristic spam vocabulary (negativeTerms). */
export function calculateNoisePenalty(r: DiscoveryResult, ctx: TopicContext): number {
  const hay = `${r.title} ${r.snippet ?? ""}`.toLowerCase();
  let penalty = 0;
  if (RAGEBAIT_PATTERN.test(hay)) penalty += 0.12;
  const hashtagCount = (r.title.match(/#\w+/g) ?? []).length;
  if (hashtagCount >= 5) penalty += 0.12;
  if (ctx.negativeTerms.some((n) => hay.includes(n))) penalty += 0.12;
  return Math.min(penalty, 0.3);
}

/** Weak metadata penalty: too-short titles and honest fallback labels rank
 * below results with real extracted titles. The fallback-label penalty is
 * deliberately large: a derived "<Topic> Reel signal" title contains the
 * topic BECAUSE WE PUT IT THERE, so it earns an artificial full relevance
 * score (0.35) — this cancels that out, keeping weak-metadata items below
 * real-titled results unless nothing better exists. */
function calculateWeakMetadataPenalty(r: DiscoveryResult): number {
  const title = r.title.trim();
  if (title.length < 8) return 0.1;
  if (/ signal$/.test(title) && r.source !== "curated") return 0.22; // derived fallback label
  return 0;
}

/**
 * Unrelated-entity penalty (0 or 0.25): the title leads with a DIFFERENT
 * same-category entity (a rival club, a competing tool, another genre)
 * while the actual topic is absent from the title — e.g. a Fenerbahçe-first
 * video that only carries "#Galatasaray" in its hashtags.
 */
export function detectUnrelatedEntity(r: DiscoveryResult, ctx: TopicContext): number {
  if (ctx.avoidEntities.length === 0) return 0;
  const title = r.title.toLowerCase();
  if (ctx.prioritizeEntities.some((t) => t && title.includes(t))) return 0;
  return ctx.avoidEntities.some((s) => title.includes(s)) ? 0.25 : 0;
}

/**
 * score = 0.35 topicRelevance + 0.20 directDestinationBonus
 *       + 0.15 platformFit + 0.15 qualitySignal
 *       + 0.10 freshnessSignal + 0.05 popularitySignal
 *       − noisePenalty − weakMetadataPenalty − unrelatedEntityPenalty
 *
 * Topic relevance leads — a perfectly "direct" result about the wrong
 * subject should never outrank a slightly-less-direct result that's
 * actually about the topic. Pass the full TopicContext for semantic
 * ranking (related terms, negative terms, quality intent); without it a
 * minimal context is built from topics/siblings.
 */
export function scoreResult(
  r: DiscoveryResult,
  topics: string[],
  siblings: string[] = [],
  ctx?: TopicContext,
): number {
  const c = ctx ?? minimalContext(topics, siblings);
  const freshness = r.freshness ? FRESHNESS_SCORE[r.freshness] : 0.5;
  // Real popularity inputs when available: curated engagement labels, or for
  // live-extracted results, search rank + cross-search repetition. Never a
  // fabricated number — just ordering evidence we actually have.
  const popularity = r.engagementLabel
    ? (ENGAGEMENT_SCORE[r.engagementLabel] ?? 0.5)
    : r.popularitySignal === "Appears across multiple social searches"
      ? 0.9
      : r.searchRank !== undefined
        ? Math.max(0.4, 1 - r.searchRank * 0.08)
        : 0.5;
  const score =
    0.35 * calculateTopicRelevance(r, c) +
    0.2 * socialTier(r) +
    0.15 * calculatePlatformFit(r, c) +
    0.15 * calculateQualitySignal(r, c) +
    0.1 * freshness +
    0.05 * popularity -
    calculateNoisePenalty(r, c) -
    calculateWeakMetadataPenalty(r) -
    detectUnrelatedEntity(r, c);
  return Math.max(score, 0.01);
}

/**
 * Hard quality floor for live-extracted results: drops betting/gambling
 * content outright (never useful for feed training, regardless of rank)
 * and items where neither the topic nor any related term appears anywhere
 * in the visible text — pure noise, not just a weak match. Everything else
 * is a soft demotion handled by scoreResult, so a topic-central-but-not-
 * perfect result still gets a fair chance to rank.
 */
export function filterLowQuality(
  results: DiscoveryResult[],
  topics: string[],
  ctx?: TopicContext,
): DiscoveryResult[] {
  const c = ctx ?? minimalContext(topics, []);
  return results.filter((r) => {
    if (isBettingContent(r)) return false;
    if (topics.length > 0 && calculateTopicRelevance(r, c) <= 0.1) return false;
    return true;
  });
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

/** Semantic action buckets — one entry per distinct user action, with EN
 * and TR copy side by side. Labels (Follow/Watch/Save/Bookmark/Subscribe/
 * Explore/Join/Read) stay English in BOTH languages per product rule. */
const ACTION_COPY: Record<string, { label: BestAction["label"]; en: string; tr: string }> = {
  search_x: { label: "Explore", en: "Explore this search, then follow 3–5 real accounts and bookmark the good threads.", tr: "Bu aramayı aç, 3–5 gerçek account’u follow et ve iyi thread’leri bookmark et." },
  search_instagram: { label: "Explore", en: "Explore this search, follow the strongest pages, and watch a few Reels fully.", tr: "Bu aramayı aç, en güçlü profile’ları follow et ve birkaç Reels’i sonuna kadar izle." },
  search_tiktok: { label: "Explore", en: "Explore this search and watch 3–5 videos fully — that's what retrains your For You page.", tr: "Bu aramayı aç ve 3–5 video’yu sonuna kadar izle — For You’yu yeniden eğiten budur." },
  search_youtube: { label: "Explore", en: "Explore this search and watch one full video or Short to start.", tr: "Bu aramayı aç ve başlangıç için bir video’yu sonuna kadar izle." },
  search_generic: { label: "Explore", en: "Explore this discovery path and open the strongest results.", tr: "Bu discovery path’i aç ve en güçlü sonuçları incele." },
  community: { label: "Join", en: "Join and read a few threads before you post.", tr: "Join et ve post atmadan önce birkaç thread oku." },
  newsletter: { label: "Subscribe", en: "Subscribe to keep quality input flowing even while your feed relearns.", tr: "Subscribe ol — feed’in yeniden öğrenirken kaliteli input akmaya devam etsin." },
  read: { label: "Read", en: "Read through once — bookmark it if it earns a repeat visit.", tr: "Bir kez oku — tekrar ziyarete değerse bookmark et." },
  post: { label: "Bookmark", en: "Read the thread, bookmark it, and follow the author if it holds up.", tr: "Thread’i oku, bookmark et ve değerse yazarı follow et." },
  reel: { label: "Watch", en: "Watch the Reel fully and save it — Explore updates fast on saves.", tr: "Reel’i sonuna kadar izle ve save et — Explore save’lerle hızlı güncellenir." },
  short: { label: "Watch", en: "Watch the Short fully — completion is YouTube's strongest Shorts signal.", tr: "Short’u sonuna kadar izle — completion, YouTube’un en güçlü Shorts signal’ı." },
  tiktok_video: { label: "Watch", en: "Watch fully and save it — completion rate retrains your For You page.", tr: "Sonuna kadar izle ve save et — completion rate For You’yu yeniden eğitir." },
  x_account: { label: "Follow", en: "Follow, add to a private list, and bookmark useful threads. Mute noisy keywords, avoid ragebait replies.", tr: "Follow et, private list’e ekle ve faydalı thread’leri bookmark et. Gürültülü keyword’leri mute et." },
  instagram_account: { label: "Follow", en: "Follow, then watch Reels fully and save the good posts. Tap Not Interested on spam.", tr: "Follow et, Reels’leri sonuna kadar izle ve iyi post’ları save et. Spam’e Not Interested de." },
  tiktok_account: { label: "Watch", en: "Watch 3–5 videos fully, save the good ones, and long-press Not Interested on the rest.", tr: "3–5 video’yu sonuna kadar izle, iyileri save et, gerisine Not Interested bas." },
  youtube_video: { label: "Watch", en: "Watch the full video — that's YouTube's strongest signal. Save it to a playlist if it's a keeper.", tr: "Video’yu sonuna kadar izle — YouTube’un en güçlü signal’ı budur. Değerse playlist’e kaydet." },
  youtube_channel: { label: "Subscribe", en: "Subscribe, then watch one full video or Short to start training your recommendations.", tr: "Subscribe ol, sonra önerilerini eğitmeye başlamak için bir video’yu sonuna kadar izle." },
  generic: { label: "Follow", en: "Follow and interact with 2–3 useful posts.", tr: "Follow et ve 2–3 faydalı post ile etkileş." },
};

function actionKeyFor(item: DiscoveryResult): keyof typeof ACTION_COPY {
  if (item.type === "search_action") {
    if (["x", "instagram", "tiktok", "youtube"].includes(item.platform)) return `search_${item.platform}`;
    return "search_generic";
  }
  if (item.type === "community") return "community";
  if (item.type === "newsletter") return "newsletter";
  if (item.type === "website" || item.type === "article") return "read";
  if (item.type === "post") return "post";
  if (item.type === "reel") return "reel";
  if (item.type === "short") return "short";
  if (item.platform === "tiktok" && item.type === "video") return "tiktok_video";
  if (item.platform === "x") return "x_account";
  if (item.platform === "instagram") return "instagram_account";
  if (item.platform === "tiktok") return "tiktok_account";
  if (item.platform === "youtube") return item.type === "video" ? "youtube_video" : "youtube_channel";
  return "generic";
}

/**
 * What should the user actually DO with this result? Platform-aware per
 * product rule — X/Instagram/TikTok/YouTube each train their algorithm
 * differently, so the action verb and description change per platform, not
 * just per content type. Descriptions are localized; labels stay English.
 */
export function inferBestAction(item: DiscoveryResult, lang: "en" | "tr" = "en"): BestAction {
  const copy = ACTION_COPY[actionKeyFor(item)];
  return { label: copy.label, description: lang === "tr" ? copy.tr : copy.en };
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

/** A "Prefix: platform-name" title ("Instagram Reel: Instagram", "TikTok
 * video: TikTok") is weak metadata dressed up as a real title. */
const PREFIXED_TITLE = /^(YouTube (video|Short|channel)|Instagram (Reel|post)|TikTok video|X post):\s*/i;

/**
 * Last-line title quality gate, applied to EVERY card regardless of source
 * (curated, demo, live-extracted): platform-only and prefix-plus-platform
 * titles are replaced with a clean, honest topic-aware fallback label
 * ("Galatasaray Reel signal"). Good titles pass through untouched.
 */
export function formatRecommendationTitle(item: DiscoveryResult, ctx?: TopicContext): string {
  const title = item.title.trim();
  const stripped = title.replace(PREFIXED_TITLE, "").trim();
  if (title && stripped.length >= 4 && !GENERIC_TITLE.test(title) && !GENERIC_TITLE.test(stripped)) {
    return title;
  }
  return fallbackTitle(ctx?.normalizedTopic ?? "", item.type);
}

/**
 * Fills in the Verified Feed Pack quality fields on every item right before
 * it's returned to the API/UI, and localizes the visible card copy
 * (whyItMatters + bestAction description) for Turkish packs. In English,
 * hand-authored curated copy is preserved; in Turkish, copy is generated
 * from the topic context so the whole card reads in one language.
 */
export function finalizeFeedPackItem(
  item: DiscoveryResult,
  ctx?: TopicContext,
  lang: "en" | "tr" = "en",
): DiscoveryResult {
  return {
    ...item,
    title: formatRecommendationTitle(item, ctx),
    bestAction: lang === "tr" ? inferBestAction(item, "tr") : (item.bestAction ?? inferBestAction(item)),
    whyItMatters:
      lang === "tr"
        ? buildWhyItMatters(item.platform, item.type, ctx, "tr")
        : (item.whyItMatters ?? buildWhyItMatters(item.platform, item.type, ctx)),
    noiseRisk: item.noiseRisk ?? inferNoiseRisk(item),
    nicheLevel: item.nicheLevel ?? inferNicheLevel(item),
    freshness: inferFreshness(item),
    popularitySignal: inferPopularitySignal(item),
    rankingReason: item.rankingReason ?? inferRankingReason(item),
  };
}
