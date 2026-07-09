import { matchFeedSources } from "@/data/feedSources";
import { matchCurated } from "@/data/curatedSources";
import { analyzeTopics } from "@/lib/topicIntel";
import {
  dedupeByUrl,
  extractDirectLinks,
  finalizeFeedPackItem,
  guardResults,
  scoreResult,
  searchAction,
  searchProvider,
} from "@/lib/discovery";
import { validateResults } from "@/lib/validateUrl";
import type {
  DayPlanItem,
  DiscoveryResult,
  FeedPackInput,
  FeedPackResult,
  SectionKey,
} from "@/types";

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

const SECTION_CAPS: Record<SectionKey, number> = {
  creators: 6,
  content: 5,
  fresh: 4,
  niche: 4,
  communities: 5,
  fallback: 2, // hard product cap — fallback never dominates a pack
};

/** Product rule: search fallback links only appear when direct curated
 * matches are scarce, and never more than 2 of them. */
const MIN_DIRECT_BEFORE_FALLBACK = 6;
const MAX_FALLBACK_ITEMS = 2;

const EMPTY = (): Record<SectionKey, DiscoveryResult[]> => ({
  creators: [],
  content: [],
  fresh: [],
  niche: [],
  communities: [],
  fallback: [],
});

/** Place each item in exactly one section by what it does for the feed. */
function groupResults(items: DiscoveryResult[], topics: string[]) {
  const buckets = EMPTY();
  for (const it of items) {
    if (it.type === "search_action") buckets.fallback.push(it);
    else if (it.type === "community" || it.type === "newsletter") buckets.communities.push(it);
    else if (it.type === "creator" || it.type === "account" || it.type === "channel")
      buckets.creators.push(it);
    else if (it.freshness === "trending" || it.freshness === "active_recently") buckets.fresh.push(it);
    else if (
      it.popularity === "niche" ||
      it.type === "website" ||
      it.type === "article" ||
      it.engagementLabel === "Niche quality"
    )
      buckets.niche.push(it);
    else buckets.content.push(it);
  }
  (Object.keys(buckets) as SectionKey[]).forEach((k) => {
    buckets[k] = dedupeByUrl(buckets[k])
      .sort((a, b) => scoreResult(b, topics) - scoreResult(a, topics))
      .slice(0, SECTION_CAPS[k]);
  });
  return buckets;
}

// ── Generic discovery pool ──────────────────────────────────────────────────
// A handful of broad, genuinely direct (non-search) destinations used only
// when a topic has zero curated matches, so an unknown topic still returns a
// pack that leads with real links instead of jumping straight to fallback.

const GENERIC_DIRECT_POOL: DiscoveryResult[] = [
  {
    id: "generic-ted", title: "TED", url: "https://www.youtube.com/@TED",
    platform: "youtube", type: "video", source: "curated", confidence: "verified",
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
  const topics = parsed.topics.length > 0 ? parsed.topics : ["your interests"];
  const intel = analyzeTopics(topics);
  const t = intel.mainTopic;

  // 1) Demo direct signals (rich metadata) + curated real destinations.
  const demo = matchFeedSources(topics);
  const curated: DiscoveryResult[] = matchCurated(topics).map((s, i) => ({
    ...s,
    isDirectLink: true,
    id: `curated-${i}-${s.title.toLowerCase().replace(/\W+/g, "-")}`,
  }));

  // 2) Optional live search (no provider configured yet) → classified direct links.
  let searched: DiscoveryResult[] = [];
  if (searchProvider) {
    const settled = await Promise.allSettled(
      intel.searchQueries.slice(0, 4).map((query) => searchProvider!(query)),
    );
    searched = extractDirectLinks(
      settled.flatMap((r) => (r.status === "fulfilled" ? r.value : [])),
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

  // 3) Search fallbacks — real platform search pages. These are ONLY added
  // when direct matches are scarce, and never more than MAX_FALLBACK_ITEMS.
  // This is the core product rule: search links are fallback, not the
  // main output. Most topics (10+ curated categories) never trigger this.
  const fallbacks: DiscoveryResult[] =
    realPool.length < MIN_DIRECT_BEFORE_FALLBACK
      ? [
          searchAction("youtube", t, "Open and finish 2–3 results — watch time is YouTube's strongest signal."),
          searchAction("x", t, "Follow 3–5 accounts here that post analysis, not outrage."),
          searchAction("tiktok", t, "Watch a few results fully — your For You page updates within days."),
          searchAction("reddit", intel.searchQueries[1] ?? t),
        ].slice(0, MAX_FALLBACK_ITEMS)
      : [];

  // Grouping happens on the RAW freshness/popularity signal (undefined means
  // "no signal, use type/popularity instead"). Verified Feed Pack quality
  // fields (whyItMatters/bestAction/noiseRisk/nicheLevel/freshness defaults)
  // are filled in per-bucket AFTER grouping, so a defaulted freshness value
  // never leaks back into where an item gets placed.
  const sections = groupResults([...realPool, ...fallbacks], topics);

  (Object.keys(sections) as SectionKey[]).forEach((k) => {
    sections[k] = sections[k]
      .map(finalizeFeedPackItem)
      // Anti-hallucination completeness guard: a card missing a required
      // field shouldn't reach the UI, even though finalize should always
      // fill these — this is the last checkpoint before returning.
      .filter(
        (r) => r.title && r.url && r.whyItMatters && r.bestAction && r.noiseRisk && r.nicheLevel && r.freshness,
      );
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

  const summary = isGenericDiscovery
    ? input.uiLang === "tr"
      ? `“${t}” henüz curated kaynak setimizde yok, o yüzden geniş kapsamlı direct source’lar getirdik. Bu konuya özel real-time source discovery ileride eklenebilir.`
      : `“${t}” isn't in our curated set yet, so here are broad direct sources to start with. Topic-specific real-time source discovery can be added later.`
    : input.uiLang === "tr"
      ? `“${t}” için en iyi creator, content ve community’ler — her biri feed’ine ne katıyorsa ona göre gruplandı.`
      : `The best creators, content and communities for “${t}” — grouped by what each one does for your feed.`;

  return {
    input,
    topics,
    unwantedTopics: parsed.unwanted,
    summary,
    sections,
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
    return { ...parsed, uiLang: parsed.uiLang === "tr" ? "tr" : "en" };
  } catch {
    return null;
  }
}
