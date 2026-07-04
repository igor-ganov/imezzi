import { parseCountdown } from '../arrivals/parse-countdown.ts';
import type { FleetSighting } from './types.ts';

/**
 * Seconds until this sighting's vehicle reaches its stop, as of
 * `nowSeconds`: the fetched countdown melts as wall-clock time
 * passes, which is what animates the fleet between sweeps.
 */
export const effectiveCountdown = (
  sighting: FleetSighting,
  nowSeconds: number,
): number =>
  Math.max(
    parseCountdown(sighting.row.countdown, sighting.fetchedAtSeconds) -
      Math.max(nowSeconds - sighting.fetchedAtSeconds, 0),
    0,
  );
