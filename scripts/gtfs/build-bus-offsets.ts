import { normalizeLineLabel } from '../../src/lib/vehicles/normalize-line-label.ts';
import { groupDirections } from './group-directions.ts';
import { tripStopsOf } from './trip-stops-of.ts';

type Row = Readonly<Record<string, string>>;

export interface BusDirectionTemplate {
  readonly stops: readonly string[];
  readonly offsets: readonly number[];
  readonly lastStopName: string;
}

/**
 * Travel-time templates for every bus route (live positioning: a
 * countdown to one stop maps to a point between the two stops the
 * vehicle is actually between). Keyed by normalized short name; the
 * two busiest stop sequences per route are its directions.
 */
export const buildBusOffsets = (
  routes: readonly Row[],
  trips: readonly Row[],
  stopTimes: readonly Row[],
  stopNames: ReadonlyMap<string, string>,
): Readonly<Record<string, readonly BusDirectionTemplate[]>> => {
  const byTrip = tripStopsOf(stopTimes);
  const entries = routes
    .filter((route) => (route['route_type'] ?? '') === '3')
    .map((route) => {
      const withService = new Map(
        trips
          .filter((trip) => trip['route_id'] === route['route_id'])
          .map((trip) => [
            trip['trip_id'] ?? '',
            {
              serviceId: trip['service_id'] ?? '',
              stops: byTrip.get(trip['trip_id'] ?? '') ?? [],
            },
          ]),
      );
      const directions = groupDirections(withService)
        .map((direction) => ({
          direction,
          weight: Object.values(direction.departures).flat().length,
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 2)
        .map(({ direction }) => ({
          stops: direction.stops,
          offsets: direction.offsets,
          lastStopName:
            stopNames.get(
              direction.stops[direction.stops.length - 1] ?? '',
            ) ?? '',
        }));
      return [normalizeLineLabel(route['route_short_name'] ?? ''), directions] as const;
    })
    .filter(([, directions]) => directions.length > 0);
  return Object.fromEntries(entries);
};
