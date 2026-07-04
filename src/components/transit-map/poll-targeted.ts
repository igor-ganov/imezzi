import { busContextOf } from '../../lib/data/bus-context-of.ts';
import type { UiLine } from '../../lib/lines/ui-line.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { sampleEvery } from '../../lib/sample-every.ts';
import type { LiveSnapshot } from '../../lib/vehicles/live-snapshot.ts';
import { fetchStopArrivals } from './fetch-stop-arrivals.ts';

const STOPS_PER_LINE = 12;

/** Poll snapshots for explicitly selected/itinerary bus lines. */
export const pollTargeted = (
  lines: readonly UiLine[],
): Promise<readonly LiveSnapshot[]> =>
  Promise.all(
    lines.map(async (line): Promise<LiveSnapshot> => {
      const context = await busContextOf(line);
      const arrivals = await fetchStopArrivals(
        sampleEvery(context.monitoredStopIds, STOPS_PER_LINE),
      );
      return {
        context,
        arrivals,
        fetchedAtSeconds: romeClock(new Date()).seconds,
      };
    }),
  );
