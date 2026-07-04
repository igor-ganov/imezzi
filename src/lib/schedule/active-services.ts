import type { Schedule } from './types.ts';

/** Service ids running on the given Rome-local YYYYMMDD date. */
export const activeServices = (
  schedule: Schedule,
  day: string,
): ReadonlySet<string> =>
  new Set(
    Object.entries(schedule.serviceDates)
      .filter(([, dates]) => dates.includes(day))
      .map(([serviceId]) => serviceId),
  );
