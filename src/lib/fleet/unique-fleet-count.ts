import { isActiveSighting } from './is-active-sighting.ts';
import type { FleetSighting } from './types.ts';

/**
 * Unique live vehicles present in the raw data — the reference side
 * of the marker-count invariant (must equal the rendered fleet).
 * Uses the same activity predicate as the inference, so both sides
 * of the invariant count the same population.
 */
export const uniqueFleetCount = (
  sightings: readonly FleetSighting[],
): number =>
  new Set(
    sightings.filter(isActiveSighting).map(({ row }) => row.vehicle),
  ).size;
