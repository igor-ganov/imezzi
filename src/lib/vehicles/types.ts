/** A vehicle placed on the map (live or approximated). */
export interface VehicleView {
  readonly id: string;
  readonly label: string;
  readonly mode: string;
  readonly lineKey: string;
  readonly lat: number;
  readonly lon: number;
  /** true = timetable-derived position/time (⚠ badge). */
  readonly approximated: boolean;
}
