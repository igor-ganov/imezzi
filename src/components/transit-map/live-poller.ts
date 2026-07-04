import type { Arrival } from '../../lib/amt/types.ts';
import { fetchJson } from '../../lib/api/fetch-json.ts';
import { busContextOf } from '../../lib/data/bus-context-of.ts';
import { loadLines } from '../../lib/data/load-lines.ts';
import type { UiLine } from '../../lib/lines/ui-line.ts';
import { poolMap } from '../../lib/pool-map.ts';
import { itineraryLines } from '../../lib/route/itinerary-lines.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { sampleEvery } from '../../lib/sample-every.ts';
import { appState } from '../../lib/store/app-state.ts';
import { inferBusVehicles } from '../../lib/vehicles/infer-bus-vehicles.ts';
import { normalizeLineLabel } from '../../lib/vehicles/normalize-line-label.ts';
import type { StopArrival } from '../../lib/vehicles/stop-arrival.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';

const POLL_MS = 20000;
const STOPS_PER_LINE = 12;
const PARALLEL = 5;

const pollLine = async (line: UiLine): Promise<readonly VehicleView[]> => {
  const context = await busContextOf(line);
  const stopIds = sampleEvery(context.monitoredStopIds, STOPS_PER_LINE);
  const arrivals = await poolMap(stopIds, PARALLEL, async (stopId) => {
    const rows = await fetchJson<readonly Arrival[]>(
      `/api/arrivals/${stopId}`,
    ).catch((): readonly Arrival[] => []);
    return rows.map((row): StopArrival => ({ stopId, row }));
  });
  return inferBusVehicles(
    context,
    arrivals.flat(),
    romeClock(new Date()).seconds,
  );
};

/** Poll selected bus lines and publish inferred vehicles (design §2). */
export const startLivePoller = (): void => {
  const poll = async (): Promise<void> => {
    const selected = appState.selectedLines.get();
    const routeLabels = itineraryLines(appState.itinerary.get());
    const lines = (await loadLines()).filter(
      (line) =>
        line.mode === 'bus' &&
        (selected.has(line.key) ||
          routeLabels.has(normalizeLineLabel(line.label))),
    );
    const views = await Promise.all(lines.map(pollLine));
    appState.liveVehicles.set(views.flat());
    appState.lastLiveUpdate.set(Date.now());
  };
  appState.selectedLines.subscribe(() => void poll());
  appState.itinerary.subscribe(() => void poll());
  globalThis.setInterval(() => void poll(), POLL_MS);
};
