import { normalizeLineLabel } from '../vehicles/normalize-line-label.ts';
import type { Itinerary } from './types.ts';

/** Normalized line labels serving the itinerary's transit legs. */
export const itineraryLines = (
  itinerary: Itinerary | undefined,
): ReadonlySet<string> =>
  new Set(
    (itinerary?.legs ?? [])
      .filter((leg) => leg.mode !== 'walk')
      .map((leg) => normalizeLineLabel(leg.line ?? '')),
  );
