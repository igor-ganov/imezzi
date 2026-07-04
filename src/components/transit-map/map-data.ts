import { fetchJson } from '../../lib/api/fetch-json.ts';
import type { Stop } from '../../lib/amt/types.ts';
import type { Schedule } from '../../lib/schedule/types.ts';

export interface MapData {
  readonly stops: readonly Stop[];
  readonly schedule: Schedule;
}

/** Bootstrap payload: AMT stop list + non-bus schedule artifact. */
export const loadMapData = async (): Promise<MapData> => {
  const [stops, schedule] = await Promise.all([
    fetchJson<readonly Stop[]>('/api/stops'),
    fetchJson<Schedule>('/data/schedule.json'),
  ]);
  return { stops, schedule };
};
