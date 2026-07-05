import { bearingAt } from '../geo/bearing-at.ts';
import type { Placement } from './place-at-moment.ts';
import type { Road } from './road-of.ts';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Walk the road between two projected stops with CONTINUOUS
 * interpolation between path vertices. Snapping to whole vertices
 * (the previous rounding) quantized motion into stand-then-hop steps
 * the size of a polyline segment — the observed jerkiness even with
 * a perfectly smooth timeline. The bearing is capped at the segment
 * boundary: past a terminus the polyline doubles back, and peeking
 * one vertex further flipped the arrow toward the return pass.
 */
export const placeOnRoad = (
  road: Road,
  segment: number,
  fraction: number,
  fallback: readonly [number, number],
): Placement => {
  const segmentEnd = road.indices[segment + 1] ?? road.indices[segment] ?? 0;
  const exact = lerp(road.indices[segment] ?? 0, segmentEnd, fraction);
  const base = Math.min(Math.floor(exact), Math.max(segmentEnd - 1, 0));
  const t = exact - base;
  const from = road.path[base];
  const to = road.path[Math.min(base + 1, segmentEnd)] ?? from;
  const point: readonly [number, number] = [
    lerp(from?.[0] ?? fallback[0], to?.[0] ?? fallback[0], t),
    lerp(from?.[1] ?? fallback[1], to?.[1] ?? fallback[1], t),
  ];
  return {
    point,
    bearing: bearingAt(road.path, base, segmentEnd),
  };
};
