import { fetchJson } from '../api/fetch-json.ts';
import type { Schedule } from '../schedule/types.ts';

const cache: { promise?: Promise<Schedule> } = {};

/** Memoized non-bus schedule artifact (shared across islands). */
export const loadSchedule = (): Promise<Schedule> =>
  (cache.promise ??= fetchJson<Schedule>('/data/schedule.json'));
