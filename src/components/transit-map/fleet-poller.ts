import { branch } from '../../lib/branch.ts';
import { fleetPaths } from '../../lib/data/fleet-paths.ts';
import { loadLineStops } from '../../lib/data/load-line-stops.ts';
import { loadStops } from '../../lib/data/load-stops.ts';
import { fleetPlan } from '../../lib/fleet/fleet-plan.ts';
import { mergeSightings } from '../../lib/fleet/merge-sightings.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { appState } from '../../lib/store/app-state.ts';
import { normalizeLineLabel } from '../../lib/vehicles/normalize-line-label.ts';
import { templateLineOf } from '../../lib/fleet/template-line-of.ts';
import { fetchStopArrivals } from './fetch-stop-arrivals.ts';

const STRIDE = 6;
const PORTION = 90;
const TICK_MS = 15000;
const TTL_SECONDS = 240;

/**
 * City-wide fleet sweep (live-map US-1: EVERY bus). On boot the plan
 * (~900 stops) is swept back-to-back so the full fleet appears within
 * the first minute; afterwards a rotating portion refreshes every
 * tick. Re-polled stops replace their rows; the rest survive within
 * the TTL, so the whole fleet stays on the map with parametric,
 * continuously advancing positions.
 */
export const startFleetPoller = (): void => {
  const state = { plan: [] as readonly string[], cursor: 0, running: false };
  const portion = async (): Promise<void> => {
    const rotation = state.plan.slice(state.cursor, state.cursor + PORTION);
    state.cursor = (state.cursor + PORTION) % Math.max(state.plan.length, 1);
    // Hot stops first: every tracked vehicle's next stop refreshes
    // each tick, so corrections stay small instead of accumulating
    // over the ~2.5 min the rotation needs to come back around.
    const slice = [...new Set([...appState.hotStops.get(), ...rotation])];
    const fresh = await fetchStopArrivals(slice);
    const merged = mergeSightings(
      appState.fleetSightings.get(),
      fresh,
      romeClock(new Date()).seconds,
      TTL_SECONDS,
    );
    appState.fleetSightings.set(merged);
    fleetPaths.ensure(
      new Set(
        merged.map(({ row }) => templateLineOf(normalizeLineLabel(row.line))),
      ),
    );
    appState.lastLiveUpdate.set(Date.now());
  };
  const tick = (): void =>
    // Hidden tabs skip the sweep entirely — a backgrounded client
    // must not burn the worker-invocation quota (rows expire by TTL
    // and refill on the first visible tick).
    branch(state.running || state.plan.length === 0 || document.hidden)(
      () => undefined,
      () => {
        state.running = true;
        void portion()
          .catch(() => undefined)
          .finally(() => {
            state.running = false;
          });
      },
    );
  void (async () => {
    const [stops, refs] = await Promise.all([loadStops(), loadLineStops()]);
    state.plan = fleetPlan(stops, refs, STRIDE);
    state.running = true;
    const portions = Math.ceil(state.plan.length / PORTION);
    await Array.from({ length: portions }).reduce<Promise<void>>(
      (chain) => chain.then(() => portion().catch(() => undefined)),
      Promise.resolve(),
    );
    state.running = false;
  })();
  globalThis.setInterval(tick, TICK_MS);
};
