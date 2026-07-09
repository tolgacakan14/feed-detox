"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Bot, Sparkles } from "lucide-react";
import { QuickPills } from "@/components/feedfix/QuickPills";
import { encodeFeedPackInput } from "@/lib/generateFeedPack";
import { trackEvent } from "@/lib/analytics";
import type { UiLang } from "@/types";

const COPY: Record<
  UiLang,
  {
    title1: string;
    title2: string;
    subtitle: string;
    altLine: string;
    botLine: string;
    placeholder: string;
    cta: string;
    trySample: string;
    noLogin: string;
  }
> = {
  en: {
    title1: "Educate",
    title2: "your feed.",
    subtitle: "Train your timeline with better signals.",
    altLine: "Keşfetini temizle. Algoritmanı yeniden eğit. 🇹🇷",
    botLine: "Tell me what you want your feed to learn — I know the good corners of the internet. Tourist links out, deep cuts in. ✨",
    placeholder:
      "Galatasaray, AI tools, football analysis, streetwear, indie music…",
    cta: "Generate my Feed Pack",
    trySample: "Try: Galatasaray",
    noLogin: "No login. No API connection. Just better links to train your algorithm.",
  },
  tr: {
    title1: "Keşfetini",
    title2: "eğit.",
    subtitle: "Zaman akışını daha iyi sinyallerle eğit.",
    altLine: "Detox your feed. Train your algorithm. 🌍",
    botLine: "Akışının ne öğrenmesini istediğini söyle — internetin iyi köşelerini bilirim. Turist linkler dışarı, derin keşifler içeri. ✨",
    placeholder:
      "Galatasaray, yapay zeka araçları, taktik analiz, sokak modası, indie müzik…",
    cta: "Feed Paketimi Oluştur",
    trySample: "Dene: Galatasaray",
    noLogin: "Giriş yok. API bağlantısı yok. Sadece algoritmanı eğitecek daha iyi linkler.",
  },
};

export function ChatHero() {
  const router = useRouter();
  const [lang, setLang] = useState<UiLang>("en");
  const [prompt, setPrompt] = useState("");
  const [pills, setPills] = useState<string[]>([]);
  const copy = COPY[lang];

  const canSubmit = prompt.trim().length > 0 || pills.length > 0;

  function submit(overridePrompt?: string) {
    const finalPrompt = (overridePrompt ?? prompt).trim();
    if (!finalPrompt && pills.length === 0) return;
    const input = { prompt: finalPrompt, pills, uiLang: lang };
    trackEvent("generate_pack", input);
    router.push(`/results?data=${encodeFeedPackInput(input)}`);
  }

  return (
    <section id="chat" className="relative overflow-hidden">
      {/* Floating feed-bubble orbs (aquarium ambience) */}
      <div
        aria-hidden
        className="floating-orb -top-24 left-[8%] -z-10 size-72 bg-aqua/30"
      />
      <div
        aria-hidden
        className="floating-orb right-[6%] top-8 -z-10 size-80 bg-limepunch/30 [animation-delay:-3s]"
      />
      <div
        aria-hidden
        className="floating-orb left-[55%] top-64 -z-10 size-44 bg-tangerine/25 [animation-delay:-6s] [animation-duration:13s]"
      />
      <div
        aria-hidden
        className="floating-orb -left-16 top-72 -z-10 size-56 bg-tealbrand/25 [animation-delay:-8s] [animation-duration:16s]"
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-20 sm:pt-16">
        {/* Language select — first thing on the first screen */}
        <div
          role="group"
          aria-label="Language"
          className="flex items-center gap-1 rounded-full border border-border/70 bg-background/70 p-1 shadow-sm backdrop-blur"
        >
          {(["en", "tr"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={
                lang === l
                  ? "rounded-full bg-brand-gradient px-4 py-1.5 text-xs font-bold text-white"
                  : "rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {l === "en" ? "🇬🇧 English" : "🇹🇷 Türkçe"}
            </button>
          ))}
        </div>

        <h1 className="fade-up text-balance font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {copy.title1} <span className="text-gradient">{copy.title2}</span>
        </h1>

        <p className="fade-up max-w-xl text-balance text-lg text-muted-foreground sm:text-xl [animation-delay:0.1s]">
          {copy.subtitle}
        </p>
        <p className="fade-up -mt-3 text-sm font-medium text-tealbrand [animation-delay:0.15s] dark:text-limepunch">
          {copy.altLine}
        </p>

        {/* Chat card wrapped in a slow "feed orbit" ring */}
        <div className="fade-up relative w-full [animation-delay:0.2s]">
          <div
            aria-hidden
            className="animate-slow-spin pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] opacity-60 sm:-inset-10"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(18,175,194,0.35) 40deg, transparent 90deg, rgba(184,227,74,0.35) 160deg, transparent 220deg, rgba(255,122,61,0.3) 300deg, transparent 360deg)",
              filter: "blur(22px)",
            }}
          />
          <div className="glass-card glow-border w-full rounded-3xl p-4 shadow-xl sm:p-5">
          {/* Detox Bot bubble */}
          <div className="mb-4 flex items-start gap-2.5 text-left">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md shadow-aqua/30">
              <Bot className="size-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground/80">Detox Bot</p>
              <p className="mt-1 max-w-md rounded-2xl rounded-tl-sm bg-muted/80 px-3.5 py-2.5 text-sm text-foreground/90">
                {copy.botLine}
              </p>
            </div>
          </div>

          {/* Input */}
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
              placeholder={copy.placeholder}
              aria-label={copy.placeholder}
              className="w-full resize-none rounded-2xl border border-border bg-background/90 p-4 pr-14 text-base shadow-inner outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-aqua/40"
            />
            <button
              type="button"
              onClick={() => submit()}
              disabled={!canSubmit}
              aria-label={copy.cta}
              className="absolute bottom-3.5 right-3 flex size-9 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md shadow-aqua/30 transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            >
              <ArrowUp className="size-4" />
            </button>
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

        <div className="fade-up flex flex-col items-center gap-3 [animation-delay:0.3s] sm:flex-row">
          <button
            type="button"
            onClick={() => submit()}
            disabled={!canSubmit}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-gradient px-7 text-base font-semibold text-white shadow-lg shadow-aqua/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-aqua/35 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <Sparkles className="size-4" />
            {copy.cta}
          </button>
          <button
            type="button"
            onClick={() => submit("Galatasaray")}
            className="rounded-full border border-border bg-background/70 px-5 py-2.5 text-sm font-medium text-muted-foreground backdrop-blur transition-colors hover:border-aqua/60 hover:text-foreground"
          >
            {copy.trySample} 🦁
          </button>
        </div>

        <p className="text-xs text-muted-foreground">{copy.noLogin}</p>
      </div>
    </section>
  );
}
