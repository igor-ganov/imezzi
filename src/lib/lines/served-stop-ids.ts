import type { Stop } from '../amt/types.ts';
import type { Schedule } from '../schedule/types.ts';

/** Stops served by the selected lines (highlight set, AC-2.1). */
export const servedStopIds = (
  selected: ReadonlySet<string>,
  stops: readonly Stop[],
  schedule: Schedule,
): ReadonlySet<string> =>
  new Set([
    ...stops
      .filter((stop) => stop.lines.some((lineId) => selected.has(lineId)))
      .map((stop) => stop.id),
    ...schedule.lines
      .filter((line) => selected.has(line.id))
      .flatMap((line) => line.directions.flatMap((d) => d.stops)),
  ]);
