import type { BusDirectionTemplate } from './types.ts';

/**
 * Where on the direction's timeline a sighting puts the vehicle:
 * `countdown` seconds before its arrival offset at the sighted stop.
 */
export const momentOf = (
  template: BusDirectionTemplate,
  stopId: string,
  countdown: number,
): number | undefined => {
  const index = template.stops.indexOf(stopId);
  const arrival = template.offsets[index] ?? 0;
  return { true: () => undefined, false: () => Math.max(arrival - countdown, 0) }[
    `${index < 0}`
  ]();
};
