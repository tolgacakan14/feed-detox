/**
 * Placeholder analytics layer.
 *
 * Swap the body of `trackEvent` for a real analytics SDK call (PostHog,
 * Plausible, Segment, etc.) when ready — every call site already passes a
 * stable event name + payload shape.
 */

export type AnalyticsEvent =
  | "cta_click"
  | "generate_pack"
  | "upgrade_click"
  | "email_submitted"
  | "sample_pack_opened";

export function trackEvent(
  eventName: AnalyticsEvent,
  payload: Record<string, unknown> = {},
): void {
   
  console.log(`[trackEvent] ${eventName}`, payload);
}
