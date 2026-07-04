import type { BusDirection } from './bus-line-context.ts';

/**
 * Choose the direction whose terminus matches the announced
 * destination; SIMON rows carry the headsign, not the direction.
 */
export const pickDirection = (
  directions: readonly BusDirection[],
  destination: string,
): BusDirection | undefined => {
  const needle = destination.trim().toUpperCase();
  return (
    directions.find((direction) =>
      direction.lastStopName.toUpperCase().includes(needle),
    ) ??
    directions.find((direction) =>
      needle.includes(direction.lastStopName.toUpperCase()),
    ) ??
    directions[0]
  );
};
