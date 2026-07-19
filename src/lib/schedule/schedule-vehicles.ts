import { branch } from '../branch.ts';
import type { VehicleView } from '../vehicles/types.ts';
import { activeServices } from './active-services.ts';
import { directionVehicles } from './direction-vehicles.ts';
import { parkedVehicle } from './parked-vehicle.ts';
import { prevDay } from './prev-day.ts';
import type { Schedule } from './types.ts';

/**
 * All timetable-positioned vehicles at a Rome-local moment (⚠,
 * live-map AC-1.2). Checks today's services plus yesterday's trips
 * that run past midnight (GTFS times may exceed 24 h). A direction
 * with nothing en route falls back to a car parked at its depot so
 * infrequent modes stay on the map between runs.
 */
export const scheduleVehicles = (
  schedule: Schedule,
  clock: { readonly day: string; readonly seconds: number },
): readonly VehicleView[] => {
  const contexts = [
    { services: activeServices(schedule, clock.day), seconds: clock.seconds },
    {
      services: activeServices(schedule, prevDay(clock.day)),
      seconds: clock.seconds + 86400,
    },
  ];
  const today = contexts[0]?.services ?? new Set<string>();
  return schedule.lines.flatMap((line) =>
    line.directions.flatMap((direction, dirIndex) => {
      const enRoute = contexts.flatMap(({ services, seconds }) =>
        directionVehicles(schedule, line, direction, dirIndex, services, seconds),
      );
      return branch(enRoute.length > 0)(
        () => enRoute,
        () =>
          parkedVehicle(schedule, line, direction, dirIndex, today, clock.seconds),
      );
    }),
  );
};
