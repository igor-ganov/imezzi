import type { CivicHit } from '../../lib/civic/civic-hit.ts';
import type { Itinerary, Place } from '../../lib/route/types.ts';

/** Read-only slice of planner state the panel renders. */
export interface PanelState {
  readonly origin: Place | undefined;
  readonly destination: Place | undefined;
  readonly pickMode: 'origin' | 'destination' | undefined;
  readonly itineraries: readonly Itinerary[];
  readonly itinerary: Itinerary | undefined;
  readonly busy: boolean;
  readonly destinationHits: readonly CivicHit[];
}

/** Callbacks the panel hands back to the island shell. */
export interface PanelActions {
  readonly onLocate: () => void;
  readonly onClear: () => void;
  readonly onDestinationQuery: (query: string) => void;
  readonly onDestinationPick: (hit: CivicHit) => void;
}
