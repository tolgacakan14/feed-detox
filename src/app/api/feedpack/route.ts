import { generateFeedPack } from "@/lib/generateFeedPack";

/**
 * POST /api/feedpack  { topic: string, uiLang?: "en" | "tr" }
 * Returns a structured Feed Pack (same engine the /results page uses).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  if (!topic) {
    return Response.json({ error: "topic is required" }, { status: 400 });
  }
  const result = await generateFeedPack({
    prompt: topic,
    pills: [],
    uiLang: body?.uiLang === "tr" ? "tr" : "en",
  });
  return Response.json(result);
}
