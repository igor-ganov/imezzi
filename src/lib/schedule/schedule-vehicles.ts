import type { VehicleView } from '../vehicles/types.ts';
import { activeServices } from './active-services.ts';
import { directionVehicles } from './direction-vehicles.ts';
import { prevDay } from './prev-day.ts';
import type { Schedule } from './types.ts';

/**
 * All timetable-positioned vehicles at a Rome-local moment (⚠,
 * live-map AC-1.2). Checks today's services plus yesterday's trips
 * that run past midnight (GTFS times may exceed 24 h).
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
  return contexts.flatMap(({ services, seconds }) =>
    schedule.lines.flatMap((line) =>
      line.directions.flatMap((direction, dirIndex) =>
        directionVehicles(schedule, line, direction, dirIndex, services, seconds),
      ),
    ),
  );
};
