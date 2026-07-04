import { bearingAt } from '../geo/bearing-at.ts';
import type { Placement } from './place-at-moment.ts';
import type { Road } from './road-of.ts';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Walk the road between two projected stops. The bearing is capped
 * at the segment boundary: past a terminus the polyline doubles
 * back, and peeking one vertex further flipped the arrow toward the
 * return pass.
 */
export const placeOnRoad = (
  road: Road,
  segment: number,
  fraction: number,
  fallback: readonly [number, number],
): Placement => {
  const segmentEnd = road.indices[segment + 1] ?? road.indices[segment] ?? 0;
  const index = Math.round(
    lerp(road.indices[segment] ?? 0, segmentEnd, fraction),
  );
  return {
    point: road.path[index] ?? fallback,
    bearing: bearingAt(road.path, index, segmentEnd),
  };
};
