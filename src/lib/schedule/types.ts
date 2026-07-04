/** Shape of public/data/schedule.json (live-map design §3). */

export interface ScheduleDirection {
  readonly stops: readonly string[];
  readonly offsets: readonly number[];
  readonly departures: Readonly<Record<string, readonly number[]>>;
}

export interface ScheduleLine {
  readonly id: string;
  readonly shortName: string;
  readonly longName: string;
  readonly mode: string;
  readonly directions: readonly ScheduleDirection[];
}

export interface ScheduleStop {
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
}

export interface Schedule {
  readonly lines: readonly ScheduleLine[];
  readonly serviceDates: Readonly<Record<string, readonly string[]>>;
  readonly stops: Readonly<Record<string, ScheduleStop>>;
}
