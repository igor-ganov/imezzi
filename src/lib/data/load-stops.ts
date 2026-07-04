import type { Stop } from '../amt/types.ts';
import { fetchJson } from '../api/fetch-json.ts';

const cache: { promise?: Promise<readonly Stop[]> } = {};

/** Memoized AMT stop list (shared across islands). */
export const loadStops = (): Promise<readonly Stop[]> =>
  (cache.promise ??= fetchJson<readonly Stop[]>('/api/stops'));
