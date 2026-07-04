import type { FleetSighting } from './types.ts';

/**
 * Fold a fresh sweep portion into the accumulated picture: re-polled
 * stops replace their old rows wholesale, everything else survives
 * within the TTL (day-seconds wrap handled modularly).
 */
export const mergeSightings = (
  current: readonly FleetSighting[],
  fresh: readonly FleetSighting[],
  nowSeconds: number,
  ttlSeconds: number,
): readonly FleetSighting[] => {
  const refreshed = new Set(fresh.map((sighting) => sighting.stopId));
  return [
    ...current.filter(
      (sighting) =>
        !refreshed.has(sighting.stopId) &&
        (nowSeconds - sighting.fetchedAtSeconds + 86400) % 86400 <=
          ttlSeconds,
    ),
    ...fresh,
  ];
};
