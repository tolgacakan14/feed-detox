import { generateFeedPack } from "@/lib/generateFeedPack";
import type { TrainablePlatform } from "@/types";

const VALID_PLATFORMS = new Set<TrainablePlatform>(["x", "instagram", "tiktok", "youtube"]);

/**
 * POST /api/feedpack  { topic: string, uiLang?: "en" | "tr", selectedPlatforms?: string[] }
 * Returns a structured Feed Pack (same engine the /results page uses).
 * selectedPlatforms filters output to those platforms only; empty/omitted
 * defaults to all four (x, instagram, tiktok, youtube).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  if (!topic) {
    return Response.json({ error: "topic is required" }, { status: 400 });
  }
  const selectedPlatforms: TrainablePlatform[] = Array.isArray(body?.selectedPlatforms)
    ? body.selectedPlatforms.filter(
        (p: unknown): p is TrainablePlatform => typeof p === "string" && VALID_PLATFORMS.has(p as TrainablePlatform),
      )
    : [];
  const result = await generateFeedPack({
    prompt: topic,
    pills: [],
    uiLang: body?.uiLang === "tr" ? "tr" : "en",
    selectedPlatforms,
  });
  return Response.json(result);
}
