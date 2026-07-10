import type { Platform } from "@/types";

/**
 * Topic Intelligence Module.
 *
 * Takes a raw user topic and returns structured intent: topic type(s), a
 * platform strategy, and — critically — SEPARATE query strategies per social
 * platform (X/Instagram/TikTok/YouTube), not one generic query reused
 * everywhere. Rule-based for the MVP — it only produces queries and
 * strategy, never final accounts/URLs, so it can later be swapped for an AI
 * call with the same output shape.
 */

/** The 4 primary social platforms Feed Detox exists to train. */
export type PrimarySocialPlatform = "x" | "instagram" | "tiktok" | "youtube";

export interface TopicIntel {
  mainTopic: string;
  topicTypes: string[];
  /** One-line "what to look for" per platform, e.g. for cards/UI copy. */
  platformFit: Record<PrimarySocialPlatform, string>;
  /** 4 distinct query angles per platform: official / creator / analysis /
   * short-form / niche — never the bare topic repeated everywhere. */
  platformQueries: Record<PrimarySocialPlatform, string[]>;
  searchQueries: string[]; // expanded, generic — kept for the searchProvider seam
  platforms: Platform[]; // ordered by relevance for this topic type
  muteHints: string[]; // topic-type-specific low-quality patterns
}

interface TypeDef {
  type: string;
  keywords: string[];
  queryTemplates: string[]; // {t} = main topic
  platforms: Platform[];
  muteHints: string[];
}

const TYPE_DEFS: TypeDef[] = [
  {
    type: "sports",
    keywords: [
      "galatasaray", "fenerbahçe", "besiktas", "beşiktaş", "trabzonspor",
      "football", "futbol", "soccer", "nba", "basketball", "premier league",
      "süper lig", "la liga", "serie a", "bundesliga", "champions league",
      "real madrid", "barcelona", "real betis", "betis", "liverpool", "arsenal",
      "formula", "f1", "tennis", "ufc", "boxing", "sport", "spor", "tactics",
      "taktik", "transfer", "league", "maç", "match",
    ],
    queryTemplates: [
      "{t} tactical analysis",
      "{t} highlights",
      "{t} podcast",
      "{t} fan community",
      "{t} news analysis",
    ],
    platforms: ["youtube", "x", "reddit", "tiktok", "web"],
    muteHints: ["transfer rumors", "fake transfer news", "betting tips", "bahis"],
  },
  {
    type: "music",
    keywords: [
      "music", "müzik", "house", "techno", "indie", "hip hop", "rap", "jazz",
      "rock", "pop", "dj", "producer", "playlist", "album", "band", "deep house",
      "edm", "lo-fi", "lofi", "vinyl",
    ],
    queryTemplates: [
      "{t} mix",
      "{t} new releases",
      "best {t} artists",
      "{t} live set",
      "{t} community",
    ],
    platforms: ["youtube", "spotify", "tiktok", "reddit", "x"],
    muteHints: ["leaked album fake", "engagement farming", "reaction clickbait"],
  },
  {
    type: "fashion",
    keywords: [
      "fashion", "moda", "streetwear", "outfit", "style", "sneaker", "clothing",
      "wardrobe", "aesthetic", "vintage", "thrift", "skincare", "beauty", "makeup",
      "grooming", "sokak modası",
    ],
    queryTemplates: [
      "{t} outfit ideas",
      "{t} lookbook",
      "{t} brand guide",
      "{t} community",
    ],
    platforms: ["instagram", "tiktok", "youtube", "reddit", "web"],
    muteHints: ["haul spam", "dropshipping ads", "fake discounts", "replica spam"],
  },
  {
    type: "tech_ai",
    keywords: [
      "ai", "yapay zeka", "artificial intelligence", "machine learning", "coding",
      "programming", "software", "developer", "web3", "crypto", "blockchain",
      "startup", "saas", "tech", "teknoloji", "girişim", "llm", "data science",
      "cybersecurity", "indie hacker",
    ],
    queryTemplates: [
      "{t} tutorial",
      "{t} explained",
      "{t} tools comparison",
      "{t} newsletter",
      "{t} open source",
    ],
    platforms: ["youtube", "x", "reddit", "web", "newsletter"],
    muteHints: ["ai slop", "get rich quick", "crypto pump", "engagement bait threads"],
  },
  {
    type: "gaming",
    keywords: [
      "gaming", "game", "oyun", "indie games", "esports", "speedrun", "rpg",
      "playstation", "xbox", "nintendo", "steam", "game dev", "gamedev",
    ],
    queryTemplates: [
      "{t} review",
      "{t} hidden gems",
      "{t} community",
      "{t} devlog",
    ],
    platforms: ["youtube", "reddit", "tiktok", "x", "web"],
    muteHints: ["console war bait", "fake leaks", "rage compilations"],
  },
  {
    type: "food",
    keywords: [
      "cooking", "yemek", "recipe", "tarif", "healthy cooking", "baking", "chef",
      "meal prep", "nutrition", "vegan", "kitchen", "food",
    ],
    queryTemplates: [
      "{t} recipes",
      "{t} for beginners",
      "{t} meal prep",
      "{t} techniques",
    ],
    platforms: ["youtube", "tiktok", "instagram", "reddit", "web"],
    muteHints: ["fake health claims", "miracle diet", "engagement farming recipes"],
  },
  {
    type: "finance",
    keywords: [
      "finance", "finans", "investing", "yatırım", "personal finance", "budget",
      "stocks", "borsa", "economy", "ekonomi", "money", "savings",
    ],
    queryTemplates: [
      "{t} explained",
      "{t} for beginners",
      "{t} long term strategy",
      "{t} community",
    ],
    platforms: ["youtube", "reddit", "web", "x", "newsletter"],
    muteHints: ["get rich quick", "signal groups", "guaranteed returns", "pump and dump"],
  },
  {
    type: "science_edu",
    keywords: [
      "science", "bilim", "history", "tarih", "physics", "psychology", "space",
      "documentary", "philosophy", "math", "education", "podcast", "research",
    ],
    queryTemplates: [
      "{t} explained",
      "{t} documentary",
      "{t} podcast",
      "{t} best lectures",
    ],
    platforms: ["youtube", "reddit", "web", "newsletter", "spotify"],
    muteHints: ["pseudoscience", "conspiracy bait", "fake facts pages"],
  },
  {
    type: "film_tv",
    keywords: [
      "cinema", "sinema", "film", "movie", "tv series", "dizi", "anime",
      "director", "screenwriting", "video essay", "criterion",
    ],
    queryTemplates: [
      "{t} video essay",
      "{t} analysis",
      "{t} recommendations",
      "{t} community",
    ],
    platforms: ["youtube", "reddit", "x", "web", "tiktok"],
    muteHints: ["spoiler bait", "fake casting news", "rage reviews"],
  },
  {
    type: "health",
    keywords: [
      "mental health", "fitness", "gym", "yoga", "meditation", "mindfulness",
      "sleep", "therapy", "wellbeing", "sağlık", "running", "workout",
    ],
    queryTemplates: [
      "{t} evidence based",
      "{t} for beginners",
      "{t} routine",
      "{t} science",
    ],
    platforms: ["youtube", "reddit", "instagram", "web", "newsletter"],
    muteHints: ["miracle cures", "unlicensed advice", "before after spam"],
  },
  {
    type: "career",
    keywords: [
      "career", "kariyer", "productivity", "verimlilik", "job", "interview",
      "resume", "cv", "leadership", "freelance", "remote work", "study",
    ],
    queryTemplates: [
      "{t} advice",
      "{t} systems",
      "{t} newsletter",
      "{t} community",
    ],
    platforms: ["youtube", "x", "newsletter", "reddit", "web"],
    muteHints: ["hustle bro content", "fake success stories", "motivational spam"],
  },
  {
    type: "photography",
    keywords: [
      "photography", "fotoğraf", "camera", "lens", "street photography",
      "portrait", "editing", "lightroom", "film photography",
    ],
    queryTemplates: [
      "{t} tips",
      "{t} inspiration",
      "{t} gear guide",
      "{t} community",
    ],
    platforms: ["youtube", "instagram", "reddit", "web", "tiktok"],
    muteHints: ["gear war bait", "preset spam"],
  },
  {
    type: "news_politics",
    keywords: [
      "politics", "siyaset", "news", "haber", "election", "gündem", "geopolitics",
    ],
    queryTemplates: [
      "{t} analysis",
      "{t} explained",
      "{t} podcast",
    ],
    platforms: ["youtube", "web", "reddit", "newsletter", "x"],
    muteHints: ["ragebait", "unverified breaking news", "outrage threads"],
  },
];

const GENERAL: Omit<TypeDef, "keywords"> = {
  type: "general",
  queryTemplates: ["{t}", "{t} explained", "best {t} creators", "{t} community"],
  platforms: ["youtube", "x", "tiktok", "reddit", "web"],
  muteHints: ["ragebait", "engagement farming", "spam reposts", "low-quality ai slop"],
};

// ── Per-platform query generation ───────────────────────────────────────────
// Each of the 4 primary platforms gets its OWN query strategy — never the
// bare topic reused everywhere. Angle 1 (official/creator) and angle 3
// (analysis/deep-dive) reuse the type-specific queryTemplates above for
// topical flavor (so "sports" queries lean tactical/highlights, "tech_ai"
// leans tutorial/demo, etc.) — this is what lets the same 4-angle system
// adapt its depth per topic without a template matrix per type × platform.

const PRIMARY_PLATFORMS = ["x", "instagram", "tiktok", "youtube"] as const;

/** Strip "{t} " / " {t}" from a template to get a standalone content-angle noun phrase. */
function angleFrom(template: string | undefined, topic: string): string {
  if (!template) return "";
  return template.replace("{t}", topic).replace(topic, "").trim();
}

/**
 * Only entity-like topics (a club, a team, a brand — sports category is the
 * reliable rule-based signal for that today) get "official account"-style
 * queries. Generic topics ("AI tools", "deep house") get creator/demo/
 * tutorial phrasing — searching "ai tools official account" is a dead end
 * that returns empty pages.
 */
function buildPlatformQueries(
  topic: string,
  def: TypeDef | undefined,
): Record<(typeof PRIMARY_PLATFORMS)[number], string[]> {
  const templates = def?.queryTemplates ?? GENERAL.queryTemplates;
  const angle1 = angleFrom(templates[0], topic); // e.g. "tactical analysis" / "tutorial" / "mix"
  const angle2 = angleFrom(templates[1], topic); // e.g. "highlights" / "explained" / "new releases"
  const isEntity = def?.type === "sports";

  if (isEntity) {
    return {
      x: [
        `${topic} official account`,
        `${topic}${angle1 ? ` ${angle1}` : ""} thread`,
        `${topic} analyst`,
        `${topic} fan account`,
      ],
      instagram: [
        `${topic} official Instagram`,
        `${topic} Reels`,
        `${topic} fan page`,
        `${topic} edits`,
      ],
      tiktok: [
        `${topic} TikTok`,
        `${topic} edits`,
        `${topic}${angle1 ? ` ${angle1}` : ""}`.trim(),
        `${topic} fan TikTok`,
      ],
      youtube: [
        `${topic} channel`,
        `${topic} Shorts`,
        `${topic}${angle1 ? ` ${angle1}` : ""}`.trim(),
        `${topic}${angle2 ? ` ${angle2}` : " highlights"}`.trim(),
      ],
    };
  }

  return {
    x: [
      `${topic} creators`,
      `best ${topic} accounts`,
      `${topic}${angle1 ? ` ${angle1}` : ""} thread`,
      `${topic} curator`,
    ],
    instagram: [
      `${topic} Reels`,
      `${topic} creator`,
      `${topic}${angle2 ? ` ${angle2}` : " demos"}`,
      `${topic} pages to follow`,
    ],
    tiktok: [
      `${topic} TikTok`,
      `${topic}${angle1 ? ` ${angle1}` : " demos"} TikTok`,
      `${topic} creator`,
      `${topic} explained`,
    ],
    youtube: [
      `${topic} channel`,
      `${topic} Shorts`,
      `${topic}${angle1 ? ` ${angle1}` : ""}`.trim(),
      `best ${topic} videos`,
    ],
  };
}

const PLATFORM_FIT_TEMPLATE: Record<(typeof PRIMARY_PLATFORMS)[number], (t: string, angle: string) => string> = {
  x: (t, angle) => `Accounts, analysts and threads about ${t}${angle ? ` — especially ${angle}` : ""}.`,
  instagram: (t) => `Creator pages and Reels about ${t}.`,
  tiktok: (t) => `Short-form creators and edits about ${t}.`,
  youtube: (t, angle) => `Channels, videos and Shorts about ${t}${angle ? `, including ${angle}` : ""}.`,
};

/** Analyze one or more user topics into a combined strategy. */
export function analyzeTopics(topics: string[]): TopicIntel {
  const mainTopic = topics[0] ?? "your interests";
  const haystack = topics.join(" ").toLowerCase();

  const matched = TYPE_DEFS.filter((def) =>
    def.keywords.some((k) => haystack.includes(k)),
  );
  const defs = matched.length > 0 ? matched.slice(0, 2) : [];

  const queryTemplates = defs[0]?.queryTemplates ?? GENERAL.queryTemplates;
  const platforms = defs[0]?.platforms ?? GENERAL.platforms;

  // Expand queries for up to 3 topics; primary topic gets the full template set.
  const searchQueries: string[] = [];
  topics.slice(0, 3).forEach((topic, i) => {
    const templates = i === 0 ? queryTemplates : queryTemplates.slice(0, 2);
    for (const tpl of templates) {
      const query = tpl.replace("{t}", topic);
      if (!searchQueries.includes(query)) searchQueries.push(query);
    }
  });

  const angle1 = angleFrom(queryTemplates[0], mainTopic);
  const platformFit = Object.fromEntries(
    PRIMARY_PLATFORMS.map((p) => [p, PLATFORM_FIT_TEMPLATE[p](mainTopic, angle1)]),
  ) as TopicIntel["platformFit"];

  return {
    mainTopic,
    platformFit,
    platformQueries: buildPlatformQueries(mainTopic, defs[0]),
    topicTypes: defs.length > 0 ? defs.map((d) => d.type) : ["general"],
    searchQueries: searchQueries.slice(0, 8),
    platforms,
    muteHints: [...(defs[0]?.muteHints ?? []), ...GENERAL.muteHints].slice(0, 6),
  };
}
