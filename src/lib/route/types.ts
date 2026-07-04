/** Itinerary model (route-planner design §2). */

export interface Place {
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
  readonly stopId?: string;
}

export interface Leg {
  readonly mode: string;
  readonly line?: string;
  readonly headsign?: string;
  readonly from: Place;
  readonly to: Place;
  readonly startTime: string;
  readonly endTime: string;
  readonly durationSec: number;
  readonly geometry: readonly (readonly [number, number])[];
  /** true when times come from the timetable, not live data (⚠). */
  readonly approximated: boolean;
  readonly intermediateStops: readonly Place[];
}

export interface Itinerary {
  readonly legs: readonly Leg[];
  readonly startTime: string;
  readonly endTime: string;
  readonly durationSec: number;
  readonly transfers: number;
}
