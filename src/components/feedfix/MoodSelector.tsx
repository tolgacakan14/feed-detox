"use client";

import {
  Compass,
  Crosshair,
  Flame,
  Layers,
  Lightbulb,
  ShieldCheck,
  Smile,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { FEED_MOODS, MOOD_LABELS } from "@/lib/topicUnderstanding";
import { translations } from "@/lib/i18n";
import type { FeedMood, UiLang } from "@/types";

/** Refined abstract icons — premium filter feel, no emojis. */
const MOOD_ICONS: Record<FeedMood, LucideIcon> = {
  comedy: Smile,
  motivation: Flame,
  calm: Waves,
  focus: Crosshair,
  inspiration: Lightbulb,
  deepDive: Layers,
  noDrama: ShieldCheck,
  discovery: Compass,
};

/** Mood pills under the platform selector — one or many selectable. Mood
 * MODIFIES the topic (ranking, filters, explanations); it never replaces it. */
export function MoodSelector({
  selected,
  onToggle,
  lang,
}: {
  selected: FeedMood[];
  onToggle: (mood: FeedMood) => void;
  lang: UiLang;
}) {
  const t = translations[lang];

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground">{t.moodSelectorLabel}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">{t.moodHelper}</p>
      </div>
      <div role="group" aria-label={t.moodSelectorLabel} className="flex flex-wrap justify-center gap-2">
        {FEED_MOODS.map((mood) => {
          const Icon = MOOD_ICONS[mood];
          const isActive = selected.includes(mood);
          return (
            <button
              key={mood}
              type="button"
              onClick={() => onToggle(mood)}
              aria-pressed={isActive}
              className={
                isActive
                  ? "inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background shadow-md transition-transform hover:scale-105"
                  : "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-aqua/60 hover:text-foreground"
              }
            >
              <Icon className="size-3.5" />
              {MOOD_LABELS[mood]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
