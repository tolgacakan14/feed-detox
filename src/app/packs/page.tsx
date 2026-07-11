import type { Metadata } from "next";
import { SamplePacks } from "@/components/feedfix/SamplePacks";
import { PacksHeader } from "@/components/feedfix/PacksHeader";

export const metadata: Metadata = {
  title: "Sample Feed Packs — Feed Detox",
  description:
    "Ready-made Feed Education Packs — Galatasaray, AI & career, no-politics, music discovery, and streetwear.",
};

export default function PacksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <PacksHeader />
      <SamplePacks />
    </div>
  );
}
