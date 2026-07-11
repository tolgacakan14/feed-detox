import { analyzeTopics, getSiblingEntities } from "@/lib/topicIntel";
import type { TrainablePlatform } from "@/types";

/**
 * Topic Understanding layer — turns the raw prompt/topics into a semantic
 * TopicContext the ranking, extraction and copy layers all share, so results
 * feel like "Feed Detox understood what I want" instead of keyword search.
 *
 * Rule-based on purpose (no paid AI API): category profiles carry the
 * related/negative vocabulary per topic type, a small alias table covers
 * well-known entities, and light regexes detect language, platform intent
 * and quality intent. The output shape is stable so a smarter model can be
 * swapped in later without touching consumers.
 */

export interface QualityIntent {
  /** Prompt explicitly asks for short-form (Shorts/Reels) content. */
  wantsShorts: boolean;
  /** Prompt leans analysis/deep-dive ("analysis", "tactical", "explained"). */
  wantsAnalysis: boolean;
  /** Prompt asks for official sources. */
  wantsOfficial: boolean;
}

export interface TopicContext {
  normalizedTopic: string;
  /** Cleaned topics (platform tokens stripped) — feed these to analyzeTopics. */
  topics: string[];
  topicLanguage: "en" | "tr";
  likelyCategory: string; // topicIntel type id, e.g. "sports", "tech_ai", "general"
  /** Human noun for explanations, e.g. "club football", "practical AI". */
  categoryLabel: string;
  /** The junk this category's feeds drown in — used in "instead of …" copy. */
  junkLabel: string;
  relatedTerms: string[];
  /** Vocabulary that marks HIGH-quality content for this category (e.g.
   * "tactical analysis" for a club, "full set" for a music genre) — boosts
   * contentQuality in ranking. */
  positiveSignals: string[];
  negativeTerms: string[];
  qualityIntent: QualityIntent;
  /** Platforms the user named in the prompt itself ("galatasaray youtube"). */
  platformIntent: TrainablePlatform[];
  /** The topic and its known aliases — exact-match boosts in ranking. */
  prioritizeEntities: string[];
  /** Same-category rival/sibling entities — title-leading matches get demoted. */
  avoidEntities: string[];
}

// ── Category profiles ───────────────────────────────────────────────────────
// One profile per topicIntel type. `related` expands the topic into the
// vocabulary quality content actually uses; `negative` is the category's
// characteristic spam. Both are generic templates — they work for ANY topic
// that lands in the category, not just the examples.

interface CategoryProfile {
  label: string;
  junk: string;
  related: (t: string) => string[];
  /** Marks of genuinely good content in this category — ranking boost. */
  positive: string[];
  negative: string[];
}

const CATEGORY_PROFILES: Record<string, CategoryProfile> = {
  sports: {
    label: "club and match",
    junk: "transfer drama and rival bait",
    related: (t) => [
      `${t} analysis`, `${t} tactical analysis`, `${t} highlights`,
      `${t} official`, "match analysis", "matchday", "tactics",
    ],
    positive: ["official", "match analysis", "tactical", "lineup", "press conference", "highlights", "fan community"],
    negative: ["betting", "bahis", "iddaa", "fake transfer", "transfer bomb", "rumor", "dedikodu", "kupon"],
  },
  music: {
    label: "music discovery",
    junk: "generic viral audio",
    related: (t) => [
      `${t} mix`, `${t} dj set`, `${t} live set`, `${t} label`,
      "boiler room", "underground", "vinyl set", "essential mix",
    ],
    positive: ["full set", "mix", "dj set", "live set", "label", "curated", "b2b"],
    negative: ["repost", "playlist spam", "type beat", "leaked album", "sped up nightcore"],
  },
  fashion: {
    label: "styling and fashion",
    junk: "haul spam",
    related: (t) => [
      `${t} outfit`, `${t} styling`, `${t} lookbook`, `${t} fit`,
      "street style", "street snaps", "archive fashion", "menswear",
    ],
    positive: ["styling", "lookbook", "street snaps", "archive", "fit check", "how to style"],
    negative: ["haul", "dropshipping", "replica", "fake luxury", "aliexpress", "dhgate"],
  },
  tech_ai: {
    label: "practical AI and workflow",
    junk: "AI hype spam",
    related: (t) => [
      `${t} tutorial`, `${t} workflow`, `${t} demo`, `${t} comparison`,
      "automation", "productivity", "no-code", "developer tools",
    ],
    positive: ["tutorial", "workflow", "use case", "comparison", "demo", "hands-on", "step by step"],
    negative: ["get rich", "crypto", "airdrop", "passive income", "make money with ai", "10x your"],
  },
  gaming: {
    label: "gaming",
    junk: "rage compilations",
    related: (t) => [`${t} review`, `${t} gameplay`, `${t} devlog`, "hidden gems", "speedrun"],
    positive: ["review", "devlog", "deep dive", "retrospective", "gameplay"],
    negative: ["console war", "fake leak", "rage compilation"],
  },
  food: {
    label: "cooking",
    junk: "engagement-bait recipes",
    related: (t) => [`${t} recipe`, `${t} technique`, `${t} meal prep`, "chef", "home cooking"],
    positive: ["recipe", "technique", "meal prep", "from scratch", "chef"],
    negative: ["miracle diet", "fake health", "1 ingredient hack"],
  },
  finance: {
    label: "long-term finance",
    junk: "get-rich-quick noise",
    related: (t) => [`${t} explained`, `${t} strategy`, "long term investing", "index funds"],
    positive: ["explained", "long term", "strategy", "fundamentals", "index"],
    negative: ["get rich", "guaranteed returns", "signal group", "pump", "forex bot"],
  },
  science_edu: {
    label: "science and learning",
    junk: "pseudoscience bait",
    related: (t) => [`${t} explained`, `${t} documentary`, `${t} lecture`, "research", "deep dive"],
    positive: ["explained", "lecture", "documentary", "research", "deep dive"],
    negative: ["conspiracy", "pseudoscience", "fake facts", "they don't want you to know"],
  },
  film_tv: {
    label: "film and TV",
    junk: "spoiler and rage reviews",
    related: (t) => [`${t} video essay`, `${t} analysis`, `${t} breakdown`, "cinematography", "director"],
    positive: ["video essay", "analysis", "breakdown", "cinematography", "retrospective"],
    negative: ["spoiler", "fake casting", "rage review", "woke bait"],
  },
  health: {
    label: "evidence-based health",
    junk: "miracle-cure spam",
    related: (t) => [`${t} routine`, `${t} science`, `${t} evidence based`, "coach", "mobility"],
    positive: ["evidence based", "routine", "science", "certified", "programme"],
    negative: ["miracle cure", "before after", "detox tea", "one weird trick"],
  },
  career: {
    label: "career and productivity",
    junk: "hustle-bro noise",
    related: (t) => [`${t} advice`, `${t} systems`, `${t} guide`, "deep work", "portfolio", "interview prep"],
    positive: ["advice", "systems", "guide", "portfolio", "interview prep", "deep work"],
    negative: ["hustle", "grindset", "get rich", "motivational spam", "sigma"],
  },
  photography: {
    label: "photography",
    junk: "preset spam",
    related: (t) => [`${t} tips`, `${t} inspiration`, `${t} composition`, "street photography", "editing"],
    positive: ["composition", "tutorial", "tips", "behind the scenes", "editing walkthrough"],
    negative: ["preset pack", "gear war", "free lightroom"],
  },
  news_politics: {
    label: "calm analysis",
    junk: "outrage threads",
    related: (t) => [`${t} analysis`, `${t} explained`, `${t} podcast`, "long form"],
    positive: ["analysis", "explained", "long form", "podcast", "context"],
    negative: ["ragebait", "breaking", "outrage", "destroys", "owns"],
  },
  general: {
    label: "this topic",
    junk: "random viral content",
    related: (t) => [`${t} explained`, `best ${t}`, `${t} guide`, `${t} community`, `${t} creator`],
    positive: ["explained", "guide", "review", "deep dive", "how to"],
    negative: [],
  },
};

// ── Known entity aliases ────────────────────────────────────────────────────
// Tiny, optional seed list for entities whose common shorthand a keyword
// match would miss. Topics not listed here still work — they just rely on
// the category template alone.

const ENTITY_ALIASES: Record<string, string[]> = {
  galatasaray: ["galatasaray sk", "gs", "cimbom", "süper lig"],
  fenerbahçe: ["fenerbahce", "fb", "süper lig"],
  beşiktaş: ["besiktas", "bjk", "süper lig"],
  "real betis": ["betis", "real betis balompié", "la liga"],
  "real madrid": ["madrid", "la liga"],
  barcelona: ["barça", "fc barcelona", "la liga"],
  nba: ["basketball", "nba highlights", "nba analysis"],
  "deep house": ["deep house mix", "dj set", "house music"],
  "ai tools": ["ai workflow", "ai apps", "automation tools"],
  streetwear: ["street style", "street fashion"],
  "japanese streetwear": ["harajuku", "japanese fashion", "archive fashion"],
};

// ── Detection helpers ───────────────────────────────────────────────────────

const TR_CHARS = /[çğıöşü]/;
const TR_WORDS =
  /\b(ve|için|daha az|istiyorum|analizi|futbol|müzik|takip|haber|komedi|kariyer|yemek|moda)\b/i;

function detectLanguage(text: string): "en" | "tr" {
  return TR_CHARS.test(text) || TR_WORDS.test(text) ? "tr" : "en";
}

const PLATFORM_PATTERNS: [TrainablePlatform, RegExp][] = [
  ["youtube", /\b(youtube|yt|shorts)\b/i],
  ["instagram", /\b(instagram|insta|ig|reels?)\b/i],
  ["tiktok", /\btiktok\b/i],
  ["x", /\btwitter\b|(?:^|[\s,])x(?:[\s,]|$)/i],
];

/** Strip platform tokens out of a topic string so "galatasaray youtube"
 * normalizes to "galatasaray" while the platform becomes intent. */
const PLATFORM_TOKEN =
  /\b(on\s+)?(youtube|yt|instagram|insta|tiktok|twitter)\b/gi;

export function understandTopic(rawTopics: string[], prompt: string): TopicContext {
  const haystack = `${prompt} ${rawTopics.join(" ")}`;

  const platformIntent = PLATFORM_PATTERNS.filter(([, re]) => re.test(haystack)).map(
    ([p]) => p,
  );

  const topics = rawTopics
    .map((t) => t.replace(PLATFORM_TOKEN, " ").replace(/\s+/g, " ").trim())
    .filter((t) => t.length >= 2);
  const cleanedTopics = topics.length > 0 ? topics : rawTopics;

  const intel = analyzeTopics(cleanedTopics);
  const normalizedTopic = intel.mainTopic.toLowerCase();
  const likelyCategory = intel.topicTypes[0] ?? "general";
  const profile = CATEGORY_PROFILES[likelyCategory] ?? CATEGORY_PROFILES.general;

  const aliases = ENTITY_ALIASES[normalizedTopic] ?? [];
  const relatedTerms = Array.from(
    new Set([...aliases, ...profile.related(normalizedTopic)].map((s) => s.toLowerCase())),
  );

  return {
    normalizedTopic,
    topics: cleanedTopics,
    topicLanguage: detectLanguage(haystack),
    likelyCategory,
    categoryLabel: profile.label,
    junkLabel: profile.junk,
    relatedTerms,
    positiveSignals: profile.positive.map((s) => s.toLowerCase()),
    negativeTerms: profile.negative,
    qualityIntent: {
      wantsShorts: /\b(shorts?|reels?)\b/i.test(prompt),
      wantsAnalysis: /\b(analysis|analiz|tactical|taktik|deep dive|explained|in depth)\b/i.test(haystack),
      wantsOfficial: /\b(official|resmi)\b/i.test(haystack),
    },
    platformIntent,
    prioritizeEntities: [normalizedTopic, ...aliases],
    avoidEntities: getSiblingEntities(cleanedTopics),
  };
}
