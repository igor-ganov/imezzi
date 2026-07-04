import { fetchJson } from '../api/fetch-json.ts';
import type { BusOffsets } from '../fleet/types.ts';

const cache: { promise?: Promise<BusOffsets> } = {};

/** Memoized bus travel-time templates (fleet positioning). */
export const loadBusOffsets = (): Promise<BusOffsets> =>
  (cache.promise ??= fetchJson<BusOffsets>('/data/bus-offsets.json'));
