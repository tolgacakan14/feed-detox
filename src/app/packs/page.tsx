import type { Metadata } from "next";
import { SamplePacks } from "@/components/feedfix/SamplePacks";

export const metadata: Metadata = {
  title: "Sample Feed Packs — Feed Detox",
  description:
    "Ready-made Feed Education Packs — Galatasaray, AI & career, no-politics, music discovery, and streetwear.",
};

export default function PacksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-10 text-center">
        <span className="text-gradient text-xs font-bold uppercase tracking-[0.2em]">
          Sample Packs
        </span>
        <h1 className="mt-3 text-balance font-heading text-3xl font-semibold sm:text-4xl">
          Ready-made Feed Packs
        </h1>
        <p className="mx-auto mt-3 max-w-md text-balance text-muted-foreground">
          Not sure where to start? Open one of these to see what Feed Detox builds.
        </p>
      </div>
      <SamplePacks />
    </div>
  );
}
