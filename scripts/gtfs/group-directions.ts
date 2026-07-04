import { toSeconds } from './to-seconds.ts';

export interface TripStop {
  readonly stopId: string;
  readonly arrival: string;
  readonly sequence: number;
}

export interface Direction {
  readonly stops: readonly string[];
  readonly offsets: readonly number[];
  readonly departures: Readonly<Record<string, readonly number[]>>;
}

const sorted = (stops: readonly TripStop[]) =>
  [...stops].sort((a, b) => a.sequence - b.sequence);

/**
 * Group a route's trips into "directions": trips sharing an identical
 * ordered stop sequence. Each direction keeps the stop-offset template
 * (seconds from trip start) of its first trip and every trip's start
 * time bucketed by service id (live-map design §3).
 */
export const groupDirections = (
  trips: ReadonlyMap<string, { readonly serviceId: string; readonly stops: readonly TripStop[] }>,
): readonly Direction[] => {
  const groups = new Map<string, {
    stops: readonly string[];
    offsets: readonly number[];
    departures: Map<string, number[]>;
  }>();
  trips.forEach(({ serviceId, stops }) => {
    const ordered = sorted(stops);
    const key = ordered.map((stop) => stop.stopId).join('|');
    const start = toSeconds(ordered[0]?.arrival ?? '0:0:0');
    const group = groups.get(key) ?? {
      stops: ordered.map((stop) => stop.stopId),
      offsets: ordered.map((stop) => toSeconds(stop.arrival) - start),
      departures: new Map<string, number[]>(),
    };
    group.departures.set(serviceId, [
      ...(group.departures.get(serviceId) ?? []),
      start,
    ]);
    groups.set(key, group);
  });
  return Array.from(groups.values()).map((group) => ({
    stops: group.stops,
    offsets: group.offsets,
    departures: Object.fromEntries(
      Array.from(group.departures.entries()).map(([id, times]) => [
        id,
        [...times].sort((a, b) => a - b),
      ]),
    ),
  }));
};
