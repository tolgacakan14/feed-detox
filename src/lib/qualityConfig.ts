/**
 * Central quality thresholds for the result pipeline.
 *
 * Single source of truth so "how good is good enough" lives in one place
 * instead of scattered magic numbers across discovery.ts/generateFeedPack.ts.
 * Not every threshold in the pipeline has been migrated here yet (see the
 * audit notes in the final report) — this covers the ones this pass added
 * or that directly gate "how many results do we show."
 */

/**
 * Minimum scoreResult() value a platform-section item must clear to be
 * eligible for the 5-card slot fill. Below this, an item is noise relative
 * to the topic/mood/platform combination — better to show fewer cards than
 * pad the section with a weak match. Only applied to the 4 primary platform
 * sections (x/instagram/tiktok/youtube); "more" and "discovery" are
 * secondary/fallback buckets by design and aren't quota-padded the same way.
 *
 * Calibration: scoreResult() for a solid, on-topic, mood-aligned direct
 * result typically lands 0.55–0.9; a marginal/borderline item lands
 * 0.3–0.45; anything below ~0.3 is usually a weak topic match or a
 * mood-mismatched item that only survived filterLowQuality's hard relevance
 * floor (0.1) because SOME keyword matched.
 */
export const MIN_RESULT_SCORE = 0.34;

/** The 5-card structure's target size per selected platform — sections may
 * legitimately return fewer when quality is insufficient (never padded). */
export const PLATFORM_SECTION_TARGET = 5;
