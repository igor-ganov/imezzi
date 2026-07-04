import { pickTemplate } from './pick-template.ts';
import type { FleetProgress } from './fleet-memory.ts';
import type { BusDirectionTemplate, BusOffsets } from './types.ts';

/**
 * Sticky direction: while a vehicle's previously assigned direction
 * still serves the sighted stop it is kept — SIMON headsigns rarely
 * match GTFS termini verbatim, and re-picking per tick flipped
 * arrows at random on shared stops.
 */
export const resolveDirection = (
  offsets: BusOffsets,
  label: string,
  stopId: string,
  destination: string,
  previous: FleetProgress | undefined,
): {
  readonly template: BusDirectionTemplate | undefined;
  readonly templateKey: string;
} => {
  const directions = offsets[label] ?? [];
  const sticky = directions.find(
    (entry, index) =>
      `${label}#${index}` === previous?.templateKey &&
      entry.stops.includes(stopId),
  );
  const template = sticky ?? pickTemplate(directions, stopId, destination);
  return {
    template,
    templateKey: `${label}#${directions.findIndex((d) => d === template)}`,
  };
};
