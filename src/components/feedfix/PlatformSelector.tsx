"use client";

import { PlatformIcon } from "@/components/feedfix/PlatformIcon";
import { PLATFORM_LABELS } from "@/lib/platform";
import { translations } from "@/lib/i18n";
import type { TrainablePlatform, UiLang } from "@/types";

const TRAINABLE_PLATFORMS: TrainablePlatform[] = ["x", "instagram", "youtube", "tiktok"];

export function PlatformSelector({
  selected,
  onToggle,
  lang,
}: {
  selected: TrainablePlatform[];
  onToggle: (platform: TrainablePlatform) => void;
  lang: UiLang;
}) {
  const t = translations[lang];

  return (
    <div className="flex flex-col items-center gap-2.5">
      <p className="text-xs font-medium text-muted-foreground">
        {t.platformSelectorLabel}{" "}
        {selected.length === 0 ? (
          <span className="text-muted-foreground/70">{t.platformAllHint}</span>
        ) : null}
      </p>
      <div role="group" aria-label={t.platformSelectorLabel} className="flex flex-wrap justify-center gap-2">
        {TRAINABLE_PLATFORMS.map((platform) => {
          const isActive = selected.includes(platform);
          return (
            <button
              key={platform}
              type="button"
              onClick={() => onToggle(platform)}
              aria-pressed={isActive}
              className={
                isActive
                  ? "inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-md shadow-aqua/25 transition-transform hover:scale-105"
                  : "inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-aqua/60 hover:text-foreground hover:shadow-md hover:shadow-aqua/20"
              }
            >
              <PlatformIcon platform={platform} className="size-4" branded={!isActive} />
              {PLATFORM_LABELS[platform]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
