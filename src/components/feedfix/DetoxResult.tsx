import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  PlayCircle,
  Search,
  UserPlus,
  Users,
  VolumeX,
} from "lucide-react";
import { PlatformIcon } from "@/components/feedfix/PlatformIcon";
import { PLATFORM_SHORT_LABELS } from "@/lib/platform";
import { Badge } from "@/components/ui/badge";
import type {
  DiscoveryResult,
  DiscoveryType,
  FeedPackResult,
  SectionKey,
  UiLang,
} from "@/types";

const COPY: Record<
  UiLang,
  {
    ready: string;
    signalsFound: (n: number, topic: string) => string;
    mix: string;
    sections: Record<SectionKey, string>;
    openBySection: Record<SectionKey, string>;
    mute: string;
    plan: string;
    another: string;
    badges: Record<DiscoveryType, string>;
  }
> = {
  en: {
    ready: "Your Feed Pack is ready.",
    signalsFound: (n, topic) => `${n} signals found for “${topic}”`,
    mix: "Mix: global + niche + discovery links",
    sections: {
      follow: "Top Accounts & Sources",
      watch: "Top Videos & Shorts",
      join: "Communities",
      search: "Explore More",
    },
    openBySection: {
      follow: "Follow signal",
      watch: "Watch signal",
      join: "Join signal",
      search: "Search signal",
    },
    mute: "Mute / Avoid",
    plan: "Train your feed — 7 days",
    another: "Build another pack",
    badges: {
      account: "Account",
      channel: "Channel",
      video: "Video",
      community: "Community",
      website: "Source",
      newsletter: "Newsletter",
      search_action: "Discovery",
    },
  },
  tr: {
    ready: "Feed Paketin hazır.",
    signalsFound: (n, topic) => `“${topic}” için ${n} sinyal bulundu`,
    mix: "Karışım: global + niş + keşif linkleri",
    sections: {
      follow: "En İyi Hesaplar ve Kaynaklar",
      watch: "En İyi Videolar ve Shorts",
      join: "Topluluklar",
      search: "Daha Fazla Keşfet",
    },
    openBySection: {
      follow: "Takip sinyali",
      watch: "İzleme sinyali",
      join: "Katılım sinyali",
      search: "Arama sinyali",
    },
    mute: "Sessize al / Kaçın",
    plan: "Akışını eğit — 7 gün",
    another: "Yeni paket oluştur",
    badges: {
      account: "Hesap",
      channel: "Kanal",
      video: "Video",
      community: "Topluluk",
      website: "Kaynak",
      newsletter: "Bülten",
      search_action: "Keşif",
    },
  },
};

const SECTION_META: Record<SectionKey, { icon: typeof UserPlus; gradient: string }> = {
  follow: { icon: UserPlus, gradient: "from-tealbrand to-aqua" },
  watch: { icon: PlayCircle, gradient: "from-coral to-tangerine" },
  join: { icon: Users, gradient: "from-limepunch to-emerald-500" },
  search: { icon: Search, gradient: "from-aqua to-tealdeep" },
};

const SECTION_ORDER: SectionKey[] = ["follow", "watch", "join", "search"];

const BADGE_STYLE: Record<DiscoveryType, string> = {
  account: "border-0 bg-tealbrand/15 text-tealdeep dark:text-aqua",
  channel: "border-0 bg-tealbrand/15 text-tealdeep dark:text-aqua",
  video: "border-0 bg-coral/12 text-coral dark:text-tangerine",
  community: "border-0 bg-limepunch/25 text-accent-foreground dark:text-limepunch",
  website: "border-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  newsletter: "border-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  search_action: "border-0 bg-aqua/15 text-tealbrand dark:text-aqua",
};

function ResultCard({
  result,
  openLabel,
  badgeLabel,
}: {
  result: DiscoveryResult;
  openLabel: string;
  badgeLabel: string;
}) {
  return (
    <div className="signal-card flex flex-col gap-2.5 rounded-2xl bg-card p-4 pt-5 ring-1 ring-foreground/10 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-aqua/15 hover:ring-aqua/50">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm font-semibold leading-5">{result.title}</p>
        <Link
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-aqua/25 transition-opacity hover:opacity-90"
        >
          {openLabel}
          <ArrowUpRight className="size-3" />
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="gap-1.5">
          <PlatformIcon platform={result.platform} className="size-3" branded />
          {PLATFORM_SHORT_LABELS[result.platform]}
        </Badge>
        <Badge className={BADGE_STYLE[result.type]}>{badgeLabel}</Badge>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">{result.reason}</p>
    </div>
  );
}

export function DetoxResult({ result }: { result: FeedPackResult }) {
  const copy = COPY[result.input.uiLang];
  const totalSignals =
    result.metadata.verifiedLinksCount + result.metadata.searchActionsCount;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      {/* User chat bubble */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-3xl rounded-br-md bg-brand-gradient px-5 py-3.5 text-left text-sm font-medium text-white shadow-lg shadow-aqua/20">
          <p>{result.input.prompt || result.topics.join(", ")}</p>
          {result.input.pills.length > 0 ? (
            <p className="mt-1.5 text-xs text-white/80">
              {result.input.pills.map((p) => `#${p.replace(/\s+/g, "")}`).join(" ")}
            </p>
          ) : null}
        </div>
      </div>

      {/* Detox Bot reply */}
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md shadow-aqua/30">
          <Bot className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-foreground/80">Detox Bot</p>
          <div className="fade-up mt-1 rounded-3xl rounded-tl-md bg-muted/70 px-4 py-3 text-sm text-foreground/90 sm:px-5">
            <p className="font-heading text-base font-bold">{copy.ready}</p>
            <p className="mt-1.5">{result.summary}</p>
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-tealbrand dark:text-limepunch">
              <span>
                📡 {copy.signalsFound(totalSignals, result.topics[0] ?? "")}
              </span>
              <span>{copy.mix}</span>
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-8">
            {SECTION_ORDER.map((key, sectionIndex) => {
              const items = result.sections[key];
              if (items.length === 0) return null;
              const meta = SECTION_META[key];
              return (
                <section
                  key={key}
                  className="fade-up"
                  style={{ animationDelay: `${0.1 + sectionIndex * 0.12}s` }}
                >
                  <h2 className="flex items-center gap-2.5 font-heading text-lg font-bold">
                    <span
                      className={`flex size-8 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${meta.gradient}`}
                    >
                      <meta.icon className="size-4" />
                    </span>
                    {copy.sections[key]}
                  </h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {items.map((item) => (
                      <ResultCard
                        key={item.id}
                        result={item}
                        openLabel={copy.openBySection[key]}
                        badgeLabel={copy.badges[item.type]}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Mute keywords */}
            {result.muteKeywords.length > 0 ? (
              <section className="fade-up [animation-delay:0.55s]">
                <h2 className="flex items-center gap-2.5 font-heading text-lg font-bold">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-tealdeep to-slate-800 text-white shadow-md">
                    <VolumeX className="size-4" />
                  </span>
                  {copy.mute}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.muteKeywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-sm">
                      🔇 {keyword}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}

            {/* 7-day plan */}
            <section className="fade-up [animation-delay:0.65s]">
              <h2 className="flex items-center gap-2.5 font-heading text-lg font-bold">
                <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-limepunch to-emerald-500 text-white shadow-md">
                  <CalendarDays className="size-4" />
                </span>
                {copy.plan}
              </h2>
              <ol className="mt-3 flex flex-col gap-2.5">
                {result.trainingPlan.map((day) => (
                  <li
                    key={day.day}
                    className="flex gap-3.5 rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
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

            <div className="text-center">
              <Link
                href="/"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-gradient px-6 text-sm font-semibold text-white shadow-lg shadow-aqua/25 transition-opacity hover:opacity-90"
              >
                {copy.another} ✨
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
