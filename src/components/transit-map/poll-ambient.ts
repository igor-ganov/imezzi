import { branch } from '../../lib/branch.ts';
import { busContextOf } from '../../lib/data/bus-context-of.ts';
import { loadLines } from '../../lib/data/load-lines.ts';
import { loadStops } from '../../lib/data/load-stops.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { appState } from '../../lib/store/app-state.ts';
import { discoverLines } from '../../lib/vehicles/discover-lines.ts';
import type { LiveSnapshot } from '../../lib/vehicles/live-snapshot.ts';
import { normalizeLineLabel } from '../../lib/vehicles/normalize-line-label.ts';
import { viewportStopIds } from '../../lib/vehicles/viewport-stop-ids.ts';
import { fetchStopArrivals } from './fetch-stop-arrivals.ts';

const STOPS_PER_CYCLE = 20;
const LINES_PER_CYCLE = 12;
const MIN_ZOOM = 12;

/**
 * Ambient mode: with no line filter and no route, sweep the visible
 * monitored stops (rotating per cycle), discover which lines are out
 * there and snapshot them — the map is alive on first load (US-1).
 */
export const pollAmbient = async (
  cycle: number,
): Promise<readonly LiveSnapshot[]> => {
  const viewport = appState.viewport.get();
  const active = viewport !== undefined && viewport.zoom >= MIN_ZOOM;
  return branch(active)<Promise<readonly LiveSnapshot[]>>(
    async () => {
      const stops = await loadStops();
      const ids = viewportStopIds(
        stops,
        viewport ?? { west: 0, south: 0, east: 0, north: 0, zoom: 0 },
        cycle,
        STOPS_PER_CYCLE,
      );
      const arrivals = await fetchStopArrivals(ids);
      const labels = discoverLines(arrivals, LINES_PER_CYCLE);
      const lines = (await loadLines()).filter(
        (line) =>
          line.mode === 'bus' &&
          labels.includes(normalizeLineLabel(line.label)),
      );
      const contexts = await Promise.all(lines.map(busContextOf));
      const fetchedAtSeconds = romeClock(new Date()).seconds;
      return contexts.map((context) => ({
        context,
        arrivals,
        fetchedAtSeconds,
      }));
    },
    () => Promise.resolve([]),
  );
};
