import { signal } from './signal.ts';
import type { CivicHit } from '../civic/civic-hit.ts';
import type { FleetSighting } from '../fleet/types.ts';
import type { PinTarget } from '../map/pin-target.ts';
import type { Itinerary, Leg, Place } from '../route/types.ts';

/**
 * Global UI state (live-map design §4). Islands subscribe to slices;
 * pure helpers derive everything else.
 */
export const appState = {
  /** Selected line keys; empty set = no filter (full network). */
  selectedLines: signal<ReadonlySet<string>>(new Set()),
  /** Normalized labels of the selected lines (fleet filtering). */
  selectedLabels: signal<ReadonlySet<string>>(new Set()),
  /** Stop id whose sheet is open. */
  activeStopId: signal<string | undefined>(undefined),
  /** Civic number whose card is open. */
  activeCivic: signal<CivicHit | undefined>(undefined),
  /** Search result pinned on the map (flyTo target). */
  searchPin: signal<PinTarget | undefined>(undefined),
  /** Active route itinerary (route mode) — undefined when off. */
  itinerary: signal<Itinerary | undefined>(undefined),
  /** All computed alternatives for the current query. */
  itineraries: signal<readonly Itinerary[]>([]),
  /** Route origin / destination (route-planner US-1). */
  origin: signal<Place | undefined>(undefined),
  destination: signal<Place | undefined>(undefined),
  /** Next map click sets this endpoint. */
  pickMode: signal<'origin' | 'destination' | undefined>(undefined),
  /** Leg the map should zoom to (route-planner AC-4.2). */
  focusLeg: signal<Leg | undefined>(undefined),
  /** Vehicle id matched to each transit leg of the itinerary. */
  legVehicles: signal<ReadonlyMap<number, string | undefined>>(new Map()),
  /** Highlighted vehicle icon (leg click, route US-3). */
  selectedVehicleId: signal<string | undefined>(undefined),
  /** The user's located position (locate button). */
  mePosition: signal<{ readonly lon: number; readonly lat: number } | undefined>(
    undefined,
  ),
  /** Route planner panel open. */
  planning: signal<boolean>(false),
  /** City-sweep SIMON rows — positions recompute parametrically. */
  fleetSightings: signal<readonly FleetSighting[]>([]),
  /** Next stop of each tracked vehicle — re-polled every tick. */
  hotStops: signal<readonly string[]>([]),
  /** Epoch ms of the last successful live fetch (freshness banner). */
  lastLiveUpdate: signal<number>(0),
  /** Resolved theme. */
  theme: signal<'light' | 'dark'>('light'),
};
