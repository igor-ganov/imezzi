import { activeServices } from '../schedule/active-services.ts';
import { prevDay } from '../schedule/prev-day.ts';
import type { Schedule, ScheduleLine } from '../schedule/types.ts';
import type { BoardRow } from './board-row.ts';

const lineRows = (
  schedule: Schedule,
  line: ScheduleLine,
  stopId: string,
  services: ReadonlySet<string>,
  seconds: number,
): readonly BoardRow[] =>
  line.directions.flatMap((direction) => {
    const index = direction.stops.indexOf(stopId);
    const lastStop = direction.stops[direction.stops.length - 1] ?? '';
    const destination = schedule.stops[lastStop]?.name ?? line.longName;
    const offset = direction.offsets[index] ?? 0;
    return Object.entries(direction.departures)
      .filter(([serviceId]) => index >= 0 && services.has(serviceId))
      .flatMap(([, starts]) => starts)
      .map((start) => start + offset - seconds)
      .filter((eta) => eta >= -30 && eta <= 5400)
      .map((eta) => ({
        line: line.shortName,
        mode: line.mode,
        destination,
        etaSeconds: Math.max(eta, 0),
        approximated: true,
        full: false,
        vehicle: '',
      }));
  });

/**
 * Timetable departures from a stop (non-bus modes, ⚠ AC-3.2).
 * Checks today's services plus yesterday's trips running past
 * midnight (GTFS times may exceed 24 h), like scheduleVehicles.
 */
export const scheduleBoardRows = (
  schedule: Schedule,
  stopId: string,
  clock: { readonly day: string; readonly seconds: number },
): readonly BoardRow[] => {
  const contexts = [
    { services: activeServices(schedule, clock.day), seconds: clock.seconds },
    {
      services: activeServices(schedule, prevDay(clock.day)),
      seconds: clock.seconds + 86400,
    },
  ];
  return contexts.flatMap(({ services, seconds }) =>
    schedule.lines.flatMap((line) =>
      lineRows(schedule, line, stopId, services, seconds),
    ),
  );
};
