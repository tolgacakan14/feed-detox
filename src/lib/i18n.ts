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
  safetyNote: string;
  directFallbackNote: string;
  sections: Record<SectionKey, string>;
  ctaBySection: Record<SectionKey, string>;
  muteTitle: string;
  planTitle: string;
  another: string;
  // Explainer (positioning)
  explainer: string;
  // Card labels
  demoTag: string;
}

const SHARED_SECTION_ORDER: SectionKey[] = [
  "creators",
  "content",
  "fresh",
  "niche",
  "communities",
  "fallback",
];

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
    resultTitle: "Your Feed Education Pack is ready.",
    safetyNote:
      "Demo MVP: recommendations are sample signals. Real-time creator/content ranking can be added with search/API integrations.",
    directFallbackNote:
      "Feed Detox prioritizes direct creators, content, channels and communities. Search links are only used as fallback when curated sources are limited.",
    sections: {
      creators: "Top creators to follow",
      content: "Direct content to watch",
      fresh: "Fresh & trending signals",
      niche: "Niche quality sources",
      communities: "Communities & newsletters",
      fallback: "Search fallbacks",
    },
    ctaBySection: {
      creators: "Open creator",
      content: "Watch content",
      fresh: "Open signal",
      niche: "Read source",
      communities: "Join community",
      fallback: "Open search fallback",
    },
    muteTitle: "Mute keywords",
    planTitle: "7-day timeline training plan",
    another: "Build another Feed Pack",
    explainer:
      "Feed Detox works by improving the signals you give your platforms. Follow better creators, watch higher-quality content, save useful posts, and mute low-value topics.",
    demoTag: "Demo signal",
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
    safetyNote:
      "Demo MVP: öneriler şimdilik sample signal’lardır. Real-time creator/content ranking ileride search/API entegrasyonlarıyla eklenebilir.",
    directFallbackNote:
      "Feed Detox önce direct creator, content, channel ve community önerir. Search link’leri sadece curated source azsa fallback olarak kullanılır.",
    sections: {
      creators: "Takip edilecek creator’lar",
      content: "İzlenecek direct content’ler",
      fresh: "Fresh & trending signal’lar",
      niche: "Niche ama kaliteli kaynaklar",
      communities: "Community ve newsletter’lar",
      fallback: "Search fallback’ler",
    },
    ctaBySection: {
      creators: "Creator’ı aç",
      content: "Content’i izle",
      fresh: "Signal’ı aç",
      niche: "Source’u aç",
      communities: "Community’ye katıl",
      fallback: "Search fallback’i aç",
    },
    muteTitle: "Mute edilecek keyword’ler",
    planTitle: "7 günlük algorithm training plan",
    another: "Yeni Feed Pack oluştur",
    explainer:
      "Feed Detox, platformlara verdiğin signal’ları iyileştirerek çalışır. Daha iyi creator’ları takip et, kaliteli content’leri izle/kaydet ve düşük değerli keyword’leri mute et.",
    demoTag: "Demo signal",
  },
};

export const SECTION_ORDER = SHARED_SECTION_ORDER;

/** Card badge labels — kept in English in BOTH languages by product rule. */
export const TYPE_BADGE: Record<string, string> = {
  creator: "Creator",
  account: "Creator",
  channel: "Creator",
  video: "Video",
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
  new: "Fresh",
  trending: "Trending",
};

export const LANG_BADGE: Record<string, string> = {
  en: "English",
  tr: "Turkish",
  mixed: "Global",
};
