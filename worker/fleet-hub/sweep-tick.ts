import type { HubSocket, HubState } from '../do-types.ts';
import { nextSlice } from './rotation.ts';
import { runSweep } from './run-sweep.ts';
import { pushTick, type TickEntry } from './tick-log.ts';

const PORTION = 45;
const TICK_MS = 5000;
const BACKOFF_MS = 30000;
const BACKOFF_AFTER = 3;

export interface SweepCursor {
  readonly cursor: number;
  readonly emptyStreak: number;
}

/**
 * One alarm tick: rotate, poll, broadcast, log (with anomaly stamp),
 * re-arm — 5 s normally, 30 s after three consecutive empty polls so
 * an upstream outage stops burning quota.
 */
export const sweepTick = async (
  state: HubState,
  sockets: readonly HubSocket[],
  plan: readonly string[],
  at: SweepCursor,
  hot: readonly string[],
): Promise<SweepCursor> => {
  const { slice, cursor } = nextSlice(plan, at.cursor, hot, PORTION);
  const result = await runSweep(slice, sockets);
  const emptyStreak =
    { true: at.emptyStreak + 1, false: 0 }[
      `${result.sightings.length === 0}`
    ] ?? 0;
  const log = pushTick(
    (await state.storage.get<readonly TickEntry[]>('log')) ?? [],
    {
      t: Date.now(),
      stops: slice.length,
      sightings: result.sightings.length,
      vehicles: result.vehicles,
      ms: result.ms,
      sockets: sockets.length,
    },
  );
  await state.storage.put('log', log);
  const delay =
    { true: BACKOFF_MS, false: TICK_MS }[
      `${emptyStreak >= BACKOFF_AFTER}`
    ] ?? TICK_MS;
  state.storage.setAlarm(Date.now() + delay);
  return { cursor, emptyStreak };
};
