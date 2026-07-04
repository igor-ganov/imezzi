import { bearingOf } from '../geo/bearing-of.ts';
import { nearestPathIndex } from '../geo/nearest-path-index.ts';
import type { Placement } from './position-on-direction.ts';

type Path = readonly (readonly [number, number])[];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Walk the road polyline: project the bracketing stops onto the
 * path, interpolate between their indices, and take the bearing from
 * the local road segment — vehicles drive on streets, not as the
 * crow flies (live-map US-1).
 */
export const pointAlongPath = (
  path: Path,
  from: readonly [number, number],
  to: readonly [number, number],
  fraction: number,
): Placement => {
  const start = nearestPathIndex(path, from);
  const end = nearestPathIndex(path, to);
  const at = Math.round(lerp(start, end, fraction));
  const step = { true: 1, false: -1 }[`${end >= start}`] ?? 1;
  const point = path[at] ?? from;
  const forward = path[at + step];
  const backward = path[at - step];
  const bearing = {
    true: () => bearingOf(point, forward ?? to),
    false: () => bearingOf(backward ?? from, point),
  }[`${forward !== undefined}`]();
  return { point, bearing };
};
