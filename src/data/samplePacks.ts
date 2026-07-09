import type { SamplePack } from "@/types";

export const samplePacks: SamplePack[] = [
  {
    id: "galatasaray",
    title: "Galatasaray Feed",
    description: "Taktik, analiz ve maç günü — transfer dramı yok.",
    emoji: "🦁",
    input: {
      prompt: "Galatasaray, football analysis, less transfer drama",
      pills: ["Galatasaray", "Football", "Turkish"],
      uiLang: "tr",
    },
  },
  {
    id: "ai-career",
    title: "AI & Career Feed",
    description: "Practical AI tools and career growth, no doomscrolling.",
    emoji: "🤖",
    input: {
      prompt: "AI tools, career advice, productivity, less politics and drama",
      pills: ["AI Tools", "Career", "English"],
      uiLang: "en",
    },
  },
  {
    id: "no-politics",
    title: "No Politics Timeline",
    description: "A calm, drama-free feed for people who want a break.",
    emoji: "🧘",
    input: {
      prompt: "good news, nature, slow living, no politics, no outrage",
      pills: ["No Politics", "Global"],
      uiLang: "en",
    },
  },
  {
    id: "music",
    title: "Music Discovery Feed",
    description: "Indie and underground music, curated by humans.",
    emoji: "🎧",
    input: {
      prompt: "indie music, music production, underground artists, less mainstream hype",
      pills: ["Music", "Niche Creators"],
      uiLang: "en",
    },
  },
  {
    id: "streetwear",
    title: "Streetwear Feed",
    description: "Fits, silhouettes and style history — no haul spam.",
    emoji: "👟",
    input: {
      prompt: "streetwear, fashion, outfit ideas, less haul spam",
      pills: ["Fashion", "Global"],
      uiLang: "en",
    },
  },
];
