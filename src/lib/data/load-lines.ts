import type { Line } from '../amt/types.ts';
import { fetchJson } from '../api/fetch-json.ts';
import { mergedLines } from '../lines/merged-lines.ts';
import type { UiLine } from '../lines/ui-line.ts';
import { loadSchedule } from './load-schedule.ts';

const cache: { promise?: Promise<readonly UiLine[]> } = {};

/** Memoized merged line list for filter and geometry lookups. */
export const loadLines = (): Promise<readonly UiLine[]> =>
  (cache.promise ??= Promise.all([
    fetchJson<readonly Line[]>('/api/lines'),
    loadSchedule(),
  ]).then(([appLines, schedule]) => mergedLines(appLines, schedule)));
