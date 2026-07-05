import { parseCountdown } from '../arrivals/parse-countdown.ts';
import type { FleetSighting } from './types.ts';

/**
 * Seconds until this sighting's vehicle reaches its stop, as of
 * `nowSeconds`: the fetched countdown melts as wall-clock time
 * passes. NEGATIVE values are meaningful — the vehicle has passed
 * the stop and keeps travelling (dead reckoning at schedule speed;
 * validated live: re-poll corrections were ±90 s over 93 s, so
 * freezing at the stop was the bug, not the extrapolation).
 */
export const effectiveCountdown = (
  sighting: FleetSighting,
  nowSeconds: number,
): number =>
  parseCountdown(sighting.row.countdown, sighting.fetchedAtSeconds) -
  Math.max(nowSeconds - sighting.fetchedAtSeconds, 0);
