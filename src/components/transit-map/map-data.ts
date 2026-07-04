import type { Stop } from '../../lib/amt/types.ts';
import { loadSchedule } from '../../lib/data/load-schedule.ts';
import { loadStops } from '../../lib/data/load-stops.ts';
import type { Schedule } from '../../lib/schedule/types.ts';

export interface MapData {
  readonly stops: readonly Stop[];
  readonly schedule: Schedule;
}

/** Bootstrap payload: AMT stop list + non-bus schedule artifact. */
export const loadMapData = async (): Promise<MapData> => {
  const [stops, schedule] = await Promise.all([loadStops(), loadSchedule()]);
  return { stops, schedule };
};
