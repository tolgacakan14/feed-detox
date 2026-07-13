import { generateFeedPack } from "@/lib/generateFeedPack";
import { FEED_MOODS } from "@/lib/topicUnderstanding";
import type { FeedMood, TrainablePlatform } from "@/types";

const VALID_PLATFORMS = new Set<TrainablePlatform>(["x", "instagram", "tiktok", "youtube"]);
const VALID_MOODS = new Set<FeedMood>(FEED_MOODS);

/** Longest topic that still makes sense as a feed-training prompt — anything
 * beyond this is either an accident or abuse, and would flow uncapped into
 * search queries and ranking regexes. */
const MAX_TOPIC_LENGTH = 200;

/**
 * POST /api/feedpack  { topic: string, uiLang?: "en" | "tr", selectedPlatforms?: string[] }
 * Returns a structured Feed Pack (same engine the /results page uses).
 * selectedPlatforms filters output to those platforms only; empty/omitted
 * defaults to all four (x, instagram, tiktok, youtube).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const topic =
    typeof body?.topic === "string"
      ? body.topic.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, MAX_TOPIC_LENGTH)
      : "";
  if (!topic) {
    return Response.json({ error: "topic is required" }, { status: 400 });
  }
  const selectedPlatforms: TrainablePlatform[] = Array.isArray(body?.selectedPlatforms)
    ? body.selectedPlatforms.filter(
        (p: unknown): p is TrainablePlatform => typeof p === "string" && VALID_PLATFORMS.has(p as TrainablePlatform),
      )
    : [];
  const selectedMoods: FeedMood[] = Array.isArray(body?.selectedMoods)
    ? body.selectedMoods.filter(
        (m: unknown): m is FeedMood => typeof m === "string" && VALID_MOODS.has(m as FeedMood),
      )
    : [];
  try {
    const result = await generateFeedPack({
      prompt: topic,
      pills: [],
      uiLang: body?.uiLang === "tr" ? "tr" : "en",
      selectedPlatforms,
      selectedMoods,
    });
    return Response.json(result);
  } catch (err) {
    // Providers are fail-soft, so this is the unexpected path — return a
    // clean JSON error instead of a framework 500 page.
    console.error("feedpack generation failed:", err);
    return Response.json({ error: "generation failed" }, { status: 500 });
  }
}
