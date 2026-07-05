import type { VehicleView } from '../vehicles/types.ts';
import type { FleetTarget } from './fleet-target.ts';
import { placeAtMoment } from './place-at-moment.ts';

/**
 * Materialize a target at a displayed moment: coordinates and
 * bearing come from the route geometry, so wherever the moment is
 * (chasing, extrapolating, frozen) the marker sits ON the road.
 */
export const targetView = (
  target: FleetTarget,
  coords: ReadonlyMap<string, readonly [number, number]>,
  moment: number,
): VehicleView => {
  const placed = [target.template]
    .filter((t): t is NonNullable<typeof t> => t !== undefined)
    .map((t) => placeAtMoment(t, coords, moment, target.road))[0];
  return {
    id: target.id,
    label: target.label,
    mode: 'bus',
    lineKey: target.label,
    lon: placed?.point[0] ?? target.anchor[0],
    lat: placed?.point[1] ?? target.anchor[1],
    approximated: false,
    bearing: placed?.bearing,
    ageSeconds: target.ageSeconds,
    dimmed: target.dimmed,
  };
};
