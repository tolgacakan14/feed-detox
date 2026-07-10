/**
 * Real social search provider layer.
 *
 * Wires the discovery pipeline to live providers via env vars — no key, no
 * live results (the pack then runs on curated data + honest Discovery paths;
 * it NEVER fabricates results). Any single key immediately upgrades packs
 * to real extracted social links. Server-side only (reads process.env).
 *
 * Supported env vars, in the order they're tried:
 *   YOUTUBE_API_KEY                  — YouTube Data API v3 (direct videos/channels)
 *   TAVILY_API_KEY                   — Tavily web search
 *   SERPAPI_KEY                      — SerpAPI (Google engine)
 *   BING_SEARCH_API_KEY              — Bing Web Search v7
 *   GOOGLE_CSE_API_KEY + GOOGLE_CSE_CX — Google Programmable Search
 *   SEARCH_PROVIDER=mock             — tiny dev fixture to exercise the
 *                                      extraction pipeline without any paid key
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  source: "serpapi" | "tavily" | "bing" | "google_cse" | "youtube_api" | "mock";
}

const TIMEOUT_MS = 6000;

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ── Generic web search providers ───────────────────────────────────────────

type WebProvider = { name: SearchResult["source"]; search: (q: string, limit: number) => Promise<SearchResult[]> };

function tavilyProvider(key: string): WebProvider {
  return {
    name: "tavily",
    search: async (q, limit) => {
      const data = (await fetchJson("https://api.tavily.com/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ api_key: key, query: q, max_results: limit }),
      })) as { results?: { title: string; url: string; content?: string }[] };
      return (data.results ?? []).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
        source: "tavily" as const,
      }));
    },
  };
}

function serpapiProvider(key: string): WebProvider {
  return {
    name: "serpapi",
    search: async (q, limit) => {
      const data = (await fetchJson(
        `https://serpapi.com/search.json?engine=google&num=${limit}&q=${encodeURIComponent(q)}&api_key=${key}`,
      )) as { organic_results?: { title: string; link: string; snippet?: string }[] };
      return (data.organic_results ?? []).map((r) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
        source: "serpapi" as const,
      }));
    },
  };
}

function bingProvider(key: string): WebProvider {
  return {
    name: "bing",
    search: async (q, limit) => {
      const data = (await fetchJson(
        `https://api.bing.microsoft.com/v7.0/search?count=${limit}&q=${encodeURIComponent(q)}`,
        { headers: { "Ocp-Apim-Subscription-Key": key } },
      )) as { webPages?: { value?: { name: string; url: string; snippet?: string }[] } };
      return (data.webPages?.value ?? []).map((r) => ({
        title: r.name,
        url: r.url,
        snippet: r.snippet,
        source: "bing" as const,
      }));
    },
  };
}

function googleCseProvider(key: string, cx: string): WebProvider {
  return {
    name: "google_cse",
    search: async (q, limit) => {
      const data = (await fetchJson(
        `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&num=${Math.min(limit, 10)}&q=${encodeURIComponent(q)}`,
      )) as { items?: { title: string; link: string; snippet?: string }[] };
      return (data.items ?? []).map((r) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
        source: "google_cse" as const,
      }));
    },
  };
}

/** Dev fixture: real, famous, stable URLs so the extraction pipeline can be
 * exercised end-to-end without a paid key. Only active with SEARCH_PROVIDER=mock. */
function mockProvider(): WebProvider {
  const FIXTURES: SearchResult[] = [
    { title: "OpenAI (@OpenAI) on X", url: "https://x.com/OpenAI", source: "mock" },
    { title: "Hugging Face (@huggingface) on X", url: "https://x.com/huggingface", source: "mock" },
    { title: "Marques Brownlee — YouTube", url: "https://www.youtube.com/@mkbhd", source: "mock" },
    { title: "Two Minute Papers — AI paper explainers", url: "https://www.youtube.com/@TwoMinutePapers", source: "mock" },
    { title: "OpenAI on Instagram", url: "https://www.instagram.com/openai/", source: "mock" },
    { title: "ai tools search — should be rejected", url: "https://x.com/search?q=ai%20tools", source: "mock" },
    { title: "login page — should be rejected", url: "https://www.instagram.com/accounts/login/", source: "mock" },
  ];
  return {
    name: "mock",
    search: async (q) =>
      FIXTURES.filter((f) => !q || true).map((f) => ({ ...f })), // topic-agnostic fixture, dev only
  };
}

function getWebProvider(): WebProvider | null {
  const env = process.env;
  if (env.SEARCH_PROVIDER === "mock") return mockProvider();
  if (env.TAVILY_API_KEY) return tavilyProvider(env.TAVILY_API_KEY);
  if (env.SERPAPI_KEY) return serpapiProvider(env.SERPAPI_KEY);
  if (env.BING_SEARCH_API_KEY) return bingProvider(env.BING_SEARCH_API_KEY);
  if (env.GOOGLE_CSE_API_KEY && env.GOOGLE_CSE_CX)
    return googleCseProvider(env.GOOGLE_CSE_API_KEY, env.GOOGLE_CSE_CX);
  return null;
}

// ── YouTube Data API (direct videos/channels, real metadata) ───────────────

async function youtubeSearch(query: string, limit: number): Promise<SearchResult[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  const data = (await fetchJson(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${limit}&type=video,channel&q=${encodeURIComponent(query)}&key=${key}`,
  )) as {
    items?: {
      id: { kind: string; videoId?: string; channelId?: string };
      snippet: { title: string; description?: string; channelTitle?: string };
    }[];
  };
  return (data.items ?? []).flatMap((item) => {
    const url = item.id.videoId
      ? `https://www.youtube.com/watch?v=${item.id.videoId}`
      : item.id.channelId
        ? `https://www.youtube.com/channel/${item.id.channelId}`
        : null;
    if (!url) return [];
    // Prefix the channel name onto the snippet — the ranking layer's topic
    // centrality check reads title+snippet, so a channel that's clearly
    // topic-focused (e.g. "Tifo Football") now counts as a relevance signal
    // even when the video title itself doesn't repeat the topic.
    const snippet = item.snippet.channelTitle
      ? `${item.snippet.channelTitle} — ${item.snippet.description ?? ""}`
      : item.snippet.description;
    return [
      {
        title: item.snippet.title,
        url,
        snippet,
        source: "youtube_api" as const,
      },
    ];
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

export function isLiveSearchConfigured(): boolean {
  return getWebProvider() !== null || Boolean(process.env.YOUTUBE_API_KEY);
}

/**
 * Run one query through the configured provider(s). Platform "youtube"
 * prefers the YouTube Data API (real engagement-backed results) and falls
 * back to web search. Fail-soft: provider errors return [] — the pack then
 * leans on curated data, never fake results.
 */
export async function searchSocial(
  query: string,
  platform: "x" | "instagram" | "tiktok" | "youtube" | "web",
  limit = 8,
): Promise<SearchResult[]> {
  try {
    if (platform === "youtube") {
      const yt = await youtubeSearch(query, limit);
      if (yt.length > 0) return yt;
    }
    const provider = getWebProvider();
    if (!provider) return [];
    return await provider.search(query, limit);
  } catch {
    return []; // fail-soft — never block the pack on a provider hiccup
  }
}
