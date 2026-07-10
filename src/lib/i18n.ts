import type { SectionKey, TrainablePlatform, UiLang } from "@/types";

/**
 * Lightweight EN/TR dictionary — no external i18n library.
 *
 * Localization rule: Turkish copy uses Turkish sentences but keeps core
 * product/social terms in English (feed, timeline, algorithm, creator,
 * content, signal, Feed Pack, Discovery, community, newsletter, keyword,
 * niche, trending…). No awkward translations ("zaman tüneli", "sinyal", …).
 */

export interface Dict {
  // Hero
  headline1: string;
  headline2: string;
  subheadline: string;
  microcopy: string;
  placeholder: string;
  generate: string;
  trySample: string;
  noConnect: string; // "we don't connect to your accounts" line
  // Platform selection (directly under the topic input)
  platformSelectorLabel: string;
  platformActions: Record<TrainablePlatform, [string, string, string, string]>;
  // How it works
  howTitle: string;
  howSteps: [string, string, string, string];
  howEyebrow: string;
  stepLabel: string; // e.g. "Step" — prefixes the step number
  // Result
  resultTitle: string;
  directFallbackNote: string;
  sections: Record<SectionKey, { name: string; purpose: string }>;
  openLabel: string; // footer "Open" button — same for every card, every section
  muteTitle: string;
  planTitle: string;
  another: string;
  // Platform expansion ("Also build this Feed Pack for:")
  alsoBuildTitle: string;
  forPlatformLabel: string; // "{p}" placeholder, e.g. "For {p}" / "{p} için"
  // Explainer (positioning)
  explainer: string;
  // Header nav
  navHow: string;
  navPacks: string;
  navEarly: string;
  headerCta: string;
  // Footer
  footerTagline: string;
  footerProductCol: string;
  footerMoreCol: string;
  footerLegal: string; // "{y}" placeholder for the year
  // Homepage sections
  packsEyebrow: string;
  packsTitle: string;
  packsSeeAll: string;
  openPack: string;
  // Early access
  earlyTitle: string;
  earlyDesc: string;
  earlyButton: string;
  earlyDone: string;
}

const SHARED_SECTION_ORDER: SectionKey[] = ["x", "instagram", "tiktok", "youtube", "more", "discovery"];

export const translations: Record<UiLang, Dict> = {
  en: {
    headline1: "Detox",
    headline2: "your feed.",
    subheadline: "Educate your timeline with better signals.",
    microcopy: "Train what your algorithm learns next.",
    placeholder:
      "Galatasaray, AI tools, football analysis, streetwear, indie music…",
    generate: "Generate my Feed Pack",
    trySample: "Try Galatasaray",
    noConnect:
      "We don’t connect to your accounts. You stay in control — Feed Detox just gives you better signals to open.",
    platformSelectorLabel: "Choose the platforms you want to train.",
    platformActions: {
      x: [
        "Follow high-signal creators",
        "Bookmark useful threads",
        "Add creators to a private list",
        "Mute noisy keywords",
      ],
      instagram: [
        "Follow selected profiles",
        "Save relevant posts",
        "Watch Reels fully when relevant",
        "Avoid low-value Explore content",
      ],
      youtube: [
        "Subscribe to selected channels",
        "Watch recommended videos",
        "Save useful videos to playlists",
        "Avoid irrelevant recommendations",
      ],
      tiktok: [
        "Follow relevant creators",
        "Watch high-quality videos fully",
        "Save useful videos",
        "Use “Not interested” on low-value content",
      ],
    },
    howEyebrow: "How it works",
    stepLabel: "Step",
    howTitle: "How Feed Detox works",
    howSteps: [
      "Tell Feed Detox what you want your feed to learn.",
      "Choose the platforms you want to train.",
      "Open better creators, content and signals.",
      "Follow, watch, save and mute to train your algorithm.",
    ],
    resultTitle: "Your Feed Pack is ready.",
    directFallbackNote:
      "Feed Detox prioritizes direct accounts, creators and content on each platform — a Search fallback appears at the bottom only when a selected platform has no direct results.",
    sections: {
      x: { name: "X / Twitter", purpose: "Clean your timeline with better accounts and threads." },
      instagram: { name: "Instagram", purpose: "Tune Reels and Explore with stronger creators." },
      tiktok: { name: "TikTok", purpose: "Train your For You page with better short-form signals." },
      youtube: { name: "YouTube / Shorts", purpose: "Improve recommendations with channels, videos and Shorts." },
      more: { name: "Supporting Sources", purpose: "Useful extra resources, but secondary to social feed training." },
      discovery: { name: "Search fallback", purpose: "Real in-app searches — shown only when a selected platform has no direct results." },
    },
    openLabel: "Open",
    muteTitle: "Mute keywords",
    planTitle: "7-day timeline training plan",
    another: "Build another Feed Pack",
    alsoBuildTitle: "Also build this Feed Pack for:",
    forPlatformLabel: "For {p}",
    explainer:
      "Feed Detox works by improving the signals you give your platforms. Follow better creators, watch higher-quality content, save useful posts, and mute low-value topics.",
    navHow: "How it works",
    navPacks: "Sample Packs",
    navEarly: "Early Access",
    headerCta: "Try Feed Detox",
    footerTagline:
      "Feed Detox gives you better creators, content, communities and signals to train your feed — manually, on your terms.",
    footerProductCol: "Product",
    footerMoreCol: "More",
    footerLegal:
      "© {y} Feed Detox. We never connect to, access, or modify your social media accounts — every link opens the real platform in your own browser.",
    packsEyebrow: "Sample Packs",
    packsTitle: "Start from a ready-made pack",
    packsSeeAll: "See all sample packs →",
    openPack: "Open this pack",
    earlyTitle: "Get early access",
    earlyDesc:
      "Real-time creator ranking, verified profiles and weekly Feed Pack refreshes are coming. Be first in line.",
    earlyButton: "Join the list",
    earlyDone: "You’re on the list.",
  },
  tr: {
    headline1: "Feed’ini",
    headline2: "temizle.",
    subheadline: "Timeline’ını daha iyi signal’larla yeniden eğit.",
    microcopy: "Keşfetini temizle. Algorithm’ini yeniden eğit.",
    placeholder:
      "Galatasaray, AI tools, futbol analizi, streetwear, indie müzik…",
    generate: "Feed Pack oluştur",
    trySample: "Galatasaray’ı dene",
    noConnect:
      "Hesaplarına bağlanmıyoruz. Kontrol sende — Feed Detox sana sadece açman için daha iyi signal’lar verir.",
    platformSelectorLabel: "Eğitmek istediğin platformları seç.",
    platformActions: {
      x: [
        "High-signal creator’ları takip et",
        "Faydalı thread’leri bookmark et",
        "Creator’ları private list’e ekle",
        "Gürültülü keyword’leri mute et",
      ],
      instagram: [
        "Seçilen profile’ları takip et",
        "İlgili post’ları save et",
        "Alakalı Reels’leri sonuna kadar izle",
        "Düşük değerli Explore content’lerinden uzak dur",
      ],
      youtube: [
        "Seçilen channel’lara subscribe ol",
        "Önerilen video’ları izle",
        "Faydalı video’ları playlist’e kaydet",
        "Alakasız recommendation’lardan uzak dur",
      ],
      tiktok: [
        "Alakalı creator’ları follow et",
        "Kaliteli video’ları sonuna kadar izle",
        "Faydalı video’ları save et",
        "Düşük değerli content’lerde “Not interested” kullan",
      ],
    },
    howEyebrow: "Nasıl çalışır",
    stepLabel: "Adım",
    howTitle: "Feed Detox nasıl çalışır?",
    howSteps: [
      "Feed Detox’a feed’inin ne öğrenmesini istediğini yaz.",
      "Eğitmek istediğin platformları seç.",
      "Daha iyi creator, content ve signal’ları aç.",
      "Follow, watch, save ve mute ederek algorithm’ini eğit.",
    ],
    resultTitle: "Feed Pack’in hazır.",
    directFallbackNote:
      "Feed Detox her platformda önce direct account ve creator önerir — Search fallback sadece seçili bir platformda hiç direct sonuç yoksa en altta görünür.",
    sections: {
      x: { name: "X / Twitter", purpose: "Daha iyi account ve thread’lerle timeline’ını temizle." },
      instagram: { name: "Instagram", purpose: "Daha güçlü creator’larla Reels ve Explore’unu iyileştir." },
      tiktok: { name: "TikTok", purpose: "Daha iyi short-form signal’larla For You’nu eğit." },
      youtube: { name: "YouTube / Shorts", purpose: "Channel, video ve Shorts’larla önerilerini iyileştir." },
      more: { name: "Supporting source’lar", purpose: "Faydalı ekstra kaynaklar — social feed training’e göre ikincil." },
      discovery: { name: "Search fallback", purpose: "Gerçek in-app aramalar — sadece seçili bir platformda direct sonuç yoksa görünür." },
    },
    openLabel: "Aç",
    muteTitle: "Mute edilecek keyword’ler",
    planTitle: "7 günlük algorithm training plan",
    another: "Yeni Feed Pack oluştur",
    alsoBuildTitle: "Bu Feed Pack’i şunlar için de oluştur:",
    forPlatformLabel: "{p} için",
    explainer:
      "Feed Detox, platformlara verdiğin signal’ları iyileştirerek çalışır. Daha iyi creator’ları takip et, kaliteli content’leri izle/kaydet ve düşük değerli keyword’leri mute et.",
    navHow: "Nasıl çalışır",
    navPacks: "Sample Packs",
    navEarly: "Early Access",
    headerCta: "Feed Detox’u dene",
    footerTagline:
      "Feed Detox, feed’ini eğitmek için daha iyi creator, content, community ve signal’lar verir — manuel olarak, kontrol sende.",
    footerProductCol: "Ürün",
    footerMoreCol: "Daha fazlası",
    footerLegal:
      "© {y} Feed Detox. Sosyal medya hesaplarına asla bağlanmayız, erişmeyiz ve onları değiştirmeyiz — her link gerçek platformu kendi tarayıcında açar.",
    packsEyebrow: "Sample Packs",
    packsTitle: "Hazır bir pack ile başla",
    packsSeeAll: "Tüm sample pack’leri gör →",
    openPack: "Bu pack’i aç",
    earlyTitle: "Early access al",
    earlyDesc:
      "Real-time creator ranking, verified profile’lar ve haftalık Feed Pack yenilemeleri geliyor. İlk sırada ol.",
    earlyButton: "Listeye katıl",
    earlyDone: "Listedesin.",
  },
};

export const SECTION_ORDER = SHARED_SECTION_ORDER;

/** Card badge labels — kept in English in BOTH languages by product rule. */
export const TYPE_BADGE: Record<string, string> = {
  creator: "Creator",
  account: "Creator",
  channel: "Channel",
  video: "Video",
  short: "Shorts",
  reel: "Reel",
  post: "Post",
  community: "Community",
  newsletter: "Newsletter",
  website: "Source",
  article: "Article",
  search_action: "Search fallback",
};

export const POPULARITY_BADGE: Record<string, string> = {
  global: "Global",
  niche: "Niche",
  emerging: "Emerging",
};

export const FRESHNESS_BADGE: Record<string, string> = {
  evergreen: "Evergreen",
  active_recently: "Active recently",
  trending: "Trending",
};

export const LANG_BADGE: Record<string, string> = {
  en: "English",
  tr: "Turkish",
  mixed: "Global",
};

/** Verified Feed Pack field labels — fixed English copy per product rule
 * (matches badge vocabulary above), not translated in Turkish mode. */
export const FIELD_LABEL = {
  whyItMatters: "Why it matters",
  bestAction: "Best action",
  noiseRisk: "Noise risk",
  nicheLevel: "Niche level",
  freshness: "Freshness",
} as const;
