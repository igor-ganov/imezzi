import type { Stop } from '../../lib/amt/types.ts';
import { loadBusOffsets } from '../../lib/data/load-bus-offsets.ts';
import { loadSchedule } from '../../lib/data/load-schedule.ts';
import { loadStops } from '../../lib/data/load-stops.ts';
import { retimeOffsets } from '../../lib/fleet/retime-offsets.ts';
import type { BusOffsets } from '../../lib/fleet/types.ts';
import type { Schedule } from '../../lib/schedule/types.ts';

export interface MapData {
  readonly stops: readonly Stop[];
  readonly schedule: Schedule;
  readonly busOffsets: BusOffsets;
  readonly stopCoords: ReadonlyMap<string, readonly [number, number]>;
}

/** Bootstrap payload: stops, non-bus schedule, bus travel templates. */
export const loadMapData = async (): Promise<MapData> => {
  const [stops, schedule, busOffsets] = await Promise.all([
    loadStops(),
    loadSchedule(),
    loadBusOffsets(),
  ]);
  const stopCoords = new Map(
    stops.map((stop) => [stop.id, [stop.lon, stop.lat] as const]),
  );
  return {
    stops,
    schedule,
    // AMT rounds GTFS stop_times to minutes: ~26% of segments are
    // zero-duration (infinite speed → position jumps). Re-time once
    // at load so every consumer sees strictly increasing offsets.
    busOffsets: retimeOffsets(busOffsets, stopCoords),
    stopCoords,
  };
};
