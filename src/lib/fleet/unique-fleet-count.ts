import type { FleetSighting } from './types.ts';

/**
 * Unique live vehicles present in the raw data — the reference side
 * of the marker-count invariant (must equal the rendered fleet).
 */
export const uniqueFleetCount = (
  sightings: readonly FleetSighting[],
): number =>
  new Set(
    sightings
      .filter(({ row }) => !row.theoretical && row.vehicle !== '')
      .map(({ row }) => row.vehicle),
  ).size;
