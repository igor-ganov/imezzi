import type { LineStopRef } from '../amt/types.ts';
import { fetchJson } from '../api/fetch-json.ts';

const cache: { promise?: Promise<readonly LineStopRef[]> } = {};

/** Memoized line → ordered stop sequence table. */
export const loadLineStops = (): Promise<readonly LineStopRef[]> =>
  (cache.promise ??= fetchJson<readonly LineStopRef[]>('/api/line-stops'));
