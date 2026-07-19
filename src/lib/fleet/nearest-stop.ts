import type { Stop } from '../amt/types.ts';

type LonLat = { readonly lon: number; readonly lat: number };

const distSq = (stop: Stop | undefined, me: LonLat): number =>
  [stop]
    .filter((value): value is Stop => value !== undefined)
    .map(
      (value) =>
        ((value.lon - me.lon) * Math.cos((value.lat * Math.PI) / 180)) ** 2 +
        (value.lat - me.lat) ** 2,
    )[0] ?? Infinity;

/**
 * Index of the stop closest to the user among `ids`, or -1 when the
 * user is unlocated — the "you are here" anchor on the line diagram.
 */
export const nearestStop = (
  ids: readonly string[],
  stops: ReadonlyMap<string, Stop>,
  me: LonLat | undefined,
): number =>
  [me]
    .filter((value): value is LonLat => value !== undefined)
    .map(
      (value) =>
        ids
          .map((id, index) => ({ index, d: distSq(stops.get(id), value) }))
          .sort((a, b) => a.d - b.d)[0]?.index ?? -1,
    )[0] ?? -1;
