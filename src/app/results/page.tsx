import type { Metadata } from "next";
import { DetoxResult } from "@/components/feedfix/DetoxResult";
import { decodeFeedPackInput, generateFeedPack } from "@/lib/generateFeedPack";
import { samplePacks } from "@/data/samplePacks";

export const metadata: Metadata = {
  title: "Your Feed Education Pack — Feed Detox",
  description:
    "Creators, links, communities, searches and mute keywords to train your timeline.",
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data } = await searchParams;
  // Fall back to the Galatasaray sample pack when opened without input.
  const input =
    (data ? decodeFeedPackInput(data) : null) ?? samplePacks[0].input;
  const result = await generateFeedPack(input);

  return <DetoxResult result={result} />;
}
