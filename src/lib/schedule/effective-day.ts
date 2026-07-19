import { branch } from '../branch.ts';
import type { Schedule } from './types.ts';

/** Whole days since the epoch (weekday math, calendar-safe). */
const ordinal = (day: string): number =>
  Date.UTC(
    Number(day.slice(0, 4)),
    Number(day.slice(4, 6)) - 1,
    Number(day.slice(6, 8)),
  ) / 86400000;

/** 0–6 (epoch day 0 was a Thursday = 4). */
const weekday = (day: string): number => (ordinal(day) + 4) % 7;

const nearestSameWeekday = (
  dates: readonly string[],
  day: string,
): string | undefined =>
  [...dates]
    .filter((date) => weekday(date) === weekday(day))
    .sort(
      (a, b) =>
        Math.abs(ordinal(a) - ordinal(day)) - Math.abs(ordinal(b) - ordinal(day)),
    )[0];

/**
 * The day whose timetable to display. Usually `day` itself; when AMT's
 * feed defines no service for it (a calendar-boundary gap on the front
 * edge of the published window), the nearest available date of the same
 * weekday stands in so the schedule layer never goes blank.
 */
export const effectiveDay = (schedule: Schedule, day: string): string => {
  const dates = [...new Set(Object.values(schedule.serviceDates).flat())];
  return branch(dates.includes(day))(
    () => day,
    () => nearestSameWeekday(dates, day) ?? day,
  );
};
