import { bearingOf } from '../geo/bearing-of.ts';
import type { BusDirectionTemplate } from './types.ts';

export interface Placement {
  readonly point: readonly [number, number];
  readonly bearing: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Place a vehicle on its direction's timeline: `countdown` seconds
 * before arriving at `stopId`, i.e. between the two adjacent stops
 * whose travel-time offsets bracket that moment (live-map US-1).
 */
export const positionOnDirection = (
  template: BusDirectionTemplate,
  coords: ReadonlyMap<string, readonly [number, number]>,
  stopId: string,
  countdown: number,
): Placement | undefined => {
  const index = template.stops.indexOf(stopId);
  const arrival = template.offsets[index] ?? 0;
  const moment = Math.max(arrival - countdown, 0);
  const segment = template.offsets.findIndex(
    (offset, i) =>
      moment >= offset && moment <= (template.offsets[i + 1] ?? -1),
  );
  const at = Math.max(segment, 0);
  const from = coords.get(template.stops[at] ?? '');
  const to = coords.get(template.stops[at + 1] ?? template.stops[at] ?? '');
  const start = template.offsets[at] ?? 0;
  const end = template.offsets[at + 1] ?? start + 1;
  const fraction = Math.min(
    Math.max((moment - start) / Math.max(end - start, 1), 0),
    1,
  );
  const usable = index >= 0 && from !== undefined && to !== undefined;
  return {
    true: (): Placement => ({
      point: [
        lerp(from?.[0] ?? 0, to?.[0] ?? 0, fraction),
        lerp(from?.[1] ?? 0, to?.[1] ?? 0, fraction),
      ],
      bearing: bearingOf(from ?? [0, 0], to ?? [0, 1]),
    }),
    false: () => undefined,
  }[`${usable}`]();
};
