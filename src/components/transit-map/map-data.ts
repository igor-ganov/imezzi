import type { Stop } from '../../lib/amt/types.ts';
import { loadBusOffsets } from '../../lib/data/load-bus-offsets.ts';
import { loadSchedule } from '../../lib/data/load-schedule.ts';
import { loadStops } from '../../lib/data/load-stops.ts';
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
  return {
    stops,
    schedule,
    busOffsets,
    stopCoords: new Map(
      stops.map((stop) => [stop.id, [stop.lon, stop.lat] as const]),
    ),
  };
};
