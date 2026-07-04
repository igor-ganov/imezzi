/** Shared AMT data model (live-map design §1). */

export interface Arrival {
  readonly line: string;
  readonly destination: string;
  /** true = timetable-derived (⚠ approximated), false = live SIMON. */
  readonly theoretical: boolean;
  readonly arrivalTime: string;
  readonly countdown: string;
  readonly vehicle: string;
  readonly full: boolean;
}

export interface Stop {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lat: number;
  readonly lon: number;
  readonly lines: readonly string[];
  readonly monitored: boolean;
}

export interface Line {
  readonly id: string;
  readonly name: string;
  readonly from: string;
  readonly to: string;
  readonly category: string;
}

export interface LineStopRef {
  readonly lineId: string;
  readonly direction: number;
  readonly stopId: string;
  readonly position: number;
}

export interface LineGeometry {
  readonly stops: readonly {
    readonly id: string;
    readonly name: string;
    readonly lat: number;
    readonly lon: number;
  }[];
  readonly path: readonly (readonly [number, number])[];
}
