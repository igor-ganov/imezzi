import { signal } from './signal.ts';
import type { Itinerary } from '../route/types.ts';
import type { VehicleView } from '../vehicles/types.ts';

/**
 * Global UI state (live-map design §4). Islands subscribe to slices;
 * pure helpers derive everything else.
 */
export const appState = {
  /** Selected line keys; empty set = no filter (full network). */
  selectedLines: signal<ReadonlySet<string>>(new Set()),
  /** Stop id whose sheet is open. */
  activeStopId: signal<string | undefined>(undefined),
  /** Active route itinerary (route mode) — undefined when off. */
  itinerary: signal<Itinerary | undefined>(undefined),
  /** Route planner panel open. */
  planning: signal<boolean>(false),
  /** Live inferred bus positions from the poller (design §2). */
  liveVehicles: signal<readonly VehicleView[]>([]),
  /** Epoch ms of the last successful live fetch (freshness banner). */
  lastLiveUpdate: signal<number>(0),
  /** Resolved theme. */
  theme: signal<'light' | 'dark'>('light'),
};
