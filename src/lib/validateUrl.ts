import type { DiscoveryResult, Platform } from "@/types";

/**
 * URL Validation Module.
 *
 * 1. Structural checks run on EVERY result (sync, free).
 * 2. Network checks run server-side on curated/api destination links only
 *    (search URLs on known domains don't need a fetch). Results are cached
 *    in-memory. Platforms that block bots fail open — the item is kept
 *    because it came from a trusted source; hard 404/410 rejects it.
 */

const PLATFORM_DOMAINS: Record<Platform, string[]> = {
  x: ["x.com", "twitter.com"],
  instagram: ["instagram.com"],
  tiktok: ["tiktok.com"],
  youtube: ["youtube.com", "youtu.be"],
  reddit: ["reddit.com"],
  newsletter: ["substack.com"],
  spotify: ["open.spotify.com", "spotify.com"],
  web: [], // any https domain
};

const PLACEHOLDER_PATTERNS = /demo-|example\.com|placeholder|your-|\{|\}|<|>/i;

/** Sync structural validation — cheap, runs on everything. */
export function isStructurallyValid(result: DiscoveryResult): boolean {
  let parsed: URL;
  try {
    parsed = new URL(result.url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (PLACEHOLDER_PATTERNS.test(result.url)) return false;

  const domains = PLATFORM_DOMAINS[result.platform];
  if (domains.length > 0) {
    const host = parsed.hostname.replace(/^www\./, "");
    if (!domains.some((d) => host === d || host.endsWith(`.${d}`))) return false;
  }
  return true;
}

// ── Network check (server-side, cached) ────────────────────────────────────

const cache = new Map<string, boolean>(); // url → keep?

async function checkUrl(url: string): Promise<boolean> {
  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  let keep = true; // fail open for trusted sources
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (FeedDetox link check)" },
      signal: AbortSignal.timeout(3500),
    });
    // Only hard "gone" statuses reject; 403/429/5xx mean "blocked us", not "fake".
    keep = res.status !== 404 && res.status !== 410;
  } catch {
    keep = true; // network error/timeout — keep, source is trusted
  }
  cache.set(url, keep);
  return keep;
}

/**
 * Async-validate destination links (curated/api results that point at a real
 * page). Search actions skip the network check. Invalid items are removed,
 * never blocking the whole pack.
 */
export async function validateResults(
  results: DiscoveryResult[],
): Promise<DiscoveryResult[]> {
  const checks = await Promise.allSettled(
    results.map(async (r) => {
      if (!isStructurallyValid(r)) return null;
      if (r.confidence === "search_action") return r; // known-good search page
      return (await checkUrl(r.url)) ? r : null;
    }),
  );
  return checks
    .map((c) => (c.status === "fulfilled" ? c.value : null))
    .filter((r): r is DiscoveryResult => r !== null);
}
