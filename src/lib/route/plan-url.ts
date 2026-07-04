import type { Place } from './types.ts';

const BASE = 'https://api.transitous.org/api/v1/plan';

/** Transitous MOTIS plan URL for a door-to-door query (§1). */
export const planUrl = (
  from: Place,
  to: Place,
  numItineraries: number,
): string =>
  `${BASE}?fromPlace=${from.lat},${from.lon}&toPlace=${to.lat},${to.lon}` +
  `&numItineraries=${numItineraries}`;
