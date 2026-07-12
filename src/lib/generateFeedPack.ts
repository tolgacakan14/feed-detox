import { matchFeedSources } from "@/data/feedSources";
import { matchCurated } from "@/data/curatedSources";
import { analyzeTopics, type TopicIntel } from "@/lib/topicIntel";
import { understandTopic, type TopicContext } from "@/lib/topicUnderstanding";
import {
  dedupeByUrl,
  extractDirectLinks,
  filterLowQuality,
  finalizeFeedPackItem,
  guardResults,
  mergeExtracted,
  scoreResult,
  searchAction,
  tiktokCreatorSearch,
  youtubeChannelSearch,
} from "@/lib/discovery";
import { translations } from "@/lib/i18n";
import { isLiveSearchConfigured, searchSocial } from "@/lib/searchProviders";
import { validateResults } from "@/lib/validateUrl";
import type {
  DayPlanItem,
  DiscoveryResult,
  FeedPackInput,
  FeedPackResult,
  SectionKey,
  TrainablePlatform,
} from "@/types";

/** The 4 platforms the platform-selection UI offers. Empty/missing
 * `selectedPlatforms` on the input defaults to all four. */
const ALL_TRAINABLE_PLATFORMS: TrainablePlatform[] = ["x", "instagram", "tiktok", "youtube"];

const PLATFORM_SHORT_NAME: Record<TrainablePlatform, string> = {
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

/** "X, Instagram and YouTube" / "X, Instagram ve YouTube" — always listed in
 * the canonical x/instagram/tiktok/youtube order regardless of selection order. */
function formatPlatformList(platforms: Set<TrainablePlatform>, lang: "en" | "tr"): string {
  const names = ALL_TRAINABLE_PLATFORMS.filter((p) => platforms.has(p)).map((p) => PLATFORM_SHORT_NAME[p]);
  if (names.length <= 1) return names.join("");
  const last = names[names.length - 1];
  const rest = names.slice(0, -1).join(", ");
  return `${rest} ${lang === "tr" ? "ve" : "and"} ${last}`;
}

/**
 * Feed Pack pipeline:
 * topic parsing → topic intelligence → discovery (demo direct signals +
 * curated + optional live search) → validation → guard → grouping → ranking.
 * Direct creator/content links lead; generated search pages appear only as a
 * clearly-labelled fallback group at the bottom. Nothing is invented.
 */

// ── Prompt parsing ─────────────────────────────────────────────────────────

const PILL_TOPICS: Record<string, string> = {
  Galatasaray: "galatasaray",
  "AI Tools": "ai tools",
  Football: "football",
  Career: "career",
  Music: "music",
  Fashion: "streetwear",
  Turkish: "turkish content",
  English: "english content",
  "No Politics": "no politics",
};

const LESS_MARKERS = ["less ", "no ", "without ", "fewer ", "daha az ", "-"];
const FILLER =
  /\b(i want|i'd like|more of|more|please|content|stuff|daha fazla|istiyorum)\b/gi;

const NO_POLITICS_PHRASE = /^no[\s-]?politics\b/;

function parsePrompt(prompt: string, pills: string[]) {
  const topics: string[] = [];
  const unwanted: string[] = [];
  let wantsNoPoliticsFromText = false;

  const segments = prompt
    // Turkish dotted capital İ lowercases to "i" + a combining dot in plain
    // toLowerCase(), which then never matches any keyword ("ANALİZİ" →
    // "anali̇zi̇"). Map it first — İ exists only in Turkish, so this is safe.
    .replace(/İ/g, "i")
    .toLowerCase()
    .split(/[,;.\n]|\band\b|\bve\b/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const raw of segments) {
    // "no politics" named on its own means "give me a clean feed" (a topic
    // to match), not "avoid the word politics" — don't let it get swallowed
    // by the LESS_MARKERS negation below, or the No-politics clean feed
    // category becomes unreachable by its own name.
    if (NO_POLITICS_PHRASE.test(raw)) {
      if (!topics.includes("no politics")) topics.push("no politics");
      wantsNoPoliticsFromText = true;
      continue;
    }
    const marker = LESS_MARKERS.find((m) => raw.startsWith(m));
    const cleaned = (marker ? raw.slice(marker.length) : raw)
      .replace(FILLER, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned || cleaned.length < 2) continue;
    (marker ? unwanted : topics).push(cleaned);
  }

  for (const pill of pills) {
    const topic = PILL_TOPICS[pill];
    if (topic && !topics.includes(topic)) topics.push(topic);
  }

  const wantsNoPolitics =
    wantsNoPoliticsFromText ||
    pills.includes("No Politics") ||
    unwanted.some((t) => /politic|siyaset|gündem/.test(t));

  return { topics: topics.slice(0, 5), unwanted: unwanted.slice(0, 6), wantsNoPolitics };
}

// ── Training plan & mute keywords ──────────────────────────────────────────

const POLITICS_MUTES = ["politics", "siyaset", "gündem", "election"];

function buildTrainingPlan(topic: string, lang: "en" | "tr"): DayPlanItem[] {
  if (lang === "tr") {
    return [
      { day: 1, title: "Creator’ları takip et", description: `Top creators bölümünden ${topic} ile ilgili 5–10 hesabı follow et.` },
      { day: 2, title: "Content’i izle & kaydet", description: "Popular content’lerden 2–3 tanesini sonuna kadar izle, beğendiğini kaydet." },
      { day: 3, title: "Keyword’leri mute et", description: "Mute listesindeki düşük değerli keyword’leri sessize al." },
      { day: 4, title: "Niche’e in", description: "Sadece viral değil, niche kaliteli source’larla etkileşime gir." },
      { day: 5, title: "Community & newsletter", description: "Community’lere katıl, bir newsletter’a abone ol." },
      { day: 6, title: "Temizlik yap", description: "5 düşük kaliteli source’u unfollow et, junk’a “ilgilenmiyorum” de." },
      { day: 7, title: "Gözden geçir & tekrarla", description: "Feed’inde ne değişti bak, 2–3 gün aynı signal’ları tekrarla." },
    ];
  }
  return [
    { day: 1, title: "Follow the creators", description: `Open Top creators and follow 5–10 quality accounts about ${topic}.` },
    { day: 2, title: "Watch & save content", description: "Finish 2–3 items from Popular content and save what you like." },
    { day: 3, title: "Mute the keywords", description: "Mute the low-value keywords in the mute list." },
    { day: 4, title: "Go niche", description: "Engage with niche quality sources, not only viral posts." },
    { day: 5, title: "Join & subscribe", description: "Join the communities and subscribe to one newsletter." },
    { day: 6, title: "Clean house", description: "Unfollow 5 low-quality sources and hit “Not interested” on junk." },
    { day: 7, title: "Review & repeat", description: "Check what changed, then repeat the same signals for 2–3 days." },
  ];
}

// ── Grouping & ranking ─────────────────────────────────────────────────────
// Platform-first: Feed Detox's job is training X/Instagram/TikTok/YouTube
// algorithms. Every item is routed to its own platform's section; Reddit,
// websites and newsletters are secondary and capped small in "more" so they
// never dominate the pack the way they used to when grouping was by content
// type instead of by platform.

const SECTION_CAPS: Record<SectionKey, number> = {
  x: 5, // top-5 rule: direct accounts/posts only
  instagram: 5,
  tiktok: 5,
  youtube: 5,
  more: 3, // secondary sources — deliberately small so they stay secondary
  discovery: 6, // last-resort search paths — never mixed into platform sections
};


const EMPTY = (): Record<SectionKey, DiscoveryResult[]> => ({
  x: [],
  instagram: [],
  tiktok: [],
  youtube: [],
  more: [],
  discovery: [],
});

const PROFILE_TYPES = new Set(["account", "creator", "channel"]);
const CONTENT_TYPES = new Set(["post", "reel", "video", "short"]);
const PLATFORM_KEYS: SectionKey[] = ["x", "instagram", "tiktok", "youtube"];

/**
 * Healthy section mix: when a platform has BOTH profiles and watchable
 * content, the top-5 shouldn't be all-videos (weak metadata risk) or
 * all-profiles (nothing to watch right now) — take the 1–2 best profiles
 * plus the 2–4 best content items, then fill any remaining slots by score.
 * Sections with only one kind just take the top-scored items as before.
 */
function mixSection(sorted: DiscoveryResult[], cap: number): DiscoveryResult[] {
  const profiles = sorted.filter((r) => PROFILE_TYPES.has(r.type));
  const contents = sorted.filter((r) => CONTENT_TYPES.has(r.type));
  if (profiles.length === 0 || contents.length === 0) return sorted.slice(0, cap);
  const picked = new Set<DiscoveryResult>(profiles.slice(0, 2));
  for (const c of contents) {
    if (picked.size >= cap) break;
    picked.add(c);
  }
  for (const r of sorted) {
    if (picked.size >= cap) break;
    picked.add(r);
  }
  return sorted.filter((r) => picked.has(r)); // display order stays by score
}

/** Route each item to its own platform's section. Search/discovery pages
 * NEVER enter a platform section — they go to the low-priority discovery
 * bucket, so every platform card is a real, direct destination. Ranking
 * runs on the full TopicContext (related terms, positive/negative signals,
 * quality intent), so the top-5 cut is semantic, not keyword-based. */
function groupResults(items: DiscoveryResult[], ctx: TopicContext) {
  const buckets = EMPTY();
  for (const it of items) {
    if (it.type === "search_action") buckets.discovery.push(it);
    else if (it.platform === "x") buckets.x.push(it);
    else if (it.platform === "instagram") buckets.instagram.push(it);
    else if (it.platform === "tiktok") buckets.tiktok.push(it);
    else if (it.platform === "youtube") buckets.youtube.push(it);
    else buckets.more.push(it); // reddit, web, newsletter, spotify
  }
  (Object.keys(buckets) as SectionKey[]).forEach((k) => {
    const sorted = dedupeByUrl(buckets[k]).sort(
      (a, b) =>
        scoreResult(b, ctx.topics, ctx.avoidEntities, ctx) -
        scoreResult(a, ctx.topics, ctx.avoidEntities, ctx),
    );
    buckets[k] = PLATFORM_KEYS.includes(k)
      ? mixSection(sorted, SECTION_CAPS[k])
      : sorted.slice(0, SECTION_CAPS[k]);
  });
  return buckets;
}

const DISCOVERY_REASON: Record<"x" | "instagram" | "tiktok" | "youtube", [string, string]> = {
  x: [
    "Follow 3–5 accounts that post analysis, not outrage — then bookmark the good threads.",
    "A second angle on X — different search, same goal: real accounts over rumor threads.",
  ],
  instagram: [
    "Follow 2–3 pages, then watch a few Reels fully — Explore updates fast.",
    "Try a different angle here too — creator pages surface differently than fan pages.",
  ],
  tiktok: [
    "Follow 2–3 creators here — TikTok reshapes your For You page within days.",
    "A second TikTok search — watch a few videos fully to lock in the signal.",
  ],
  youtube: [
    "Subscribing to 2–3 quality channels reshapes your YouTube Home fastest.",
    "A second YouTube angle — full watches on niche content train recommendations fastest.",
  ],
};

/**
 * STRICT search-fallback rule: a selected platform gets Search fallback
 * paths ONLY when it has ZERO direct results — if even one real creator/
 * content link exists, no search link is shown for that platform. Fallbacks
 * always live in the separate bottom "discovery" section, clearly labeled,
 * never among a platform's top cards. Each empty platform gets two real,
 * differently-angled in-app searches (from topicIntel's per-platform query
 * strategies) — never an invented account.
 */
function addPlatformDiscovery(
  buckets: Record<SectionKey, DiscoveryResult[]>,
  topic: string,
  platformQueries: TopicIntel["platformQueries"],
  selectedPlatforms: Set<TrainablePlatform>,
): void {
  (["x", "instagram", "tiktok", "youtube"] as const).forEach((key) => {
    if (!selectedPlatforms.has(key)) return;
    if (buckets[key].length > 0) return; // direct results exist → no fallback

    const queries = platformQueries[key];
    const [primaryReason, secondaryReason] = DISCOVERY_REASON[key];
    // Query strings already name the platform/angle (e.g. "topic official
    // Instagram") — use a plain title so it isn't mentioned twice.
    const titleFor = (query: string) => `Explore “${query}”`;

    const primary =
      key === "tiktok"
        ? tiktokCreatorSearch(topic)
        : key === "youtube"
          ? youtubeChannelSearch(topic)
          : searchAction(key, queries[0], primaryReason, titleFor(queries[0]));
    buckets.discovery.push(primary);

    const q2 = queries[2] ?? queries[1] ?? topic;
    buckets.discovery.push(searchAction(key, q2, secondaryReason, titleFor(q2)));
  });
}

// ── Generic discovery pool ──────────────────────────────────────────────────
// A handful of broad, genuinely direct (non-search) destinations used only
// when a topic has zero curated matches, so an unknown topic still returns a
// pack that leads with real links instead of jumping straight to fallback.

const GENERIC_DIRECT_POOL: DiscoveryResult[] = [
  {
    id: "generic-ted", title: "TED", url: "https://www.youtube.com/@TED",
    platform: "youtube", type: "channel", source: "curated", confidence: "verified",
    isDirectLink: true, isDemo: true, creatorName: "TED", handle: "@TED",
    category: "General", itemLanguage: "en", popularity: "global",
    freshness: "evergreen", engagementLabel: "High engagement",
    shortDescription: "Ideas worth spreading, on any topic worth learning.",
    whyItMatters: "A reliable starting point while we don't have a curated match for your exact topic yet.",
  },
  {
    id: "generic-hn", title: "Hacker News", url: "https://news.ycombinator.com/",
    platform: "web", type: "website", source: "curated", confidence: "verified",
    isDirectLink: true, isDemo: true, category: "General", itemLanguage: "en",
    popularity: "global", freshness: "evergreen", engagementLabel: "Popular",
    shortDescription: "Broad, high-signal link aggregator across tech and beyond.",
    whyItMatters: "Useful general discovery while your specific topic isn't in our curated set.",
  },
  {
    id: "generic-reddit-til", title: "r/todayilearned",
    url: "https://www.reddit.com/r/todayilearned/", platform: "reddit",
    type: "community", source: "curated", confidence: "likely",
    isDirectLink: true, isDemo: true, category: "General", itemLanguage: "en",
    popularity: "global", freshness: "evergreen", engagementLabel: "Popular",
    shortDescription: "A large, moderated community for genuinely interesting finds.",
    whyItMatters: "A safe direct community to join while we build out coverage for this topic.",
  },
  {
    id: "generic-producthunt", title: "Product Hunt",
    url: "https://www.producthunt.com/", platform: "web", type: "website",
    source: "curated", confidence: "verified", isDirectLink: true, isDemo: true,
    category: "General", itemLanguage: "en", popularity: "global",
    freshness: "active_recently", engagementLabel: "Rising",
    shortDescription: "Daily launches across every category, not just tech.",
    whyItMatters: "Real, browsable source while curated coverage for your topic expands.",
  },
];

// ── Main generator ─────────────────────────────────────────────────────────

export async function generateFeedPack(input: FeedPackInput): Promise<FeedPackResult> {
  const parsed = parsePrompt(input.prompt, input.pills);
  const rawTopics = parsed.topics.length > 0 ? parsed.topics : ["your interests"];

  // Semantic topic understanding: normalized topic, category, related and
  // negative vocabulary, quality/platform intent, entities to prioritize
  // and avoid. Everything downstream (queries, ranking, filtering, card
  // copy) reads this one context.
  const ctx = understandTopic(rawTopics, input.prompt);
  const topics = ctx.topics;
  const intel = analyzeTopics(topics);
  const t = intel.mainTopic;

  // Platform selection precedence: explicit UI selection → platforms named
  // in the prompt itself ("galatasaray youtube") → all four. Never empty.
  const selectedPlatforms = new Set<TrainablePlatform>(
    input.selectedPlatforms && input.selectedPlatforms.length > 0
      ? input.selectedPlatforms
      : ctx.platformIntent.length > 0
        ? ctx.platformIntent
        : ALL_TRAINABLE_PLATFORMS,
  );

  // 1) Demo direct signals (rich metadata) + curated real destinations.
  const demo = matchFeedSources(topics);
  const curated: DiscoveryResult[] = matchCurated(topics).map((s, i) => ({
    ...s,
    isDirectLink: true,
    id: `curated-${i}-${s.title.toLowerCase().replace(/\W+/g, "-")}`,
  }));

  // 2) Live social discovery — platform-scoped queries through the real
  // provider layer (YouTube Data API and/or a web-search API, env-keyed).
  // Web queries are site:-scoped so results ARE social URLs; the extractor
  // then keeps only recognizable direct profiles/posts/videos. Without any
  // key this is a no-op and the pack runs on curated data — never fakes.
  let searched: DiscoveryResult[] = [];
  if (isLiveSearchConfigured()) {
    const SITE_SCOPE = {
      x: "site:x.com OR site:twitter.com",
      instagram: "site:instagram.com",
      tiktok: "site:tiktok.com",
    } as const;

    const calls: Promise<DiscoveryResult[]>[] = [];
    (["x", "instagram", "tiktok"] as const).forEach((p) => {
      if (!selectedPlatforms.has(p)) return; // skip unselected platforms — no wasted API quota
      intel.platformQueries[p].slice(0, 2).forEach((query) => {
        calls.push(
          searchSocial(`${SITE_SCOPE[p]} ${query}`, p).then((hits) =>
            extractDirectLinks(hits, "web_search", true, ctx),
          ),
        );
      });
    });
    // YouTube goes through the Data API when keyed (real engagement-backed
    // results); otherwise the same site:-scoped web search.
    if (selectedPlatforms.has("youtube")) {
      intel.platformQueries.youtube.slice(0, 2).forEach((query) => {
        calls.push(
          searchSocial(query, "youtube").then((hits) =>
            extractDirectLinks(
              hits,
              hits.some((h) => h.source === "youtube_api") ? "api" : "web_search",
              true,
              ctx,
            ),
          ),
        );
      });
    }

    const settled = await Promise.allSettled(calls);
    // Hard quality floor (drops betting content + zero-relevance noise)
    // before scoring even sees these — the top-5 cut later should be
    // choosing among genuinely useful items, not just the least-bad ones.
    searched = filterLowQuality(
      mergeExtracted(settled.map((r) => (r.status === "fulfilled" ? r.value : []))),
      topics,
      ctx,
    );
  }

  // Validate + guard everything that claims to be a real destination, then
  // dedupe (demo + curated commonly point at the same URL for a topic) —
  // the fallback decision below must count unique destinations, not raw hits.
  let realPool = dedupeByUrl(await validateResults(guardResults([...demo, ...curated, ...searched])));

  // If the topic has zero curated matches, fall back to a small set of
  // broad, genuinely direct destinations rather than jumping straight to
  // search links — the pack should still lead with real, clickable sources.
  const isGenericDiscovery = realPool.length === 0;
  if (isGenericDiscovery) {
    realPool = GENERIC_DIRECT_POOL;
  }

  // Drop items for the 4 primary platforms the user didn't select — "more"
  // (Reddit/website/newsletter) is unaffected, it isn't one of the four.
  realPool = realPool.filter(
    (r) => !ALL_TRAINABLE_PLATFORMS.includes(r.platform as TrainablePlatform) ||
      selectedPlatforms.has(r.platform as TrainablePlatform),
  );

  // Route every direct item to its own platform's section, then top up any
  // of the 4 primary platforms that came up thin with ONE honest Discovery
  // search path — never a fake account, and never more than one per
  // platform. Verified Feed Pack quality fields (bestAction/noiseRisk/
  // nicheLevel/freshness defaults) are filled in per-bucket AFTER grouping,
  // so a defaulted value never leaks back into where an item gets placed.
  const sections = groupResults(realPool, ctx);
  addPlatformDiscovery(sections, t, intel.platformQueries, selectedPlatforms);
  sections.discovery = sections.discovery.slice(0, SECTION_CAPS.discovery);

  (Object.keys(sections) as SectionKey[]).forEach((k) => {
    const finalized = sections[k]
      .map((it) => finalizeFeedPackItem(it, ctx, input.uiLang))
      // Anti-hallucination completeness guard: a card missing a required
      // field shouldn't reach the UI, even though finalize should always
      // fill these — this is the last checkpoint before returning.
      .filter(
        (r) => r.title && r.url && r.whyItMatters && r.bestAction && r.noiseRisk && r.nicheLevel && r.freshness,
      );
    // Two cards with the same visible title read as a glitch even when the
    // URLs differ — common when several weak-metadata items collapse into
    // the same fallback label at finalize. Keep the higher-ranked one; a
    // section of 4 unique cards beats 5 with a visible duplicate.
    const seenTitles = new Set<string>();
    sections[k] = finalized.filter((r) => {
      const key = r.title.trim().toLowerCase();
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });
  });

  const all = Object.values(sections).flat();
  const verifiedLinksCount = all.filter((r) => r.type !== "search_action").length;
  const searchActionsCount = all.length - verifiedLinksCount;

  const muteKeywords = Array.from(
    new Set([
      ...parsed.unwanted.filter((u) => !/politic|siyaset/.test(u)),
      ...(parsed.wantsNoPolitics ? POLITICS_MUTES : []),
      ...intel.muteHints,
    ]),
  ).slice(0, 8);

  const platformList = formatPlatformList(selectedPlatforms, input.uiLang);
  const summary = isGenericDiscovery
    ? input.uiLang === "tr"
      ? `“${t}” henüz curated kaynak setimizde yok, o yüzden ${platformList} için geniş kapsamlı direct source’lar getirdik. Bu konuya özel real-time source discovery ileride eklenebilir.`
      : `“${t}” isn't in our curated set yet, so here are broad direct sources across ${platformList} to start with. Topic-specific real-time source discovery can be added later.`
    : input.uiLang === "tr"
      ? `“${t}” için ${platformList} üzerinde algorithm’ini eğitecek creator ve content’ler — platform platform gruplandı. Less noise, more signal.`
      : `Here's your training plan for “${t}” across ${platformList} — direct creators and content to train each app's algorithm. Less noise, more signal.`;

  // Self-describing, platform-first view of the same items — the shape API
  // consumers should read. `sections` stays for the existing UI.
  const dict = translations[input.uiLang].sections;
  const platformSections = {
    x: { title: dict.x.name, purpose: dict.x.purpose, items: sections.x },
    instagram: { title: dict.instagram.name, purpose: dict.instagram.purpose, items: sections.instagram },
    tiktok: { title: dict.tiktok.name, purpose: dict.tiktok.purpose, items: sections.tiktok },
    youtube: { title: dict.youtube.name, purpose: dict.youtube.purpose, items: sections.youtube },
    supportingSources: { title: dict.more.name, purpose: dict.more.purpose, items: sections.more },
    moreDiscoveryPaths: { title: dict.discovery.name, purpose: dict.discovery.purpose, items: sections.discovery },
  };

  return {
    input,
    topics,
    unwantedTopics: parsed.unwanted,
    summary,
    sections,
    platformSections,
    muteKeywords,
    trainingPlan: buildTrainingPlan(t, input.uiLang),
    metadata: {
      verifiedLinksCount,
      searchActionsCount,
      sourcesUsed: Array.from(new Set(all.map((r) => r.source))),
    },
    generatedAt: new Date().toISOString(),
  };
}

// ── URL-safe input encoding (for /results?data=…) ──────────────────────────

export function encodeFeedPackInput(input: FeedPackInput): string {
  const ascii = encodeURIComponent(JSON.stringify(input));
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(ascii).toString("base64")
      : btoa(ascii);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeFeedPackInput(encoded: string): FeedPackInput | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const ascii =
      typeof window === "undefined"
        ? Buffer.from(b64, "base64").toString()
        : atob(b64);
    const parsed = JSON.parse(decodeURIComponent(ascii)) as FeedPackInput;
    if (typeof parsed.prompt !== "string" || !Array.isArray(parsed.pills)) {
      return null;
    }
    const selectedPlatforms = Array.isArray(parsed.selectedPlatforms)
      ? parsed.selectedPlatforms.filter((p): p is TrainablePlatform =>
          (ALL_TRAINABLE_PLATFORMS as string[]).includes(p),
        )
      : [];
    return {
      ...parsed,
      // Same input-hygiene caps as the API route — the URL is user-editable.
      prompt: parsed.prompt.replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, 300),
      pills: parsed.pills.filter((p): p is string => typeof p === "string").slice(0, 10),
      uiLang: parsed.uiLang === "tr" ? "tr" : "en",
      selectedPlatforms,
    };
  } catch {
    return null;
  }
}
