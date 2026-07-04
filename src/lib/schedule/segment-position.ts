import type { ScheduleStop } from './types.ts';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Linear position along a direction's stop chain at `elapsed` seconds
 * from trip start. Returns undefined when the trip is not en route or
 * a stop is missing coordinates.
 */
export const segmentPosition = (
  stops: readonly (ScheduleStop | undefined)[],
  offsets: readonly number[],
  elapsed: number,
): { readonly lat: number; readonly lon: number } | undefined => {
  const last = offsets[offsets.length - 1] ?? 0;
  const inRange = elapsed >= 0 && elapsed <= last;
  const index = offsets.findIndex(
    (offset, i) => elapsed >= offset && elapsed <= (offsets[i + 1] ?? -1),
  );
  const from = stops[index];
  const to = stops[index + 1];
  const start = offsets[index] ?? 0;
  const end = offsets[index + 1] ?? start + 1;
  const fraction = (elapsed - start) / Math.max(end - start, 1);
  const found = inRange && index >= 0 && from !== undefined && to !== undefined;
  return {
    true: () => ({
      lat: lerp(from?.lat ?? 0, to?.lat ?? 0, fraction),
      lon: lerp(from?.lon ?? 0, to?.lon ?? 0, fraction),
    }),
    false: () => undefined,
  }[`${found}`]();
};
