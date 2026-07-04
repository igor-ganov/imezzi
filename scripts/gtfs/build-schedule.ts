import { groupDirections, type TripStop } from './group-directions.ts';
import { modeOf } from './mode-of.ts';
import { serviceDatesOf } from './service-dates-of.ts';

type Row = Readonly<Record<string, string>>;

const tripStopsOf = (stopTimes: readonly Row[], tripIds: ReadonlySet<string>) => {
  const byTrip = new Map<string, TripStop[]>();
  stopTimes
    .filter((row) => tripIds.has(row['trip_id'] ?? ''))
    .forEach((row) => {
      const list = byTrip.get(row['trip_id'] ?? '') ?? [];
      list.push({
        stopId: row['stop_id'] ?? '',
        arrival: row['arrival_time'] ?? '0:0:0',
        sequence: Number(row['stop_sequence'] ?? '0'),
      });
      byTrip.set(row['trip_id'] ?? '', list);
    });
  return byTrip;
};

/** Assemble the non-bus schedule artifact (live-map design §3). */
export const buildSchedule = (
  routes: readonly Row[],
  trips: readonly Row[],
  stopTimes: readonly Row[],
  calendarDates: readonly Row[],
) => {
  const nonBus = routes.filter((route) => (route['route_type'] ?? '') !== '3');
  const services = serviceDatesOf(calendarDates);
  const lines = nonBus.map((route) => {
    const routeTrips = trips.filter((trip) => trip['route_id'] === route['route_id']);
    const tripIds = new Set(routeTrips.map((trip) => trip['trip_id'] ?? ''));
    const byTrip = tripStopsOf(stopTimes, tripIds);
    const withService = new Map(
      routeTrips.map((trip) => [
        trip['trip_id'] ?? '',
        {
          serviceId: trip['service_id'] ?? '',
          stops: byTrip.get(trip['trip_id'] ?? '') ?? [],
        },
      ]),
    );
    return {
      id: route['route_id'] ?? '',
      shortName: route['route_short_name'] ?? '',
      longName: route['route_long_name'] ?? '',
      mode: modeOf(route['route_type'] ?? ''),
      directions: groupDirections(withService),
    };
  });
  return { lines, serviceDates: Object.fromEntries(services) };
};
