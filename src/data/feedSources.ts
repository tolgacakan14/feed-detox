import type {
  DiscoveryResult,
  DiscoveryType,
  EngagementLabel,
  Freshness,
  ItemLang,
  Platform,
  Popularity,
} from "@/types";

/**
 * Curated DEMO signal database.
 *
 * Every URL here is a REAL, well-known, stable destination (official brand
 * accounts, famous channels, large subreddits, established sites) — nothing
 * is invented. The popularity / freshness / engagement fields are curated
 * DEMO labels (sample signals), NOT live metrics. The UI marks these as
 * "Demo signal" and the structure is built so real-time search/API ranking
 * can replace matchFeedSources() later without touching consumers.
 */

interface Demo {
  platform: Platform;
  type: DiscoveryType;
  title: string;
  creatorName?: string;
  handle?: string;
  url: string;
  category: string;
  language: ItemLang;
  popularity: Popularity;
  freshness: Freshness;
  engagement: EngagementLabel;
  tags: string[];
  desc: string;
  reason: string;
  official?: boolean;
}

const DEMO: Demo[] = [
  // ── Galatasaray (TR) ──────────────────────────────────────────────
  {
    platform: "x", type: "creator", title: "Galatasaray SK",
    creatorName: "Galatasaray", handle: "@GalatasaraySK",
    url: "https://x.com/GalatasaraySK", category: "Galatasaray", language: "tr",
    popularity: "global", freshness: "evergreen", engagement: "High engagement",
    tags: ["galatasaray", "futbol", "football"],
    desc: "Official club account — matchday, squad and transfer news first-hand.",
    reason: "Following the official account anchors your feed on real club news, not rumor pages.",
    official: true,
  },
  {
    platform: "instagram", type: "creator", title: "Galatasaray on Instagram",
    creatorName: "Galatasaray", handle: "@galatasaray",
    url: "https://www.instagram.com/galatasaray", category: "Galatasaray", language: "tr",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["galatasaray", "futbol", "football"],
    desc: "Official Instagram — matchday visuals and behind-the-scenes.",
    reason: "Saving official posts teaches Explore to surface real club content over meme pages.",
    official: true,
  },
  {
    platform: "web", type: "website", title: "Galatasaray — Official Site",
    url: "https://www.galatasaray.org", category: "Galatasaray", language: "tr",
    popularity: "niche", freshness: "evergreen", engagement: "Editor pick",
    tags: ["galatasaray", "futbol", "football"],
    desc: "The cleanest source for official statements — zero rumor noise.",
    reason: "Clicking the official source trains your browser and feed toward primary info.",
    official: true,
  },
  {
    platform: "web", type: "website", title: "Galatasaray on Transfermarkt",
    url: "https://www.transfermarkt.com/galatasaray/startseite/verein/141",
    category: "Galatasaray", language: "mixed",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["galatasaray", "futbol", "football", "transfer"],
    desc: "Real squad values and verified transfer data — fact-check rumors here.",
    reason: "Reading real data recalibrates which transfer content you engage with.",
  },
  {
    platform: "reddit", type: "community", title: "r/Galatasaray",
    url: "https://www.reddit.com/r/galatasaray", category: "Galatasaray", language: "mixed",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["galatasaray", "futbol", "football"],
    desc: "English + Turkish fan community with match threads.",
    reason: "Joining keeps the topic alive in your history across every platform.",
  },

  // ── Football analysis (EN/mixed) ──────────────────────────────────
  {
    platform: "youtube", type: "video", title: "Tifo Football",
    creatorName: "Tifo Football", handle: "@tifofootball",
    url: "https://www.youtube.com/@tifofootball", category: "Football analysis", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["football", "futbol", "soccer", "tactics", "analysis", "galatasaray", "premier league"],
    desc: "Animated tactical breakdowns — the calm, smart end of football content.",
    reason: "Full watches on analysis pull your YouTube home away from transfer bait.",
  },
  {
    platform: "x", type: "creator", title: "OptaJoe",
    creatorName: "Opta", handle: "@OptaJoe",
    url: "https://x.com/OptaJoe", category: "Football analysis", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "High engagement",
    tags: ["football", "futbol", "soccer", "stats", "analysis", "galatasaray"],
    desc: "Football's most-quoted stats account — facts, not hot takes.",
    reason: "Engaging with data accounts crowds drama out of your timeline.",
  },
  {
    platform: "web", type: "website", title: "StatsBomb",
    url: "https://statsbomb.com", category: "Football analysis", language: "en",
    popularity: "niche", freshness: "trending", engagement: "Niche quality",
    tags: ["football", "futbol", "soccer", "data", "analysis", "tactics", "galatasaray"],
    desc: "Data-driven football analysis used by real clubs.",
    reason: "Deep analytical reads sharpen the searches you run elsewhere.",
  },
  {
    platform: "web", type: "article", title: "The Coaches' Voice",
    url: "https://www.coachesvoice.com", category: "Football analysis", language: "en",
    popularity: "niche", freshness: "new", engagement: "Editor pick",
    tags: ["football", "futbol", "soccer", "tactics", "analysis", "galatasaray"],
    desc: "Coaches and players explain the game in their own words.",
    reason: "Long-form tactical reads teach your feed you want depth, not clips.",
  },
  {
    platform: "reddit", type: "community", title: "r/soccer",
    url: "https://www.reddit.com/r/soccer", category: "Football analysis", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["football", "futbol", "soccer", "galatasaray", "premier league"],
    desc: "The largest football community — upvoted analysis beats feed rumors.",
    reason: "Community browsing feeds the search history behind your other apps.",
  },

  // ── AI tools (EN) ─────────────────────────────────────────────────
  {
    platform: "youtube", type: "video", title: "Two Minute Papers",
    creatorName: "Two Minute Papers", handle: "@TwoMinutePapers",
    url: "https://www.youtube.com/@TwoMinutePapers", category: "AI tools", language: "en",
    popularity: "global", freshness: "trending", engagement: "Popular",
    tags: ["ai", "ai tools", "yapay zeka", "machine learning", "tech"],
    desc: "Short, visual explainers of the latest AI research.",
    reason: "Finishing these videos rewires YouTube toward real AI, not hype.",
  },
  {
    platform: "web", type: "website", title: "Hugging Face",
    url: "https://huggingface.co", category: "AI tools", language: "en",
    popularity: "niche", freshness: "trending", engagement: "Niche quality",
    tags: ["ai", "ai tools", "yapay zeka", "machine learning", "llm"],
    desc: "Where real AI models live — browse trending models, not screenshots of them.",
    reason: "Browsing real tools recalibrates your feed toward substance.",
  },
  {
    platform: "web", type: "website", title: "Product Hunt — AI",
    url: "https://www.producthunt.com/categories/artificial-intelligence",
    category: "AI tools", language: "en",
    popularity: "global", freshness: "new", engagement: "Rising",
    tags: ["ai", "ai tools", "yapay zeka", "startup", "saas"],
    desc: "Daily launches of real AI tools you can actually try.",
    reason: "Following launches replaces thread hype with things that ship.",
  },
  {
    platform: "newsletter", type: "newsletter", title: "Ben's Bites",
    url: "https://bensbites.com", category: "AI tools", language: "en",
    popularity: "niche", freshness: "new", engagement: "Editor pick",
    tags: ["ai", "ai tools", "yapay zeka", "newsletter"],
    desc: "A daily AI newsletter that keeps the signal flowing off-feed.",
    reason: "Newsletters keep quality input coming while your feed relearns.",
  },
  {
    platform: "reddit", type: "community", title: "r/MachineLearning",
    url: "https://www.reddit.com/r/MachineLearning", category: "AI tools", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["ai", "ai tools", "yapay zeka", "machine learning", "data science"],
    desc: "Research-grade AI discussion — trains you to spot slop instantly.",
    reason: "Skeptical community threads make your feed harder to fool.",
  },

  // ── Music discovery (EN) ──────────────────────────────────────────
  {
    platform: "youtube", type: "video", title: "NPR Music (Tiny Desk)",
    creatorName: "NPR Music", handle: "@nprmusic",
    url: "https://www.youtube.com/@nprmusic", category: "Music discovery", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["music", "müzik", "indie", "discovery", "live"],
    desc: "Tiny Desk and beyond — human-curated live sessions.",
    reason: "Watching full sessions pulls autoplay off the mainstream loop.",
  },
  {
    platform: "web", type: "website", title: "Bandcamp",
    url: "https://bandcamp.com", category: "Music discovery", language: "en",
    popularity: "niche", freshness: "new", engagement: "Niche quality",
    tags: ["music", "müzik", "indie", "underground", "deep house", "discovery"],
    desc: "Browsing here surfaces artists the algorithm hasn't flattened yet.",
    reason: "Buying/streaming from here trains recommendations off the charts.",
  },
  {
    platform: "reddit", type: "community", title: "r/listentothis",
    url: "https://www.reddit.com/r/listentothis", category: "Music discovery", language: "en",
    popularity: "niche", freshness: "trending", engagement: "Rising",
    tags: ["music", "müzik", "indie", "underground", "discovery"],
    desc: "Fresh under-the-radar tracks, community-upvoted.",
    reason: "Fresh community picks are better input than autoplay.",
  },

  // ── Fashion / streetwear (EN) ─────────────────────────────────────
  {
    platform: "instagram", type: "creator", title: "Hypebeast",
    creatorName: "Hypebeast", handle: "@hypebeast",
    url: "https://www.instagram.com/hypebeast", category: "Fashion & streetwear", language: "en",
    popularity: "global", freshness: "trending", engagement: "Popular",
    tags: ["fashion", "moda", "streetwear", "sneaker", "style"],
    desc: "Release news straight from the source instead of repost pages.",
    reason: "Following the source teaches Explore your real taste level.",
    official: true,
  },
  {
    platform: "reddit", type: "community", title: "r/streetwear",
    url: "https://www.reddit.com/r/streetwear", category: "Fashion & streetwear", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["fashion", "moda", "streetwear", "sneaker", "style"],
    desc: "Real fits with honest feedback — sharpens what you save.",
    reason: "Critique threads teach you what to save, the strongest Explore signal.",
  },

  // ── No-politics clean feed (EN) ───────────────────────────────────
  {
    platform: "youtube", type: "video", title: "Kurzgesagt",
    creatorName: "Kurzgesagt – In a Nutshell", handle: "@kurzgesagt",
    url: "https://www.youtube.com/@kurzgesagt", category: "No-politics clean feed", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["no politics", "siyasetsiz", "calm", "science", "clean feed"],
    desc: "Calm, beautiful science explainers — the antidote to rage bait.",
    reason: "Long calm watches teach YouTube to stop recommending outrage.",
  },
  {
    platform: "reddit", type: "community", title: "r/UpliftingNews",
    url: "https://www.reddit.com/r/UpliftingNews", category: "No-politics clean feed", language: "en",
    popularity: "global", freshness: "new", engagement: "Rising",
    tags: ["no politics", "siyasetsiz", "calm", "good news", "clean feed"],
    desc: "Verified good news, strictly moderated for tone.",
    reason: "Positive engagement flips your feed's tone within a week.",
  },

  // ── Turkish content (TR) ──────────────────────────────────────────
  {
    platform: "youtube", type: "video", title: "Barış Özcan",
    creatorName: "Barış Özcan", handle: "@BarisOzcan",
    url: "https://www.youtube.com/@BarisOzcan", category: "Turkish content", language: "tr",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["türkçe", "turkish", "tech", "design", "creator"],
    desc: "One of Turkey's most-watched creators — design, tech and ideas.",
    reason: "Quality Turkish content teaches your feed you want depth in TR too.",
  },
  {
    platform: "web", type: "website", title: "Webrazzi",
    url: "https://webrazzi.com", category: "Turkish content", language: "tr",
    popularity: "niche", freshness: "new", engagement: "Editor pick",
    tags: ["türkçe", "turkish", "tech", "startup", "girişim"],
    desc: "Turkey's leading tech and startup source.",
    reason: "Reading local tech sources rebalances your feed toward real signal.",
  },
];

/** Match demo signals against user topics via tag inclusion (both ways). */
export function matchFeedSources(topics: string[]): DiscoveryResult[] {
  const wanted = topics.map((t) => t.toLowerCase()).filter((t) => t.length > 1);
  return DEMO.filter((d) =>
    d.tags.some((tag) => wanted.some((w) => w.includes(tag) || tag.includes(w))),
  ).map((d, i) => ({
    id: `demo-${i}-${(d.handle ?? d.title).toLowerCase().replace(/\W+/g, "-")}`,
    title: d.title,
    url: d.url,
    platform: d.platform,
    type: d.type,
    source: "curated" as const,
    confidence: d.official ? ("verified" as const) : ("likely" as const),
    isDirectLink: true,
    isDemo: true,
    reason: d.reason,
    creatorName: d.creatorName,
    handle: d.handle,
    category: d.category,
    itemLanguage: d.language,
    popularity: d.popularity,
    freshness: d.freshness,
    engagementLabel: d.engagement,
    shortDescription: d.desc,
  }));
}
