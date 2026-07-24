import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { DiscoveryResult, Platform } from "@/types";

/**
 * URL Validation Module.
 *
 * 1. Structural checks run on EVERY result (sync, free).
 * 2. Network checks run server-side on curated/api destination links only
 *    (search URLs on known domains don't need a fetch). Results are cached
 *    in-memory. Platforms that block bots fail open — the item is kept
 *    because it came from a trusted source; hard 404/410 rejects it.
 * 3. SSRF hardening: every hop (including redirect targets) must resolve to
 *    a public IP and use https — a compromised or malicious redirect target
 *    pointing at localhost/cloud-metadata/private ranges is rejected before
 *    it's ever fetched, not just the original URL.
 */

const PLATFORM_DOMAINS: Record<Platform, string[]> = {
  x: ["x.com", "twitter.com"],
  instagram: ["instagram.com"],
  tiktok: ["tiktok.com"],
  youtube: ["youtube.com", "youtu.be"],
  reddit: ["reddit.com"],
  newsletter: [], // newsletters live on many domains (substack, beehiiv, own sites)
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

// ── SSRF guard ───────────────────────────────────────────────────────────
// "web"/"newsletter" results (and any redirect target, regardless of
// platform) can point at an arbitrary https hostname — isStructurallyValid
// only checked the scheme and an optional domain allowlist, not what that
// hostname actually resolves to. Block requests to loopback, private,
// link-local (this covers the 169.254.169.254 cloud-metadata address),
// unique-local, and other non-public ranges before every fetch.

function isPrivateOrReservedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true; // malformed — fail closed
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local (cloud metadata lives here)
    if (a === 0) return true; // "this network"
    if (a >= 224) return true; // multicast/reserved/broadcast
    return false;
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true; // loopback / unspecified
    if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true; // link-local fe80::/10
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local fc00::/7
    const v4Mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (v4Mapped) return isPrivateOrReservedIp(v4Mapped[1]);
    return false;
  }
  return true; // not a parseable IP — fail closed
}

/** Resolves the hostname and rejects if it points at a private/reserved
 * address. Fails closed on DNS errors — an unresolvable host is not fetched. */
async function isSafeHost(hostname: string): Promise<boolean> {
  try {
    const { address } = await lookup(hostname);
    return !isPrivateOrReservedIp(address);
  } catch {
    return false;
  }
}

// ── Network check (server-side, cached) ────────────────────────────────────

const cache = new Map<string, boolean>(); // url → keep?

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 3500;

async function checkUrl(url: string): Promise<boolean> {
  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  let keep = true; // fail open for trusted sources on network hiccups
  try {
    let currentUrl = url;
    let hop = 0;
    for (;;) {
      const parsed = new URL(currentUrl);
      if (parsed.protocol !== "https:" || !(await isSafeHost(parsed.hostname))) {
        keep = false;
        break;
      }

      // Manual redirect handling — each hop is re-validated above before
      // being followed, so a redirect can't smuggle us onto a private host.
      const res = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        headers: { "user-agent": "Mozilla/5.0 (FeedDetox link check)" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      // Body is never read (.text()/.json()/etc. are never called) — only
      // the status/headers are inspected, so there's no unbounded-download
      // exposure here to cap separately.

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) break; // redirect with no target — treat as reachable
        if (hop >= MAX_REDIRECTS) {
          keep = false; // too many hops — suspicious, reject rather than loop
          break;
        }
        currentUrl = new URL(location, currentUrl).toString();
        hop += 1;
        continue;
      }

      // Only hard "gone" statuses reject; 403/429/5xx mean "blocked us", not "fake".
      keep = res.status !== 404 && res.status !== 410;
      break;
    }
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
      // Search pages and curated demo signals (real, stable URLs) skip the
      // network check so the showcase always renders; still structurally guarded.
      if (r.confidence === "search_action" || r.isDemo) return r;
      return (await checkUrl(r.url)) ? r : null;
    }),
  );
  return checks
    .map((c) => (c.status === "fulfilled" ? c.value : null))
    .filter((r): r is DiscoveryResult => r !== null);
}
