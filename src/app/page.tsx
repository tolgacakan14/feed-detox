import Link from "next/link";
import { ChatHero } from "@/components/feedfix/ChatHero";
import { HowItWorks } from "@/components/feedfix/HowItWorks";
import { SamplePacks } from "@/components/feedfix/SamplePacks";
import { EarlyAccess } from "@/components/feedfix/EarlyAccess";

export default function Home() {
  return (
    <>
      <ChatHero />
      <HowItWorks />

      <section id="packs" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="text-gradient text-xs font-bold uppercase tracking-[0.2em]">
            Sample Packs
          </span>
          <h2 className="mt-3 text-balance font-heading text-2xl font-semibold sm:text-3xl">
            Start from a ready-made pack
          </h2>
        </div>
        <div className="mt-10">
          <SamplePacks limit={3} />
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/packs"
            className="text-sm font-semibold text-tealbrand hover:underline dark:text-limepunch"
          >
            See all sample packs →
          </Link>
        </div>
      </section>

      <EarlyAccess />
    </>
  );
}
