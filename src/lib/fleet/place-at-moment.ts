import { bearingOf } from '../geo/bearing-of.ts';
import { placeOnRoad } from './place-on-road.ts';
import type { Road } from './road-of.ts';
import type { BusDirectionTemplate } from './types.ts';

export interface Placement {
  readonly point: readonly [number, number];
  readonly bearing: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Place a vehicle at a moment on its direction's timeline: between
 * the two adjacent stops whose offsets bracket it. On a road the
 * point walks the polyline between the stops' monotonic projections;
 * without one it interpolates the straight chord.
 */
export const placeAtMoment = (
  template: BusDirectionTemplate,
  coords: ReadonlyMap<string, readonly [number, number]>,
  moment: number,
  road?: Road,
): Placement | undefined => {
  const last = template.offsets[template.offsets.length - 1] ?? 0;
  const clamped = Math.min(Math.max(moment, 0), last);
  const found = template.offsets.findIndex(
    (offset, i) =>
      clamped >= offset && clamped <= (template.offsets[i + 1] ?? -1),
  );
  const at = Math.max(found, 0);
  const from = coords.get(template.stops[at] ?? '');
  const to = coords.get(template.stops[at + 1] ?? template.stops[at] ?? '');
  const start = template.offsets[at] ?? 0;
  const end = template.offsets[at + 1] ?? start + 1;
  const fraction = Math.min(
    Math.max((clamped - start) / Math.max(end - start, 1), 0),
    1,
  );
  const strategies: Readonly<Record<string, () => Placement | undefined>> = {
    road: () => placeOnRoad(road ?? { path: [], indices: [] }, at, fraction, from ?? [0, 0]),
    straight: () => ({
      point: [
        lerp(from?.[0] ?? 0, to?.[0] ?? 0, fraction),
        lerp(from?.[1] ?? 0, to?.[1] ?? 0, fraction),
      ],
      bearing: bearingOf(from ?? [0, 0], to ?? [0, 1]),
    }),
    none: () => undefined,
  };
  const usable = from !== undefined && to !== undefined;
  const onRoad = usable && (road?.path.length ?? 0) > 1;
  const key =
    { true: 'road', false: { true: 'straight', false: 'none' }[`${usable}`] }[
      `${onRoad}`
    ] ?? 'none';
  return strategies[key]?.();
};
