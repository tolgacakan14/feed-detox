// Core domain types for Feed Detox.
// Framework-agnostic so the same shapes can later back an AI search API,
// a verified-creator database, or real platform APIs without changing consumers.

export type Platform =
  | "x"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "reddit"
  | "newsletter"
  | "spotify"
  | "web";

export type UiLang = "en" | "tr";

/** The 4 platforms Feed Detox trains directly — the platform-selection UI
 * only ever offers these, regardless of the broader Platform union above. */
export type TrainablePlatform = "x" | "instagram" | "tiktok" | "youtube";

/** Where a link came from. Every displayed URL MUST have one of these. */
export type SourceOrigin = "api" | "web_search" | "curated" | "generated_search_url";

/**
 * verified      — from an API/web-search result or an official curated URL
 * likely        — curated by us, real but not officially confirmed
 * search_action — a real platform search URL (never a profile)
 */
export type Confidence = "verified" | "likely" | "search_action";

export type DiscoveryType =
  | "creator"
  | "account" // legacy alias for creator (X/IG/TikTok profile)
  | "channel" // YouTube channel — displayed as Creator
  | "video"
  | "short" // YouTube Short
  | "reel" // Instagram Reel (or /p/ post)
  | "post" // X post/thread (status URL)
  | "community"
  | "newsletter"
  | "website"
  | "article"
  | "search_action"; // a platform search page — labelled "Discovery"

/** Curated demo signal metadata (structured now so real-time ranking can
 * plug in later). These labels are sample/demo values, not live engagement. */
export type Popularity = "global" | "niche" | "emerging";
export type Freshness = "evergreen" | "active_recently" | "trending";
export type EngagementLabel =
  | "High engagement"
  | "Popular"
  | "Rising"
  | "Editor pick"
  | "Niche quality";
export type ItemLang = "en" | "tr" | "mixed";

/** Verified Feed Pack quality signals — inferred conservatively from source
 * type/platform/confidence (see lib/discovery inferBestAction/inferNoiseRisk/
 * inferNicheLevel), never invented per-item metrics like follower counts. */
export type NoiseRisk = "Low" | "Medium" | "High";
export type NicheLevel = "Mainstream" | "Balanced" | "Niche";
export type BestActionLabel =
  | "Follow"
  | "Watch"
  | "Save"
  | "Join"
  | "Read"
  | "Subscribe"
  | "Explore"
  | "Bookmark"
  | "Add to List"
  | "Mute"
  | "Avoid";
export interface BestAction {
  label: BestActionLabel;
  description: string;
}

/**
 * A single recommendation. The anti-hallucination guard rejects any result
 * whose url/source/confidence combination breaks the rules (see lib/discovery).
 * Rich fields (creatorName…isDemo) are present on curated demo signals and
 * absent on generated search fallbacks. bestAction/noiseRisk/nicheLevel are
 * optional on raw data but always populated by finalizeFeedPackItem before a
 * FeedPackResult is returned to the API/UI.
 */
export interface DiscoveryResult {
  id: string;
  title: string;
  url: string;
  platform: Platform;
  type: DiscoveryType;
  source: SourceOrigin;
  confidence: Confidence;
  /** true only for actual profiles/channels/videos/communities/websites;
   * false for discovery/search pages. */
  isDirectLink: boolean;
  whyItMatters: string; // short, useful explanation of the source's value
  snippet?: string;
  rawQuery?: string; // the search query behind a search_action
  bestAction?: BestAction;
  noiseRisk?: NoiseRisk;
  nicheLevel?: NicheLevel;
  /** Honest, non-numeric popularity evidence, e.g. "High-ranking search
   * result", "Appears across multiple social searches", "YouTube API result".
   * Never a fake follower/view count. */
  popularitySignal?: string;
  /** Why this item ranks where it does, e.g. "Direct short-form content
   * result for Instagram feed training". */
  rankingReason?: string;
  /** Internal: 0-based rank in the search results it came from (ranking input). */
  searchRank?: number;
  // ── Curated demo signal metadata (optional) ──
  creatorName?: string;
  handle?: string;
  category?: string;
  itemLanguage?: ItemLang;
  popularity?: Popularity;
  freshness?: Freshness;
  engagementLabel?: EngagementLabel;
  shortDescription?: string;
  isDemo?: boolean;
}

export interface FeedPackInput {
  prompt: string; // free text: "Galatasaray, less transfer drama"
  pills: string[]; // selected quick pills, by label
  uiLang: UiLang; // language chosen on the first screen
  /** Platforms the user wants recommendations for. Empty/undefined means
   * "no explicit choice" — the generator then defaults to all four. */
  selectedPlatforms?: TrainablePlatform[];
}

export interface DayPlanItem {
  day: number;
  title: string;
  description: string;
}

/**
 * Platform-first Feed Pack structure. Feed Detox's core job is training the
 * algorithms of these four apps — everything else (Reddit, websites,
 * newsletters) is secondary and lives in "more", capped small so it never
 * dominates the pack.
 */
export type SectionKey =
  | "x" // X / Twitter — clean the timeline (DIRECT links only)
  | "instagram" // Instagram — improve Reels & Explore (DIRECT links only)
  | "tiktok" // TikTok — improve For You / Discover (DIRECT links only)
  | "youtube" // YouTube — improve Shorts & recommendations (DIRECT links only)
  | "more" // secondary: Reddit, websites, newsletters
  | "discovery"; // last-resort: real platform search paths, never primary

/** Self-describing platform group for API consumers (title/purpose embedded,
 * localized to the request's uiLang). Mirrors `sections` — same items. */
export interface PlatformSection {
  title: string;
  purpose: string;
  items: DiscoveryResult[];
}

export interface FeedPackResult {
  input: FeedPackInput;
  topics: string[];
  unwantedTopics: string[];
  /** Bot summary line; explains the search-action fallback when relevant. */
  summary: string;
  sections: Record<SectionKey, DiscoveryResult[]>;
  /** Platform-first named view of the same data: x, instagram, tiktok,
   * youtube, supportingSources, moreDiscoveryPaths. */
  platformSections: Record<string, PlatformSection>;
  muteKeywords: string[];
  trainingPlan: DayPlanItem[];
  metadata: {
    verifiedLinksCount: number; // verified + likely (real destinations)
    searchActionsCount: number;
    sourcesUsed: SourceOrigin[];
  };
  generatedAt: string; // ISO timestamp
}

export interface SamplePack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  input: FeedPackInput;
}

export interface EmailCaptureData {
  name?: string;
  email: string;
  feedGoal?: string;
  source: string;
}
