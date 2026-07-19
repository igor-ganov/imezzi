import type { VehicleView } from '../vehicles/types.ts';
import type { Schedule, ScheduleDirection, ScheduleLine, ScheduleStop } from './types.ts';

/**
 * A car waiting at the depot: when a line direction has nothing en
 * route yet still has a departure to come today, show it parked at
 * its origin terminal (⚠). Keeps the infrequent modes — funiculars,
 * lifts, the Casella train — on the map between runs (live-map US-1).
 */
export const parkedVehicle = (
  schedule: Schedule,
  line: ScheduleLine,
  direction: ScheduleDirection,
  dirIndex: number,
  services: ReadonlySet<string>,
  seconds: number,
): readonly VehicleView[] => {
  const pending = Object.entries(direction.departures)
    .filter(([serviceId]) => services.has(serviceId))
    .some(([, starts]) => starts.some((start) => start > seconds));
  return [schedule.stops[direction.stops[0] ?? '']]
    .filter((stop): stop is ScheduleStop => stop !== undefined)
    .filter(() => pending)
    .map((stop) => ({
      id: `${line.id}:${dirIndex}:park`,
      label: line.shortName,
      mode: line.mode,
      lineKey: line.id,
      lat: stop.lat,
      lon: stop.lon,
      approximated: true,
    }));
};
