import Link from "next/link";
import { ArrowUpRight, CalendarDays, Compass, VolumeX } from "lucide-react";
import { PlatformIcon } from "@/components/feedfix/PlatformIcon";
import { LangSync } from "@/components/feedfix/LangSync";
import { PlatformExpansionButtons } from "@/components/feedfix/PlatformExpansionButtons";
import { PLATFORM_SHORT_LABELS } from "@/lib/platform";
import {
  FIELD_LABEL,
  FRESHNESS_BADGE,
  SECTION_ORDER,
  TYPE_BADGE,
  translations,
} from "@/lib/i18n";
import type {
  DiscoveryResult,
  FeedPackResult,
  NoiseRisk,
  Platform,
  SectionKey,
  TrainablePlatform,
} from "@/types";

/** The 4 primary sections map straight to a real platform icon/brand tile;
 * "more" (secondary sources) gets a plain compass, deliberately less bold. */
const SECTION_PLATFORM: Partial<Record<SectionKey, Platform>> = {
  x: "x",
  instagram: "instagram",
  tiktok: "tiktok",
  youtube: "youtube",
};

const SECTION_ACCENT: Record<SectionKey, string> = {
  x: "from-neutral-900 to-neutral-700",
  instagram: "from-fuchsia-600 via-pink-500 to-orange-400",
  tiktok: "from-cyan-500 to-rose-600",
  youtube: "from-red-600 to-red-500",
  more: "from-muted-foreground/50 to-muted-foreground/30",
  discovery: "from-muted-foreground/50 to-muted-foreground/30",
};

// Noise risk: Low = calm/reliable, Medium = neutral/mixed, High = caution.
const NOISE_RISK_STYLE: Record<NoiseRisk, string> = {
  Low: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  Medium: "bg-tangerine/12 text-tangerine",
  High: "bg-coral/12 text-coral",
};

function DetailChip({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tone ?? "bg-foreground/[0.06] text-muted-foreground"}`}
    >
      <span className="opacity-70">{label}: </span>
      {value}
    </span>
  );
}

function ResultCard({
  result,
  openLabel,
  compact,
}: {
  result: DiscoveryResult;
  openLabel: string;
  /** Secondary sections (e.g. "more") render smaller so they stay secondary. */
  compact?: boolean;
}) {
  return (
    <article
      className={`signal-card group flex flex-col gap-3 rounded-2xl bg-card ring-1 ring-foreground/[0.08] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-aqua/10 hover:ring-aqua/40 ${compact ? "p-3.5 pt-4.5" : "p-5 pt-6"}`}
    >
      {/* Top row: platform + type (direct vs Discovery is communicated by the type badge itself) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <PlatformIcon platform={result.platform} className="size-4" branded />
          {PLATFORM_SHORT_LABELS[result.platform]}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-tealbrand/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-tealdeep dark:text-aqua">
            {result.platform === "tiktok" && result.type === "video"
              ? "TikTok"
              : TYPE_BADGE[result.type]}
          </span>
        </div>
      </div>

      {/* 5-slot structure label — verified wording only with real metrics */}
      {result.slotLabel ? (
        <p className="-mb-1 -mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-gradient">
          {result.slotLabel}
          {result.viewCount !== undefined && result.popularitySignal?.includes("views") ? (
            <span className="ml-1.5 font-semibold normal-case tracking-normal text-muted-foreground">
              · {result.popularitySignal.replace(" (YouTube API)", "")}
            </span>
          ) : null}
        </p>
      ) : null}

      {/* Main: title + what it is + why it matters */}
      <div>
        <h3 className="font-heading text-base font-semibold leading-tight">
          {result.creatorName ?? result.title}
        </h3>
        {result.handle ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{result.handle}</p>
        ) : null}
      </div>

      {result.shortDescription ? (
        <p className="text-sm leading-6 text-muted-foreground">{result.shortDescription}</p>
      ) : null}

      <p className="text-xs leading-5 text-muted-foreground/90">
        <span className="font-semibold text-foreground/70">{FIELD_LABEL.whyItMatters}: </span>
        {result.whyItMatters}
      </p>

      {/* Details: best action, noise risk, niche level, freshness */}
      <div className="flex flex-wrap items-center gap-1.5">
        {result.bestAction ? (
          <span className="rounded-full bg-brand-gradient px-2.5 py-1 text-[11px] font-semibold text-white">
            {result.bestAction.label}
          </span>
        ) : null}
        {result.noiseRisk ? (
          <DetailChip label={FIELD_LABEL.noiseRisk} value={result.noiseRisk} tone={NOISE_RISK_STYLE[result.noiseRisk]} />
        ) : null}
        {result.nicheLevel ? <DetailChip label={FIELD_LABEL.nicheLevel} value={result.nicheLevel} /> : null}
        {result.freshness ? (
          <DetailChip label={FIELD_LABEL.freshness} value={FRESHNESS_BADGE[result.freshness]} />
        ) : null}
      </div>
      {result.bestAction ? (
        <p className="-mt-1 text-xs leading-5 text-muted-foreground/80">{result.bestAction.description}</p>
      ) : null}

      {/* Footer: Open button */}
      <div className="mt-auto flex justify-end pt-1">
        <Link
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-aqua/25 transition-all group-hover:shadow-md group-hover:shadow-aqua/30"
        >
          {openLabel}
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function DetoxResult({ result }: { result: FeedPackResult }) {
  const lang = result.input.uiLang;
  const t = translations[lang];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <LangSync lang={lang} />
      {/* Header panel */}
      <header className="fade-up glass-card rounded-3xl p-6 shadow-lg shadow-aqua/5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tealbrand dark:text-aqua">
          Feed Detox
        </p>
        <h1 className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {t.resultTitle}
        </h1>
        <p className="mt-2 max-w-2xl text-balance text-muted-foreground">
          {result.summary}
        </p>
        <p className="mt-4 border-t border-foreground/10 pt-3 text-xs leading-5 text-muted-foreground/80">
          {t.directFallbackNote}
        </p>
      </header>

      {/* Sections */}
      <div className="flex flex-col gap-10">
        {SECTION_ORDER.map((key, i) => {
          const items = result.sections[key];
          if (items.length === 0) return null;
          const sectionPlatform = SECTION_PLATFORM[key];
          const isSecondary = key === "more" || key === "discovery";
          const trainingActions = sectionPlatform
            ? t.platformActions[sectionPlatform as TrainablePlatform]
            : undefined;
          return (
            <section
              key={key}
              className="fade-up"
              style={{ animationDelay: `${0.06 * i}s` }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${SECTION_ACCENT[key]} ${isSecondary ? "size-6" : "size-8"}`}
                >
                  {sectionPlatform ? (
                    <PlatformIcon platform={sectionPlatform} className={isSecondary ? "size-3.5" : "size-4"} />
                  ) : (
                    <Compass className="size-3.5" />
                  )}
                </span>
                <div>
                  <h2
                    className={
                      isSecondary
                        ? "text-sm font-semibold text-muted-foreground"
                        : "font-heading text-lg font-bold leading-tight"
                    }
                  >
                    {t.sections[key].name}
                  </h2>
                  {!isSecondary ? (
                    <p className="text-xs text-muted-foreground">{t.sections[key].purpose}</p>
                  ) : null}
                </div>
              </div>
              {trainingActions ? (
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 pl-[calc(2rem+0.625rem)] text-xs text-muted-foreground/80">
                  {trainingActions.map((action) => (
                    <li key={action} className="flex items-center gap-1.5">
                      <span className="size-1 shrink-0 rounded-full bg-tealbrand dark:bg-limepunch" />
                      {action}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className={`mt-4 grid gap-4 ${isSecondary ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                {items.map((item) => (
                  <ResultCard
                    key={item.id}
                    result={item}
                    openLabel={t.openLabel}
                    compact={isSecondary}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Optional expansion: build the same pack for unselected platforms */}
        <PlatformExpansionButtons input={result.input} />

        {/* Mute keywords */}
        {result.muteKeywords.length > 0 ? (
          <section className="fade-up">
            <h2 className="flex items-center gap-2.5 font-heading text-lg font-bold">
              <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-tealdeep to-slate-700 text-white shadow-sm">
                <VolumeX className="size-4" />
              </span>
              {t.muteTitle}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {result.muteKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-foreground/[0.06] px-3 py-1 text-sm font-medium text-muted-foreground line-through decoration-coral/50"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {/* 7-day plan */}
        <section className="fade-up">
          <h2 className="flex items-center gap-2.5 font-heading text-lg font-bold">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-limepunch to-emerald-500 text-white shadow-sm">
              <CalendarDays className="size-4" />
            </span>
            {t.planTitle}
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {result.trainingPlan.map((day) => (
              <li
                key={day.day}
                className="flex gap-3.5 rounded-2xl bg-card p-4 ring-1 ring-foreground/[0.08]"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                  {day.day}
                </span>
                <div>
                  <p className="text-sm font-semibold">{day.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {day.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="pt-2 text-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-gradient px-6 text-sm font-semibold text-white shadow-lg shadow-aqua/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-aqua/30"
          >
            {t.another}
          </Link>
        </div>
      </div>
    </div>
  );
}
