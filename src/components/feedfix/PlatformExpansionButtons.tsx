import Link from "next/link";
import { Plus } from "lucide-react";
import { PlatformIcon } from "@/components/feedfix/PlatformIcon";
import { PLATFORM_LABELS } from "@/lib/platform";
import { encodeFeedPackInput } from "@/lib/generateFeedPack";
import { translations } from "@/lib/i18n";
import type { FeedPackInput, TrainablePlatform } from "@/types";

const ALL_TRAINABLE: TrainablePlatform[] = ["x", "instagram", "youtube", "tiktok"];

/**
 * Optional expansion actions under the main results: one elegant pill per
 * UNSELECTED platform. Clicking regenerates the same topic with that
 * platform added to the selection — pure query-state via the encoded
 * /results URL, no persistence. Renders nothing when all four platforms
 * are already selected. Deliberately styled as a secondary action card
 * (dashed border, muted) so it never competes with the result sections.
 */
export function PlatformExpansionButtons({ input }: { input: FeedPackInput }) {
  const t = translations[input.uiLang];
  const selected =
    input.selectedPlatforms && input.selectedPlatforms.length > 0
      ? input.selectedPlatforms
      : ALL_TRAINABLE;
  const unselected = ALL_TRAINABLE.filter((p) => !selected.includes(p));
  if (unselected.length === 0) return null;

  return (
    <section className="fade-up rounded-2xl border border-dashed border-border bg-muted/20 p-5">
      <h2 className="text-sm font-semibold text-muted-foreground">{t.alsoBuildTitle}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {unselected.map((p) => (
          <Link
            key={p}
            href={`/results?data=${encodeFeedPackInput({
              ...input,
              selectedPlatforms: [...selected, p],
            })}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-aqua/60 hover:text-foreground hover:shadow-md hover:shadow-aqua/20"
          >
            <PlatformIcon platform={p} className="size-4" branded />
            {t.forPlatformLabel.replace("{p}", PLATFORM_LABELS[p])}
            <Plus className="size-3.5 opacity-60" />
          </Link>
        ))}
      </div>
    </section>
  );
}
