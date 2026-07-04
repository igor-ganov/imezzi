/** Raw MOTIS v1 plan response shapes (fields we consume). */

export interface MotisPlace {
  readonly name: string;
  readonly stopId?: string;
  readonly lat: number;
  readonly lon: number;
}

export interface MotisLeg {
  readonly mode: string;
  readonly from: MotisPlace;
  readonly to: MotisPlace;
  readonly startTime: string;
  readonly endTime: string;
  readonly duration: number;
  readonly realTime: boolean;
  readonly routeShortName?: string;
  readonly headsign?: string;
  readonly legGeometry: { readonly points: string; readonly precision: number };
  readonly intermediateStops?: readonly MotisPlace[];
}

export interface MotisItinerary {
  readonly duration: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly transfers: number;
  readonly legs: readonly MotisLeg[];
}

export interface MotisPlanResponse {
  readonly itineraries: readonly MotisItinerary[];
  readonly direct?: readonly MotisItinerary[];
}
