import type { Stop } from '../amt/types.ts';
import { normalizeText } from '../normalize-text.ts';

/** AMT stops whose name matches the query (name search, ≥3 chars). */
export const searchStops = (
  stops: readonly Stop[],
  query: string,
  limit: number,
): readonly Stop[] => {
  const needle = normalizeText(query);
  return stops
    .filter(
      (stop) =>
        needle.length >= 3 && normalizeText(stop.name).includes(needle),
    )
    .slice(0, limit);
};
