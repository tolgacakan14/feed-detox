import type { MetadataRoute } from "next";

const SITE_URL = "https://feed-detox.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /api is not a page — nothing there is meant to be indexed, and a
        // generated /results?data=… link encodes a specific person's prompt,
        // not canonical content search engines should crawl/index.
        disallow: ["/api/", "/results"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
