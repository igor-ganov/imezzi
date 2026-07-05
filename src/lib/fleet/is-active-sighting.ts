import { parseCountdown } from '../arrivals/parse-countdown.ts';
import type { FleetSighting } from './types.ts';

/**
 * Anything further out than this is not a real prediction: SIMON
 * clock-time rows wrap past midnight once the vehicle has PASSED the
 * stop (observed live: 120 s → 86400 s on re-poll), and treating
 * them as data teleported buses across town to their route start.
 */
const HORIZON_SECONDS = 2 * 3600;

/** A live, trackable row: real vehicle, prediction still ahead. */
export const isActiveSighting = (sighting: FleetSighting): boolean =>
  !sighting.row.theoretical &&
  sighting.row.vehicle !== '' &&
  parseCountdown(sighting.row.countdown, sighting.fetchedAtSeconds) <=
    HORIZON_SECONDS;
