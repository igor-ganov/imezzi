/** One row of a stop's departure board (live-map US-3). */
export interface BoardRow {
  readonly line: string;
  readonly mode: string;
  readonly destination: string;
  readonly etaSeconds: number;
  /** true = timetable-derived (⚠); false = live SIMON prediction. */
  readonly approximated: boolean;
  readonly full: boolean;
  /** SIMON NumeroSociale — empty when timetable-derived. */
  readonly vehicle: string;
}
