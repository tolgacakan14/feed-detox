import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  Leaf,
  ShoppingBag,
  Sparkle,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { samplePacks } from "@/data/samplePacks";
import { encodeFeedPackInput } from "@/lib/generateFeedPack";
import { Badge } from "@/components/ui/badge";

const PACK_ICON: Record<string, LucideIcon> = {
  galatasaray: Trophy,
  "ai-career": Sparkle,
  "no-politics": Leaf,
  music: Headphones,
  streetwear: ShoppingBag,
};

export function SamplePacks({ limit }: { limit?: number }) {
  const packs = limit ? samplePacks.slice(0, limit) : samplePacks;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packs.map((pack) => {
        const Icon = PACK_ICON[pack.id] ?? Sparkle;
        return (
        <Link
          key={pack.id}
          href={`/results?data=${encodeFeedPackInput(pack.input)}`}
          className="group flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/[0.08] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-aqua/10 hover:ring-aqua/40"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-tealbrand to-aqua text-white shadow-sm">
            <Icon className="size-5" />
          </span>
          <h3 className="font-heading text-base font-semibold">{pack.title}</h3>
          <p className="text-sm text-muted-foreground">{pack.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {pack.input.pills.map((pill) => (
              <Badge key={pill} variant="secondary" className="text-xs">
                {pill}
              </Badge>
            ))}
          </div>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-tealbrand dark:text-limepunch">
            Open this pack
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        );
      })}
    </div>
  );
}
