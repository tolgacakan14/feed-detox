import { matchCurated } from "@/data/curatedSources";
import { analyzeTopics } from "@/lib/topicIntel";
import {
  dedupeByUrl,
  extractDirectLinks,
  guardResults,
  redditCommunitySearch,
  scoreResult,
  searchAction,
  searchProvider,
  tiktokCreatorSearch,
  youtubeChannelSearch,
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
 * topic parsing → topic intelligence → discovery (curated + live search if
 * configured + generated search actions) → URL validation → guard → dedupe
 * → ranking → sectioned output. No step may invent links: every URL comes
 * from the curated database, a (future) search API, or a real search page.
 */

// ── Prompt parsing ─────────────────────────────────────────────────────────

const PILL_TOPICS: Record<string, string> = {
  Galatasaray: "galatasaray",
  "AI Tools": "ai tools",
  Football: "football",
  Career: "career",
  Music: "music",
  Fashion: "streetwear",
};

const LESS_MARKERS = ["less ", "no ", "without ", "fewer ", "daha az ", "-"];
const FILLER =
  /\b(i want|i'd like|more of|more|please|content|stuff|daha fazla|istiyorum)\b/gi;

function parsePrompt(prompt: string, pills: string[]) {
  const topics: string[] = [];
  const unwanted: string[] = [];

  const segments = prompt
    .toLowerCase()
    .split(/[,;.\n]|\band\b|\bve\b/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const raw of segments) {
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
    pills.includes("No Politics") ||
    unwanted.some((t) => /politic|siyaset|gündem/.test(t));

  return { topics: topics.slice(0, 5), unwanted: unwanted.slice(0, 6), wantsNoPolitics };
}

// ── Training plan & mute keywords ──────────────────────────────────────────

const POLITICS_MUTES = ["politics", "siyaset", "gündem", "election"];

function buildTrainingPlan(topic: string, mutes: string[]): DayPlanItem[] {
  return [
    { day: 1, title: "Follow the good stuff", description: `Open the Follow links and follow 5–10 quality sources about ${topic}.` },
    { day: 2, title: "Search & save", description: `Run the exact searches in this pack — watch fully and save what you like.` },
    { day: 3, title: "Mute the noise", description: `Mute or avoid: ${mutes.slice(0, 4).join(", ")}.` },
    { day: 4, title: "Go niche", description: "Engage with smaller creators you found, not only viral posts." },
    { day: 5, title: "Join & subscribe", description: "Join the communities and newsletters — quality off-feed feeds your on-feed." },
    { day: 6, title: "Clean house", description: "Unfollow 5 low-quality sources and hit “Not interested” on junk." },
    { day: 7, title: "Review & repeat", description: "Check what changed, then repeat the searches for 2–3 days to lock it in." },
  ];
}

// ── Section assembly ───────────────────────────────────────────────────────

const SECTION_CAPS: Record<SectionKey, number> = { follow: 6, watch: 6, join: 5, search: 8 };

function toSection(results: DiscoveryResult[], topics: string[], cap: number) {
  return dedupeByUrl(results)
    .sort((a, b) => scoreResult(b, topics) - scoreResult(a, topics))
    .slice(0, cap);
}

// ── Main generator ─────────────────────────────────────────────────────────

export async function generateFeedPack(input: FeedPackInput): Promise<FeedPackResult> {
  const parsed = parsePrompt(input.prompt, input.pills);
  const topics = parsed.topics.length > 0 ? parsed.topics : ["your interests"];
  const intel = analyzeTopics(topics);
  const t = intel.mainTopic;

  // 1) Curated real destinations (network-validated, guard applies).
  const curated: DiscoveryResult[] = matchCurated(topics).map((s, i) => ({
    ...s,
    isDirectLink: true,
    id: `curated-${i}-${s.title.toLowerCase().replace(/\W+/g, "-")}`,
  }));

  // 2) Live search results, when a provider is configured (none yet).
  // Raw hits are classified by extractDirectLinks — only recognizable
  // profile/channel/video/community/site URLs survive.
  let searched: DiscoveryResult[] = [];
  if (searchProvider) {
    const settled = await Promise.allSettled(
      intel.searchQueries.slice(0, 4).map((query) => searchProvider!(query)),
    );
    searched = extractDirectLinks(
      settled.flatMap((r) => (r.status === "fulfilled" ? r.value : [])),
    );
  }

  // Validate + guard everything that claims to be a real destination.
  const realLinks = await validateResults(guardResults([...curated, ...searched]));

  // 3) Search actions — always real platform search pages.
  const queries = intel.searchQueries;
  const q2 = queries[1] ?? t;

  // Follow: DIRECT LINKS ONLY — real accounts, channels, sites, newsletters.
  // Discovery/search links are never allowed here; they live in Explore More.
  const follow = toSection(
    realLinks.filter(
      (r) =>
        r.isDirectLink &&
        ["website", "newsletter", "account", "channel"].includes(r.type),
    ),
    topics,
    SECTION_CAPS.follow,
  );

  const watch = toSection(
    [
      searchAction("youtube", queries[0] ?? t, "Full watches are YouTube's strongest signal — pick 2–3 videos and finish them."),
      searchAction("youtube", q2),
      searchAction(
        "youtube",
        `${t} shorts`,
        "Short-form counts too — like a few Shorts to sync your mobile feed.",
        `Best “${t}” Shorts`,
      ),
      youtubeChannelSearch(t),
      ...(intel.platforms.includes("spotify") ? [searchAction("spotify", t)] : []),
      ...realLinks.filter((r) => ["video", "channel"].includes(r.type)),
    ],
    topics,
    SECTION_CAPS.watch,
  );

  const join = toSection(
    [
      redditCommunitySearch(t),
      searchAction("newsletter", t, "One good newsletter keeps the topic flowing even while your feed relearns."),
      ...realLinks.filter((r) => r.type === "community"),
    ],
    topics,
    SECTION_CAPS.join,
  );

  const search = toSection(
    [
      searchAction("x", t, "Follow 3–5 accounts here that post analysis, not outrage."),
      searchAction("instagram", t, "Follow 2–3 pages, then save a few posts — Explore updates fast."),
      tiktokCreatorSearch(t),
      searchAction("tiktok", t, "Watch a few results fully — your For You page updates within days."),
      searchAction(
        "web",
        `${t} official site`,
        "The official source anchors your feed — everything else builds on it.",
        `Find the official ${t} site`,
      ),
      searchAction(
        "web",
        `best ${t} creators to follow`,
        undefined,
        `Discover top “${t}” creators`,
      ),
      searchAction("reddit", q2),
      ...(queries[3] ? [searchAction("web", queries[3])] : []),
    ],
    topics,
    SECTION_CAPS.search,
  );

  // Guard once more on the final assembly (belt and braces — it's cheap).
  const followFinal = guardResults(follow);
  let joinFinal = guardResults(join);

  // Lead with real links: if Follow is thin, promote the strongest direct
  // community/source links up so the pack's top section is never empty
  // whenever we actually have real destinations for the topic.
  if (followFinal.length < 3) {
    const promoted = joinFinal
      .filter((r) => r.isDirectLink)
      .slice(0, 3 - followFinal.length);
    if (promoted.length > 0) {
      followFinal.push(...promoted);
      joinFinal = joinFinal.filter((r) => !promoted.includes(r));
    }
  }

  const sections: Record<SectionKey, DiscoveryResult[]> = {
    follow: followFinal,
    watch: guardResults(watch),
    join: joinFinal,
    search: guardResults(search),
  };

  const all = Object.values(sections).flat();
  const verifiedLinksCount = all.filter((r) => r.confidence !== "search_action").length;
  const searchActionsCount = all.length - verifiedLinksCount;

  const muteKeywords = Array.from(
    new Set([
      ...parsed.unwanted.filter((u) => !/politic|siyaset/.test(u)),
      ...(parsed.wantsNoPolitics ? POLITICS_MUTES : []),
      ...intel.muteHints,
    ]),
  ).slice(0, 8);

  const summary =
    input.uiLang === "tr"
      ? `İşte “${t}” Feed Paketin — en iyi başlangıç noktaları, üreticiler, topluluklar ve keşif rotaları. Daha az gürültü, daha çok sinyal. Akışın akıllanmak üzere. 🧠`
      : `Here's your “${t}” Feed Pack — best starting points, creators, communities, and discovery paths to train your algorithm. Less noise, more signal. Good rabbit holes only. 🧠`;

  return {
    input,
    topics,
    unwantedTopics: parsed.unwanted,
    summary,
    sections,
    muteKeywords,
    trainingPlan: buildTrainingPlan(t, muteKeywords),
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
