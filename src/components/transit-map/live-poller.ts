import { branch } from '../../lib/branch.ts';
import { loadLines } from '../../lib/data/load-lines.ts';
import { itineraryLines } from '../../lib/route/itinerary-lines.ts';
import { appState } from '../../lib/store/app-state.ts';
import { normalizeLineLabel } from '../../lib/vehicles/normalize-line-label.ts';
import { pollAmbient } from './poll-ambient.ts';
import { pollTargeted } from './poll-targeted.ts';

const POLL_MS = 20000;

const run = async (cycle: number): Promise<void> => {
  const selected = appState.selectedLines.get();
  const routeLabels = itineraryLines(appState.itinerary.get());
  const targeted = (await loadLines()).filter(
    (line) =>
      line.mode === 'bus' &&
      (selected.has(line.key) ||
        routeLabels.has(normalizeLineLabel(line.label))),
  );
  const snapshots = await branch(targeted.length > 0)(
    () => pollTargeted(targeted),
    () => pollAmbient(cycle),
  );
  appState.liveSnapshots.set(snapshots);
  appState.lastLiveUpdate.set(Date.now());
};

/**
 * Live SIMON poll loop (design §2): targeted mode for selected or
 * itinerary lines, ambient viewport sweep otherwise. Single-flight —
 * overlapping triggers are dropped, and a failed cycle never wedges
 * the loop.
 */
export const startLivePoller = (): void => {
  const state = { cycle: 0, running: false };
  const poll = (): void =>
    branch(state.running)(
      () => undefined,
      () => {
        state.running = true;
        state.cycle += 1;
        void run(state.cycle)
          .catch(() => undefined)
          .finally(() => {
            state.running = false;
          });
      },
    );
  appState.selectedLines.subscribe(poll);
  appState.itinerary.subscribe(poll);
  appState.viewport.subscribe(() =>
    branch(appState.liveSnapshots.get().length === 0)(poll, () => undefined),
  );
  globalThis.setInterval(poll, POLL_MS);
};
