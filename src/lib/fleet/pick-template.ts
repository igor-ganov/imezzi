import type { BusDirectionTemplate } from './types.ts';

/**
 * The direction a sighted vehicle is travelling: it must serve the
 * sighting stop, and its terminus should match the announced
 * headsign (SIMON gives the destination, not the direction).
 */
export const pickTemplate = (
  directions: readonly BusDirectionTemplate[],
  stopId: string,
  destination: string,
): BusDirectionTemplate | undefined => {
  const serving = directions.filter((direction) =>
    direction.stops.includes(stopId),
  );
  const needle = destination.trim().toUpperCase();
  return (
    serving.find((direction) =>
      direction.lastStopName.toUpperCase().includes(needle),
    ) ??
    serving.find((direction) =>
      needle.includes(direction.lastStopName.toUpperCase()),
    ) ??
    serving[0]
  );
};
