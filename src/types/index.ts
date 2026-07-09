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

/** Where a link came from. Every displayed URL MUST have one of these. */
export type SourceOrigin = "api" | "web_search" | "curated" | "generated_search_url";

/**
 * verified      — from an API/web-search result or an official curated URL
 * likely        — curated by us, real but not officially confirmed
 * search_action — a real platform search URL (never a profile)
 */
export type Confidence = "verified" | "likely" | "search_action";

export type DiscoveryType =
  | "account"
  | "channel"
  | "video"
  | "community"
  | "website"
  | "newsletter"
  | "search_action";

/**
 * A single recommendation. The anti-hallucination guard rejects any result
 * whose url/source/confidence combination breaks the rules (see lib/discovery).
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
   * false for discovery/search pages. Follow requires true. */
  isDirectLink: boolean;
  reason: string; // short "why this trains your algorithm"
  snippet?: string;
  rawQuery?: string; // the search query behind a search_action
}

export interface FeedPackInput {
  prompt: string; // free text: "Galatasaray, less transfer drama"
  pills: string[]; // selected quick pills, by label
  uiLang: UiLang; // language chosen on the first screen
}

export interface DayPlanItem {
  day: number;
  title: string;
  description: string;
}

export type SectionKey = "follow" | "watch" | "join" | "search";

export interface FeedPackResult {
  input: FeedPackInput;
  topics: string[];
  unwantedTopics: string[];
  /** Bot summary line; explains the search-action fallback when relevant. */
  summary: string;
  sections: Record<SectionKey, DiscoveryResult[]>;
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
