import type { MetadataRoute } from "next";

const SITE_URL = "https://feed-detox.vercel.app";

/** Only the stable, canonical routes — /results is intentionally excluded
 * (see robots.ts: each link encodes one person's prompt, not indexable
 * canonical content). */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/packs", "/privacy", "/terms", "/support"];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.5,
  }));
}
