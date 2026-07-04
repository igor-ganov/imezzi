import { branch } from '../../lib/branch.ts';
import { loadLineStops } from '../../lib/data/load-line-stops.ts';
import { loadStops } from '../../lib/data/load-stops.ts';
import { fleetPlan } from '../../lib/fleet/fleet-plan.ts';
import { mergeSightings } from '../../lib/fleet/merge-sightings.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { appState } from '../../lib/store/app-state.ts';
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
    const slice = state.plan.slice(state.cursor, state.cursor + PORTION);
    state.cursor = (state.cursor + PORTION) % Math.max(state.plan.length, 1);
    const fresh = await fetchStopArrivals(slice);
    appState.fleetSightings.set(
      mergeSightings(
        appState.fleetSightings.get(),
        fresh,
        romeClock(new Date()).seconds,
        TTL_SECONDS,
      ),
    );
    appState.lastLiveUpdate.set(Date.now());
  };
  const tick = (): void =>
    branch(state.running || state.plan.length === 0)(
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
