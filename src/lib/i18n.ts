import type { SectionKey, UiLang } from "@/types";

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
  // How it works
  howTitle: string;
  steps: [string, string, string, string, string, string]; // title/desc ×3
  howEyebrow: string;
  // Result
  resultTitle: string;
  directFallbackNote: string;
  sections: Record<SectionKey, { name: string; purpose: string }>;
  openLabel: string; // footer "Open" button — same for every card, every section
  muteTitle: string;
  planTitle: string;
  another: string;
  // Explainer (positioning)
  explainer: string;
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
    howEyebrow: "How it works",
    howTitle: "Three steps to a smarter feed",
    steps: [
      "Tell Feed Detox what you want your feed to learn.",
      "Choose any topic — a creator, a team, a scene, a craft.",
      "Get direct creators, content, communities and signals.",
      "Real profiles and sources, grouped by what they do for your feed.",
      "Follow, watch, save and mute to train your algorithm.",
      "Your engagement is the signal. We just point it at better sources.",
    ],
    resultTitle: "Your Feed Pack is ready.",
    directFallbackNote:
      "Feed Detox prioritizes direct accounts, creators and content on each platform — search links appear as Discovery only when direct coverage is thin.",
    sections: {
      x: { name: "X / Twitter", purpose: "Clean your timeline with better accounts and threads." },
      instagram: { name: "Instagram", purpose: "Tune Reels and Explore with stronger creators." },
      tiktok: { name: "TikTok", purpose: "Train your For You page with better short-form signals." },
      youtube: { name: "YouTube / Shorts", purpose: "Improve recommendations with channels, videos and Shorts." },
      more: { name: "Supporting Sources", purpose: "Useful extra resources, but secondary to social feed training." },
      discovery: { name: "More discovery paths", purpose: "Real in-app searches for platforms where direct coverage is still thin." },
    },
    openLabel: "Open",
    muteTitle: "Mute keywords",
    planTitle: "7-day timeline training plan",
    another: "Build another Feed Pack",
    explainer:
      "Feed Detox works by improving the signals you give your platforms. Follow better creators, watch higher-quality content, save useful posts, and mute low-value topics.",
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
    howEyebrow: "Nasıl çalışır",
    howTitle: "Daha akıllı bir feed için üç adım",
    steps: [
      "Feed Detox’a feed’inin ne öğrenmesini istediğini yaz.",
      "İstediğin konuyu seç — bir creator, bir takım, bir sahne.",
      "Direkt creator, content, community ve signal önerileri al.",
      "Gerçek profile’lar ve source’lar, feed’ine kattıklarına göre gruplanmış.",
      "Follow, watch, save ve mute ederek algorithm’ini eğit.",
      "Etkileşimin signal’dır. Biz onu daha iyi source’lara yönlendiririz.",
    ],
    resultTitle: "Feed Pack’in hazır.",
    directFallbackNote:
      "Feed Detox her platformda önce direct account ve creator önerir — search link’leri sadece direct kaynak azsa Discovery olarak görünür.",
    sections: {
      x: { name: "X / Twitter", purpose: "Daha iyi account ve thread’lerle timeline’ını temizle." },
      instagram: { name: "Instagram", purpose: "Daha güçlü creator’larla Reels ve Explore’unu iyileştir." },
      tiktok: { name: "TikTok", purpose: "Daha iyi short-form signal’larla For You’nu eğit." },
      youtube: { name: "YouTube / Shorts", purpose: "Channel, video ve Shorts’larla önerilerini iyileştir." },
      more: { name: "Supporting source’lar", purpose: "Faydalı ekstra kaynaklar — social feed training’e göre ikincil." },
      discovery: { name: "Daha fazla discovery path", purpose: "Direct kaynak az olan platformlar için gerçek in-app aramalar." },
    },
    openLabel: "Aç",
    muteTitle: "Mute edilecek keyword’ler",
    planTitle: "7 günlük algorithm training plan",
    another: "Yeni Feed Pack oluştur",
    explainer:
      "Feed Detox, platformlara verdiğin signal’ları iyileştirerek çalışır. Daha iyi creator’ları takip et, kaliteli content’leri izle/kaydet ve düşük değerli keyword’leri mute et.",
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
  search_action: "Discovery",
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
