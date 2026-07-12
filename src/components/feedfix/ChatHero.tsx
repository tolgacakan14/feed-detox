"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { QuickPills } from "@/components/feedfix/QuickPills";
import { PlatformSelector } from "@/components/feedfix/PlatformSelector";
import { encodeFeedPackInput } from "@/lib/generateFeedPack";
import { trackEvent } from "@/lib/analytics";
import { translations } from "@/lib/i18n";
import { useLang } from "@/lib/langContext";
import type { TrainablePlatform } from "@/types";

export function ChatHero() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const [prompt, setPrompt] = useState("");
  const [pills, setPills] = useState<string[]>([]);
  // Starts EMPTY on purpose: tapping a platform SELECTS it (selectedPlatforms
  // means "included platforms only"). Empty = no explicit choice = the engine
  // defaults to all four. Pre-selecting all four made the first tap read as
  // an inverted selection — tapping X deselected it and built a pack for
  // every platform EXCEPT X.
  const [selectedPlatforms, setSelectedPlatforms] = useState<TrainablePlatform[]>([]);
  const t = translations[lang];

  const canSubmit = prompt.trim().length > 0 || pills.length > 0;

  function togglePlatform(platform: TrainablePlatform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    );
  }

  function submit(overridePrompt?: string) {
    const finalPrompt = (overridePrompt ?? prompt).trim();
    if (!finalPrompt && pills.length === 0) return;
    const input = { prompt: finalPrompt, pills, uiLang: lang, selectedPlatforms };
    trackEvent("generate_pack", input);
    router.push(`/results?data=${encodeFeedPackInput(input)}`);
  }

  return (
    <section id="chat" className="relative overflow-hidden">
      {/* Ambient feed-bubble orbs */}
      <div aria-hidden className="floating-orb -top-24 left-[8%] -z-10 size-72 bg-aqua/25" />
      <div aria-hidden className="floating-orb right-[6%] top-8 -z-10 size-80 bg-limepunch/25 [animation-delay:-3s]" />
      <div aria-hidden className="floating-orb left-[55%] top-64 -z-10 size-44 bg-tangerine/20 [animation-delay:-6s] [animation-duration:13s]" />
      <div aria-hidden className="floating-orb -left-16 top-72 -z-10 size-56 bg-tealbrand/20 [animation-delay:-8s] [animation-duration:16s]" />

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-24 sm:pt-20">
        {/* Language toggle */}
        <div
          role="group"
          aria-label="Language"
          className="glass-card flex items-center gap-1 rounded-full p-1 text-xs shadow-sm"
        >
          {(["en", "tr"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={
                lang === l
                  ? "rounded-full bg-brand-gradient px-4 py-1.5 font-bold text-white"
                  : "rounded-full px-4 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {l === "en" ? "English" : "Türkçe"}
            </button>
          ))}
        </div>

        <h1 className="fade-up text-balance font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {t.headline1} <span className="text-gradient">{t.headline2}</span>
        </h1>

        <p className="fade-up max-w-xl text-balance text-lg text-muted-foreground sm:text-xl [animation-delay:0.08s]">
          {t.subheadline}
        </p>
        <p className="fade-up -mt-3 text-sm font-medium text-tealbrand [animation-delay:0.12s] dark:text-limepunch">
          {t.microcopy}
        </p>

        {/* Chat card wrapped in a slow signal orbit */}
        <div className="fade-up relative w-full [animation-delay:0.18s]">
          <div
            aria-hidden
            className="animate-slow-spin pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] opacity-50 sm:-inset-10"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(18,175,194,0.32) 40deg, transparent 90deg, rgba(184,227,74,0.32) 160deg, transparent 220deg, rgba(255,122,61,0.26) 300deg, transparent 360deg)",
              filter: "blur(22px)",
            }}
          />
          <div className="glass-card glow-border w-full rounded-3xl p-4 shadow-xl sm:p-5">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={3}
                placeholder={t.placeholder}
                aria-label={t.placeholder}
                className="w-full resize-none rounded-2xl border border-border bg-background/90 p-4 pr-14 text-base shadow-inner outline-none transition-shadow placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-aqua/40"
              />
              <button
                type="button"
                onClick={() => submit()}
                disabled={!canSubmit}
                aria-label={t.generate}
                className="absolute bottom-3.5 right-3 flex size-9 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md shadow-aqua/30 transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>

            <div className="mt-4">
              <PlatformSelector selected={selectedPlatforms} onToggle={togglePlatform} lang={lang} />
            </div>

            <div className="mt-4">
              <QuickPills
                selected={pills}
                onToggle={(pill) =>
                  setPills((prev) =>
                    prev.includes(pill)
                      ? prev.filter((p) => p !== pill)
                      : [...prev, pill],
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="fade-up flex flex-col items-center gap-3 [animation-delay:0.26s] sm:flex-row">
          <button
            type="button"
            onClick={() => submit()}
            disabled={!canSubmit}
            className="inline-flex h-12 items-center rounded-full bg-brand-gradient px-8 text-base font-semibold text-white shadow-lg shadow-aqua/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-aqua/35 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {t.generate}
          </button>
          <button
            type="button"
            onClick={() => submit("Galatasaray")}
            className="rounded-full border border-border bg-background/70 px-5 py-2.5 text-sm font-medium text-muted-foreground backdrop-blur transition-colors hover:border-aqua/60 hover:text-foreground"
          >
            {t.trySample}
          </button>
        </div>

        <p className="max-w-lg text-xs leading-5 text-muted-foreground/80">
          {t.noConnect}
        </p>
      </div>
    </section>
  );
}
