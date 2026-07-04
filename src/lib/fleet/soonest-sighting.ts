import { effectiveCountdown } from './effective-countdown.ts';
import type { FleetSighting } from './types.ts';

/**
 * The sighting with the smallest melted countdown — the stop the
 * vehicle reaches next (freshest fetch wins ties).
 */
export const soonestSighting = (
  group: readonly FleetSighting[],
  nowSeconds: number,
): FleetSighting => {
  const sooner = (a: FleetSighting, b: FleetSighting): boolean => {
    const [ca, cb] = [
      effectiveCountdown(a, nowSeconds),
      effectiveCountdown(b, nowSeconds),
    ];
    return ca < cb || (ca === cb && a.fetchedAtSeconds >= b.fetchedAtSeconds);
  };
  return group.reduce((a, b) => ({ true: a, false: b })[`${sooner(a, b)}`]);
};
