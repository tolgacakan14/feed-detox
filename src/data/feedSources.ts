import type {
  DiscoveryResult,
  DiscoveryType,
  EngagementLabel,
  Freshness,
  ItemLang,
  Platform,
  Popularity,
} from "@/types";

/**
 * Curated DEMO signal database.
 *
 * Every URL here is a REAL, well-known, stable destination (official brand
 * accounts, famous channels, large subreddits, established sites) — nothing
 * is invented. The popularity / freshness / engagement fields are curated
 * DEMO labels (sample signals), NOT live metrics. The UI marks these as
 * "Demo signal" and the structure is built so real-time search/API ranking
 * can replace matchFeedSources() later without touching consumers.
 */

interface Demo {
  platform: Platform;
  type: DiscoveryType;
  title: string;
  creatorName?: string;
  handle?: string;
  url: string;
  category: string;
  language: ItemLang;
  popularity: Popularity;
  freshness: Freshness;
  engagement: EngagementLabel;
  tags: string[];
  desc: string;
  reason: string;
  official?: boolean;
}

const DEMO: Demo[] = [
  // ── Galatasaray (TR) ──────────────────────────────────────────────
  {
    platform: "x", type: "creator", title: "Galatasaray SK",
    creatorName: "Galatasaray", handle: "@GalatasaraySK",
    url: "https://x.com/GalatasaraySK", category: "Galatasaray", language: "tr",
    popularity: "global", freshness: "evergreen", engagement: "High engagement",
    tags: ["galatasaray", "futbol", "football"],
    desc: "Official club account — matchday, squad and transfer news first-hand.",
    reason: "Following the official account anchors your feed on real club news, not rumor pages.",
    official: true,
  },
  {
    platform: "instagram", type: "creator", title: "Galatasaray on Instagram",
    creatorName: "Galatasaray", handle: "@galatasaray",
    url: "https://www.instagram.com/galatasaray", category: "Galatasaray", language: "tr",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["galatasaray", "futbol", "football"],
    desc: "Official Instagram — matchday visuals and behind-the-scenes.",
    reason: "Saving official posts teaches Explore to surface real club content over meme pages.",
    official: true,
  },
  {
    platform: "web", type: "website", title: "Galatasaray — Official Site",
    url: "https://www.galatasaray.org", category: "Galatasaray", language: "tr",
    popularity: "niche", freshness: "evergreen", engagement: "Editor pick",
    tags: ["galatasaray", "futbol", "football"],
    desc: "The cleanest source for official statements — zero rumor noise.",
    reason: "Clicking the official source trains your browser and feed toward primary info.",
    official: true,
  },
  {
    platform: "web", type: "website", title: "Galatasaray on Transfermarkt",
    url: "https://www.transfermarkt.com/galatasaray/startseite/verein/141",
    category: "Galatasaray", language: "mixed",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["galatasaray", "futbol", "football", "transfer"],
    desc: "Real squad values and verified transfer data — fact-check rumors here.",
    reason: "Reading real data recalibrates which transfer content you engage with.",
  },
  {
    platform: "reddit", type: "community", title: "r/Galatasaray",
    url: "https://www.reddit.com/r/galatasaray", category: "Galatasaray", language: "mixed",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["galatasaray", "futbol", "football"],
    desc: "English + Turkish fan community with match threads.",
    reason: "Joining keeps the topic alive in your history across every platform.",
  },

  // ── Football analysis (EN/mixed) ──────────────────────────────────
  {
    platform: "youtube", type: "video", title: "Tifo Football",
    creatorName: "Tifo Football", handle: "@tifofootball",
    url: "https://www.youtube.com/@tifofootball", category: "Football analysis", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["football", "futbol", "soccer", "tactics", "analysis", "galatasaray", "premier league"],
    desc: "Animated tactical breakdowns — the calm, smart end of football content.",
    reason: "Full watches on analysis pull your YouTube home away from transfer bait.",
  },
  {
    platform: "x", type: "creator", title: "OptaJoe",
    creatorName: "Opta", handle: "@OptaJoe",
    url: "https://x.com/OptaJoe", category: "Football analysis", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "High engagement",
    tags: ["football", "futbol", "soccer", "stats", "analysis", "galatasaray"],
    desc: "Football's most-quoted stats account — facts, not hot takes.",
    reason: "Engaging with data accounts crowds drama out of your timeline.",
  },
  {
    platform: "web", type: "website", title: "StatsBomb",
    url: "https://statsbomb.com", category: "Football analysis", language: "en",
    popularity: "niche", freshness: "trending", engagement: "Niche quality",
    tags: ["football", "futbol", "soccer", "data", "analysis", "tactics", "galatasaray"],
    desc: "Data-driven football analysis used by real clubs.",
    reason: "Deep analytical reads sharpen the searches you run elsewhere.",
  },
  {
    platform: "web", type: "article", title: "The Coaches' Voice",
    url: "https://www.coachesvoice.com", category: "Football analysis", language: "en",
    popularity: "niche", freshness: "active_recently", engagement: "Editor pick",
    tags: ["football", "futbol", "soccer", "tactics", "analysis", "galatasaray"],
    desc: "Coaches and players explain the game in their own words.",
    reason: "Long-form tactical reads teach your feed you want depth, not clips.",
  },
  {
    platform: "reddit", type: "community", title: "r/soccer",
    url: "https://www.reddit.com/r/soccer", category: "Football analysis", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["football", "futbol", "soccer", "galatasaray", "premier league"],
    desc: "The largest football community — upvoted analysis beats feed rumors.",
    reason: "Community browsing feeds the search history behind your other apps.",
  },

  // ── AI tools (EN) ─────────────────────────────────────────────────
  {
    platform: "youtube", type: "video", title: "Two Minute Papers",
    creatorName: "Two Minute Papers", handle: "@TwoMinutePapers",
    url: "https://www.youtube.com/@TwoMinutePapers", category: "AI tools", language: "en",
    popularity: "global", freshness: "trending", engagement: "Popular",
    tags: ["ai", "ai tools", "yapay zeka", "machine learning", "tech", "english content"],
    desc: "Short, visual explainers of the latest AI research.",
    reason: "Finishing these videos rewires YouTube toward real AI, not hype.",
  },
  {
    platform: "web", type: "website", title: "Hugging Face",
    url: "https://huggingface.co", category: "AI tools", language: "en",
    popularity: "niche", freshness: "trending", engagement: "Niche quality",
    tags: ["ai", "ai tools", "yapay zeka", "machine learning", "llm"],
    desc: "Where real AI models live — browse trending models, not screenshots of them.",
    reason: "Browsing real tools recalibrates your feed toward substance.",
  },
  {
    platform: "web", type: "website", title: "Product Hunt — AI",
    url: "https://www.producthunt.com/categories/artificial-intelligence",
    category: "AI tools", language: "en",
    popularity: "global", freshness: "active_recently", engagement: "Rising",
    tags: ["ai", "ai tools", "yapay zeka", "startup", "saas"],
    desc: "Daily launches of real AI tools you can actually try.",
    reason: "Following launches replaces thread hype with things that ship.",
  },
  {
    platform: "newsletter", type: "newsletter", title: "Ben's Bites",
    url: "https://bensbites.com", category: "AI tools", language: "en",
    popularity: "niche", freshness: "active_recently", engagement: "Editor pick",
    tags: ["ai", "ai tools", "yapay zeka", "newsletter"],
    desc: "A daily AI newsletter that keeps the signal flowing off-feed.",
    reason: "Newsletters keep quality input coming while your feed relearns.",
  },
  {
    platform: "reddit", type: "community", title: "r/MachineLearning",
    url: "https://www.reddit.com/r/MachineLearning", category: "AI tools", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["ai", "ai tools", "yapay zeka", "machine learning", "data science"],
    desc: "Research-grade AI discussion — trains you to spot slop instantly.",
    reason: "Skeptical community threads make your feed harder to fool.",
  },

  // ── Music discovery (EN) ──────────────────────────────────────────
  {
    platform: "youtube", type: "video", title: "NPR Music (Tiny Desk)",
    creatorName: "NPR Music", handle: "@nprmusic",
    url: "https://www.youtube.com/@nprmusic", category: "Music discovery", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["music", "müzik", "indie", "discovery", "live", "english content"],
    desc: "Tiny Desk and beyond — human-curated live sessions.",
    reason: "Watching full sessions pulls autoplay off the mainstream loop.",
  },
  {
    platform: "web", type: "website", title: "Bandcamp",
    url: "https://bandcamp.com", category: "Music discovery", language: "en",
    popularity: "niche", freshness: "active_recently", engagement: "Niche quality",
    tags: ["music", "müzik", "indie", "underground", "deep house", "discovery"],
    desc: "Browsing here surfaces artists the algorithm hasn't flattened yet.",
    reason: "Buying/streaming from here trains recommendations off the charts.",
  },
  {
    platform: "reddit", type: "community", title: "r/listentothis",
    url: "https://www.reddit.com/r/listentothis", category: "Music discovery", language: "en",
    popularity: "niche", freshness: "trending", engagement: "Rising",
    tags: ["music", "müzik", "indie", "underground", "discovery"],
    desc: "Fresh under-the-radar tracks, community-upvoted.",
    reason: "Fresh community picks are better input than autoplay.",
  },

  // ── Fashion / streetwear (EN) ─────────────────────────────────────
  {
    platform: "instagram", type: "creator", title: "Hypebeast",
    creatorName: "Hypebeast", handle: "@hypebeast",
    url: "https://www.instagram.com/hypebeast", category: "Fashion & streetwear", language: "en",
    popularity: "global", freshness: "trending", engagement: "Popular",
    tags: ["fashion", "moda", "streetwear", "sneaker", "style"],
    desc: "Release news straight from the source instead of repost pages.",
    reason: "Following the source teaches Explore your real taste level.",
    official: true,
  },
  {
    platform: "reddit", type: "community", title: "r/streetwear",
    url: "https://www.reddit.com/r/streetwear", category: "Fashion & streetwear", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["fashion", "moda", "streetwear", "sneaker", "style"],
    desc: "Real fits with honest feedback — sharpens what you save.",
    reason: "Critique threads teach you what to save, the strongest Explore signal.",
  },

  // ── No-politics clean feed (EN) ───────────────────────────────────
  {
    platform: "youtube", type: "video", title: "Kurzgesagt",
    creatorName: "Kurzgesagt – In a Nutshell", handle: "@kurzgesagt",
    url: "https://www.youtube.com/@kurzgesagt", category: "No-politics clean feed", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["no politics", "siyasetsiz", "calm", "science", "clean feed", "english content"],
    desc: "Calm, beautiful science explainers — the antidote to rage bait.",
    reason: "Long calm watches teach YouTube to stop recommending outrage.",
  },
  {
    platform: "reddit", type: "community", title: "r/UpliftingNews",
    url: "https://www.reddit.com/r/UpliftingNews", category: "No-politics clean feed", language: "en",
    popularity: "global", freshness: "active_recently", engagement: "Rising",
    tags: ["no politics", "siyasetsiz", "calm", "good news", "clean feed"],
    desc: "Verified good news, strictly moderated for tone.",
    reason: "Positive engagement flips your feed's tone within a week.",
  },

  // ── Turkish content (TR) ──────────────────────────────────────────
  {
    platform: "youtube", type: "video", title: "Barış Özcan",
    creatorName: "Barış Özcan", handle: "@BarisOzcan",
    url: "https://www.youtube.com/@BarisOzcan", category: "Turkish content", language: "tr",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["türkçe", "turkish", "tech", "design", "creator"],
    desc: "One of Turkey's most-watched creators — design, tech and ideas.",
    reason: "Quality Turkish content teaches your feed you want depth in TR too.",
  },
  {
    platform: "web", type: "website", title: "Webrazzi",
    url: "https://webrazzi.com", category: "Turkish content", language: "tr",
    popularity: "niche", freshness: "active_recently", engagement: "Editor pick",
    tags: ["türkçe", "turkish", "tech", "startup", "girişim"],
    desc: "Turkey's leading tech and startup source.",
    reason: "Reading local tech sources rebalances your feed toward real signal.",
  },
  {
    platform: "youtube", type: "video", title: "Ruhi Çenet",
    creatorName: "Ruhi Çenet", handle: "@RuhiCenet",
    url: "https://www.youtube.com/@RuhiCenet", category: "Turkish content", language: "tr",
    popularity: "global", freshness: "trending", engagement: "High engagement",
    tags: ["türkçe", "turkish", "travel", "culture"],
    desc: "Turkey's biggest travel and culture creator — curious, upbeat, no drama.",
    reason: "A high-quality Turkish creator crowds out low-effort viral clips.",
  },
  {
    platform: "youtube", type: "video", title: "Fenomen Bilim",
    creatorName: "Fenomen Bilim", handle: "@FenomenBilim",
    url: "https://www.youtube.com/@FenomenBilim", category: "Turkish content", language: "tr",
    popularity: "niche", freshness: "evergreen", engagement: "Popular",
    tags: ["türkçe", "turkish", "science", "bilim"],
    desc: "Turkish-language science explainers, calm and well-produced.",
    reason: "Quality Turkish science content trains your feed toward depth, not clickbait.",
  },
  {
    platform: "web", type: "website", title: "Evrim Ağacı",
    url: "https://evrimagaci.org", category: "Turkish content", language: "tr",
    popularity: "niche", freshness: "evergreen", engagement: "Editor pick",
    tags: ["türkçe", "turkish", "science", "bilim"],
    desc: "Turkey's largest independent science platform.",
    reason: "A primary Turkish source beats translated clickbait science posts.",
  },
  {
    platform: "reddit", type: "community", title: "r/Turkey",
    url: "https://www.reddit.com/r/Turkey", category: "Turkish content", language: "mixed",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["türkçe", "turkish", "community"],
    desc: "The largest English+Turkish community about Turkey.",
    reason: "A moderated community beats algorithmic Turkish content pages.",
  },
  {
    platform: "web", type: "website", title: "Webtekno",
    url: "https://www.webtekno.com", category: "Turkish content", language: "tr",
    popularity: "global", freshness: "active_recently", engagement: "Popular",
    tags: ["türkçe", "turkish", "tech", "culture"],
    desc: "One of Turkey's biggest tech and culture sites.",
    reason: "A real Turkish publication over random forwarded content.",
  },
  {
    platform: "web", type: "website", title: "Ekşi Sözlük",
    url: "https://eksisozluk.com", category: "Turkish content", language: "tr",
    popularity: "global", freshness: "evergreen", engagement: "Niche quality",
    tags: ["türkçe", "turkish", "community", "forum"],
    desc: "Turkey's iconic collaborative dictionary/forum — dry humor, real takes.",
    reason: "A real community forum outlasts algorithmic Turkish feeds.",
  },

  // ── English content (EN, broad quality creators/publications) ─────
  {
    platform: "youtube", type: "video", title: "Veritasium",
    creatorName: "Veritasium", handle: "@veritasium",
    url: "https://www.youtube.com/@veritasium", category: "English content", language: "en",
    popularity: "global", freshness: "trending", engagement: "High engagement",
    tags: ["english content", "science", "education"],
    desc: "One of YouTube's best science channels — rigorous and watchable.",
    reason: "Full watches here teach YouTube you want depth over clickbait.",
  },
  {
    platform: "youtube", type: "video", title: "CGP Grey",
    creatorName: "CGP Grey", handle: "@CGPGrey",
    url: "https://www.youtube.com/@CGPGrey", category: "English content", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["english content", "education", "explainers"],
    desc: "Sharp explainers on how the world actually works.",
    reason: "Dense, well-researched videos raise the bar for what your feed considers watchable.",
  },
  {
    platform: "youtube", type: "video", title: "Wendover Productions",
    creatorName: "Wendover Productions", handle: "@Wendoverproductions",
    url: "https://www.youtube.com/@Wendoverproductions", category: "English content", language: "en",
    popularity: "niche", freshness: "trending", engagement: "Rising",
    tags: ["english content", "economics", "explainers"],
    desc: "Logistics, economics and infrastructure — explained clearly.",
    reason: "Niche but rigorous — the opposite of algorithm-optimized outrage.",
  },
  {
    platform: "web", type: "article", title: "Farnam Street",
    url: "https://fs.blog", category: "English content", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Editor pick",
    tags: ["english content", "thinking", "essays"],
    desc: "Long-form essays on decision-making and mental models.",
    reason: "Slow, deep reads recalibrate what 'good content' means to your feed.",
  },
  {
    platform: "newsletter", type: "newsletter", title: "Every",
    url: "https://every.to", category: "English content", language: "en",
    popularity: "niche", freshness: "active_recently", engagement: "Editor pick",
    tags: ["english content", "tech", "writing"],
    desc: "A bundle of quality newsletters on tech, work and creativity.",
    reason: "Subscribing keeps sharp writing in your loop, off the feed entirely.",
  },
  {
    platform: "youtube", type: "video", title: "TED",
    creatorName: "TED", handle: "@TED",
    url: "https://www.youtube.com/@TED", category: "English content", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "High engagement",
    tags: ["english content", "ideas", "talks"],
    desc: "Ideas worth spreading, across every field.",
    reason: "A broad, reliable anchor for a quality English-language feed.",
  },

  // ── Career (EN) ─────────────────────────────────────────────────────
  {
    platform: "reddit", type: "community", title: "r/cscareerquestions",
    url: "https://www.reddit.com/r/cscareerquestions", category: "Career", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["career", "kariyer", "job", "tech career"],
    desc: "Real interview and career threads from people currently job-hunting.",
    reason: "Community-vetted advice beats generic career influencer content.",
  },
  {
    platform: "reddit", type: "community", title: "r/careerguidance",
    url: "https://www.reddit.com/r/careerguidance", category: "Career", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["career", "kariyer", "job", "advice"],
    desc: "Broad career advice across every industry, not just tech.",
    reason: "Real situations and real answers train your feed toward substance.",
  },
  {
    platform: "web", type: "article", title: "Ask A Manager",
    url: "https://www.askamanager.org", category: "Career", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Editor pick",
    tags: ["career", "kariyer", "job", "workplace"],
    desc: "Sharp, specific workplace advice from a long-running column.",
    reason: "Specific real scenarios beat vague 'hustle' career content.",
  },
  {
    platform: "web", type: "website", title: "The Muse",
    url: "https://www.themuse.com/advice", category: "Career", language: "en",
    popularity: "global", freshness: "active_recently", engagement: "Popular",
    tags: ["career", "kariyer", "job", "advice"],
    desc: "Practical job search and career-growth articles.",
    reason: "A real career resource site beats recycled LinkedIn hustle posts.",
  },
  {
    platform: "web", type: "article", title: "Harvard Business Review — Career",
    url: "https://hbr.org/topic/subject/career-planning", category: "Career", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Editor pick",
    tags: ["career", "kariyer", "leadership", "management"],
    desc: "Research-backed career and management thinking.",
    reason: "Edited, credible analysis crowds out unverified career hot takes.",
  },
  {
    platform: "web", type: "website", title: "Indeed Career Guide",
    url: "https://www.indeed.com/career-advice", category: "Career", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["career", "kariyer", "job", "resume"],
    desc: "Practical, searchable career and resume guidance.",
    reason: "A real reference site for job-search questions instead of ad-driven tips.",
  },
  {
    platform: "web", type: "website", title: "Glassdoor",
    url: "https://www.glassdoor.com", category: "Career", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["career", "kariyer", "job", "salary"],
    desc: "Real company reviews and salary data from employees.",
    reason: "Grounded data beats vague 'day in my life' career content.",
  },
  {
    platform: "reddit", type: "community", title: "r/jobs",
    url: "https://www.reddit.com/r/jobs", category: "Career", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["career", "kariyer", "job"],
    desc: "General job-search discussion across industries.",
    reason: "Direct peer discussion trains your feed toward useful, specific content.",
  },
  {
    platform: "web", type: "website", title: "Levels.fyi",
    url: "https://www.levels.fyi", category: "Career", language: "en",
    popularity: "niche", freshness: "trending", engagement: "Niche quality",
    tags: ["career", "kariyer", "salary", "tech career"],
    desc: "Crowdsourced tech compensation data, leveled by company and role.",
    reason: "Hard data recalibrates your feed away from salary clickbait.",
  },
  {
    platform: "youtube", type: "video", title: "Ali Abdaal",
    creatorName: "Ali Abdaal", handle: "@AliAbdaal",
    url: "https://www.youtube.com/@AliAbdaal", category: "Career", language: "en",
    popularity: "global", freshness: "trending", engagement: "High engagement",
    tags: ["career", "kariyer", "productivity", "verimlilik"],
    desc: "Productivity and career-building content, evidence-leaning.",
    reason: "A high-quality creator here crowds out generic hustle-bro clips.",
  },

  // ── Startup / founder (EN) ─────────────────────────────────────────
  {
    platform: "reddit", type: "community", title: "r/Entrepreneur",
    url: "https://www.reddit.com/r/Entrepreneur", category: "Startup & founder", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["startup", "girişim", "founder", "entrepreneur"],
    desc: "Broad founder discussion — from first sale to scaling.",
    reason: "Real founder threads beat polished highlight-reel startup content.",
  },
  {
    platform: "web", type: "community", title: "Indie Hackers",
    url: "https://www.indiehackers.com", category: "Startup & founder", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["startup", "girişim", "founder", "indie", "bootstrapped"],
    desc: "Bootstrapped founders sharing real revenue and real failures.",
    reason: "Transparent numbers beat vague founder-hustle motivational posts.",
  },
  {
    platform: "web", type: "website", title: "Y Combinator",
    url: "https://www.ycombinator.com", category: "Startup & founder", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "High engagement",
    tags: ["startup", "girişim", "founder", "vc"],
    desc: "Startup school essays and official YC resources.",
    reason: "Primary-source startup advice over secondhand summaries.",
    official: true,
  },
  {
    platform: "youtube", type: "video", title: "Y Combinator (YouTube)",
    creatorName: "Y Combinator", handle: "@ycombinator",
    url: "https://www.youtube.com/@ycombinator", category: "Startup & founder", language: "en",
    popularity: "global", freshness: "trending", engagement: "High engagement",
    tags: ["startup", "girişim", "founder", "vc"],
    desc: "Official YC talks, Startup School lectures and founder interviews.",
    reason: "Official startup education content over recycled 'grindset' clips.",
    official: true,
  },
  {
    platform: "web", type: "article", title: "First Round Review",
    url: "https://review.firstround.com", category: "Startup & founder", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Editor pick",
    tags: ["startup", "girişim", "founder", "vc"],
    desc: "Deep operator interviews from a well-known venture firm.",
    reason: "Long-form operator knowledge beats short hustle-culture clips.",
  },
  {
    platform: "web", type: "article", title: "Paul Graham — Essays",
    url: "https://www.paulgraham.com/articles.html", category: "Startup & founder", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Editor pick",
    tags: ["startup", "girişim", "founder"],
    desc: "The essays that shaped modern startup thinking.",
    reason: "Primary-source ideas outlast recycled startup-tip threads.",
  },
  {
    platform: "newsletter", type: "newsletter", title: "Lenny's Newsletter",
    url: "https://www.lennysnewsletter.com", category: "Startup & founder", language: "en",
    popularity: "global", freshness: "trending", engagement: "High engagement",
    tags: ["startup", "girişim", "founder", "product"],
    desc: "One of the most-read newsletters on product and startup growth.",
    reason: "A single trusted source beats a dozen unverified growth-hack posts.",
  },
  {
    platform: "web", type: "article", title: "Sam Altman — Blog",
    url: "https://blog.samaltman.com", category: "Startup & founder", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Editor pick",
    tags: ["startup", "girişim", "founder"],
    desc: "Direct essays on startups, productivity and how to think.",
    reason: "Primary-source founder writing over secondhand takes.",
  },

  // ── No-politics clean feed (top-up) ────────────────────────────────
  {
    platform: "reddit", type: "community", title: "r/EarthPorn",
    url: "https://www.reddit.com/r/EarthPorn", category: "No-politics clean feed", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["no politics", "siyasetsiz", "calm", "nature", "clean feed"],
    desc: "Landscape photography only — strictly moderated for calm.",
    reason: "A calm visual home base lowers your appetite for outrage elsewhere.",
  },
  {
    platform: "web", type: "website", title: "Colossal",
    url: "https://www.thisiscolossal.com", category: "No-politics clean feed", language: "en",
    popularity: "niche", freshness: "active_recently", engagement: "Editor pick",
    tags: ["no politics", "siyasetsiz", "calm", "art", "clean feed"],
    desc: "Art, design and visual culture — no outrage angle, ever.",
    reason: "Aesthetic, calm content trains your feed away from rage bait.",
  },
  {
    platform: "web", type: "website", title: "The Kid Should See This",
    url: "https://thekidshouldseethis.com", category: "No-politics clean feed", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["no politics", "siyasetsiz", "calm", "education", "clean feed"],
    desc: "Curated educational videos, genuinely calm and interesting.",
    reason: "Wonder-driven content is the opposite of engagement-farmed outrage.",
  },
  {
    platform: "youtube", type: "video", title: "Vsauce",
    creatorName: "Vsauce", handle: "@Vsauce",
    url: "https://www.youtube.com/@Vsauce", category: "No-politics clean feed", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Popular",
    tags: ["no politics", "siyasetsiz", "calm", "science", "clean feed"],
    desc: "Curious, calm deep-dives into science and 'why' questions.",
    reason: "Long curious watches teach YouTube you want wonder, not rage.",
  },
  {
    platform: "web", type: "website", title: "My Modern Met",
    url: "https://mymodernmet.com", category: "No-politics clean feed", language: "en",
    popularity: "global", freshness: "active_recently", engagement: "Rising",
    tags: ["no politics", "siyasetsiz", "calm", "art", "good news", "clean feed"],
    desc: "Uplifting art, design and culture stories.",
    reason: "Positive culture stories crowd out doom-scroll headlines.",
  },
  {
    platform: "web", type: "website", title: "Good News Network",
    url: "https://www.goodnewsnetwork.org", category: "No-politics clean feed", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["no politics", "siyasetsiz", "calm", "good news", "clean feed"],
    desc: "A publication dedicated entirely to verified good news.",
    reason: "Reading verified good news retrains what 'newsworthy' means to your feed.",
  },

  // ── Fashion / streetwear (top-up) ──────────────────────────────────
  {
    platform: "web", type: "website", title: "Highsnobiety",
    url: "https://www.highsnobiety.com", category: "Fashion & streetwear", language: "en",
    popularity: "global", freshness: "trending", engagement: "Popular",
    tags: ["fashion", "moda", "streetwear", "sneaker", "style"],
    desc: "Streetwear and sneaker culture, straight from the source.",
    reason: "A real publication over reposted screenshots of the same drop.",
  },
  {
    platform: "web", type: "website", title: "Complex — Style",
    url: "https://www.complex.com/style", category: "Fashion & streetwear", language: "en",
    popularity: "global", freshness: "trending", engagement: "Popular",
    tags: ["fashion", "moda", "streetwear", "sneaker"],
    desc: "Sneaker and streetwear culture with real release coverage.",
    reason: "Original reporting beats aggregator hype accounts.",
  },
  {
    platform: "reddit", type: "community", title: "r/femalefashionadvice",
    url: "https://www.reddit.com/r/femalefashionadvice", category: "Fashion & streetwear", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["fashion", "moda", "style", "outfit", "streetwear"],
    desc: "Honest fit feedback and outfit breakdowns.",
    reason: "Critique-based community content sharpens your saved-post taste.",
  },
  {
    platform: "web", type: "article", title: "GQ — Style",
    url: "https://www.gq.com/style", category: "Fashion & streetwear", language: "en",
    popularity: "global", freshness: "evergreen", engagement: "Editor pick",
    tags: ["fashion", "moda", "style", "streetwear"],
    desc: "Edited style journalism from a long-running publication.",
    reason: "Edited fashion writing outlasts algorithm-chasing haul content.",
  },

  // ── Music discovery (top-up) ────────────────────────────────────────
  {
    platform: "youtube", type: "video", title: "Rick Beato",
    creatorName: "Rick Beato", handle: "@RickBeato",
    url: "https://www.youtube.com/@RickBeato", category: "Music discovery", language: "en",
    popularity: "global", freshness: "trending", engagement: "High engagement",
    tags: ["music", "müzik", "production", "theory", "discovery"],
    desc: "Deep, technical breakdowns of what makes songs work.",
    reason: "Technical listening trains your ear — and your feed — toward substance.",
  },
  {
    platform: "web", type: "website", title: "Resident Advisor",
    url: "https://ra.co", category: "Music discovery", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["music", "müzik", "deep house", "techno", "electronic", "discovery"],
    desc: "Editorial and listings for electronic music culture.",
    reason: "Scene-specific editorial beats generic playlist recommendations.",
  },
  {
    platform: "web", type: "website", title: "Song Exploder",
    url: "https://songexploder.net", category: "Music discovery", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Editor pick",
    tags: ["music", "müzik", "production", "discovery"],
    desc: "A podcast where artists deconstruct how their songs were made.",
    reason: "Understanding the craft sharpens what you search for next.",
  },
  {
    platform: "reddit", type: "community", title: "r/WeAreTheMusicMakers",
    url: "https://www.reddit.com/r/WeAreTheMusicMakers", category: "Music discovery", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["music", "müzik", "production", "discovery"],
    desc: "Producers and musicians sharing real technique and feedback.",
    reason: "Practitioner discussion beats algorithmic playlist filler.",
  },

  // ── Football analysis (top-up) ──────────────────────────────────────
  {
    platform: "web", type: "website", title: "FBref",
    url: "https://fbref.com", category: "Football analysis", language: "en",
    popularity: "niche", freshness: "evergreen", engagement: "Niche quality",
    tags: ["football", "futbol", "soccer", "data", "analysis", "galatasaray"],
    desc: "Free, deep football statistics for every major league.",
    reason: "Primary data beats secondhand stat claims in your feed.",
  },
  {
    platform: "web", type: "article", title: "The Athletic",
    url: "https://theathletic.com", category: "Football analysis", language: "en",
    popularity: "global", freshness: "trending", engagement: "Editor pick",
    tags: ["football", "futbol", "soccer", "analysis", "tactics", "galatasaray"],
    desc: "Long-form football journalism from beat reporters and analysts.",
    reason: "Edited journalism outlasts unverified transfer-rumor accounts.",
  },

  // ── AI tools (top-up) ────────────────────────────────────────────────
  {
    platform: "youtube", type: "video", title: "Andrej Karpathy",
    creatorName: "Andrej Karpathy", handle: "@AndrejKarpathy",
    url: "https://www.youtube.com/@AndrejKarpathy", category: "AI tools", language: "en",
    popularity: "niche", freshness: "trending", engagement: "High engagement",
    tags: ["ai", "ai tools", "yapay zeka", "machine learning", "education"],
    desc: "Deep, first-principles AI and neural network explainers.",
    reason: "Primary technical content beats AI hype threads by a wide margin.",
  },
  {
    platform: "web", type: "website", title: "Futurepedia",
    url: "https://www.futurepedia.io", category: "AI tools", language: "en",
    popularity: "global", freshness: "trending", engagement: "Rising",
    tags: ["ai", "ai tools", "yapay zeka", "directory"],
    desc: "A searchable directory of real, current AI tools.",
    reason: "A real tool directory beats reposted 'top 10 AI tools' threads.",
  },
  {
    platform: "web", type: "article", title: "OpenAI — Blog",
    url: "https://openai.com/blog", category: "AI tools", language: "en",
    popularity: "global", freshness: "trending", engagement: "High engagement",
    tags: ["ai", "ai tools", "yapay zeka", "llm"],
    desc: "Official announcements and research notes, straight from the source.",
    reason: "Primary-source AI news beats secondhand hype accounts.",
    official: true,
  },
];

/** Match demo signals against user topics via tag inclusion (both ways). */
export function matchFeedSources(topics: string[]): DiscoveryResult[] {
  const wanted = topics.map((t) => t.toLowerCase()).filter((t) => t.length > 1);
  return DEMO.filter((d) =>
    d.tags.some((tag) => wanted.some((w) => w.includes(tag) || tag.includes(w))),
  ).map((d, i) => ({
    id: `demo-${i}-${(d.handle ?? d.title).toLowerCase().replace(/\W+/g, "-")}`,
    title: d.title,
    url: d.url,
    platform: d.platform,
    type: d.type,
    source: "curated" as const,
    confidence: d.official ? ("verified" as const) : ("likely" as const),
    isDirectLink: true,
    isDemo: true,
    whyItMatters: d.reason,
    creatorName: d.creatorName,
    handle: d.handle,
    category: d.category,
    itemLanguage: d.language,
    popularity: d.popularity,
    freshness: d.freshness,
    engagementLabel: d.engagement,
    shortDescription: d.desc,
  }));
}
