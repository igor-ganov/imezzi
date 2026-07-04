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
  /** Faded out in route mode when not serving the itinerary. */
  readonly dimmed?: boolean;
  /** Travel direction in compass degrees (arrow marker), if known. */
  readonly bearing?: number | undefined;
  /** Age of the newest data behind this position, in seconds. */
  readonly ageSeconds?: number;
}
