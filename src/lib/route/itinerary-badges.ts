import type { Itinerary } from './types.ts';

export interface LineBadge {
  readonly line: string;
  readonly mode: string;
}

/** Ordered transit-line badges of an itinerary (walk legs skipped). */
export const itineraryBadges = (
  itinerary: Itinerary,
): readonly LineBadge[] =>
  itinerary.legs
    .filter((leg) => leg.mode !== 'walk')
    .map((leg) => ({ line: leg.line ?? '?', mode: leg.mode }));
