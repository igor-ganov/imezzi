import type { Arrival } from '../amt/types.ts';

/** A SIMON prediction row tagged with the stop it was fetched for. */
export interface StopArrival {
  readonly stopId: string;
  readonly row: Arrival;
}
