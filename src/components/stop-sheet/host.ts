import type { BoardRow } from '../../lib/arrivals/board-row.ts';

/** Mutable surface the controller drives on the element. */
export interface StopSheetHost {
  stopId: string | undefined;
  stopName: string;
  rows: readonly BoardRow[];
  stale: boolean;
}
