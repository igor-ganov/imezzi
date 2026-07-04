import type { CivicHit } from '../../lib/civic/civic-hit.ts';
import type { Itinerary, Place } from '../../lib/route/types.ts';

/** Mutable island surface the store subscriptions drive. */
export interface RoutePlannerHost {
  open: boolean;
  busy: boolean;
  origin: Place | undefined;
  destination: Place | undefined;
  pickMode: 'origin' | 'destination' | undefined;
  itineraries: readonly Itinerary[];
  itinerary: Itinerary | undefined;
  destinationHits: readonly CivicHit[];
}
