import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { appState } from '../../lib/store/app-state.ts';
import { pruneSnapshots } from '../../lib/vehicles/live-snapshot.ts';
import { pollAmbient } from './poll-ambient.ts';

const AMBIENT_TTL_SECONDS = 90;

/**
 * Ambient sweeps accumulate: each cycle covers a different set of
 * stops/lines, and earlier discoveries stay alive for the TTL
 * instead of vanishing on the next rotation (live-map US-1).
 */
export const accumulateAmbient = async (cycle: number): Promise<void> => {
  const fresh = await pollAmbient(cycle);
  appState.liveSnapshots.set([
    ...pruneSnapshots(
      appState.liveSnapshots.get(),
      romeClock(new Date()).seconds,
      AMBIENT_TTL_SECONDS,
    ),
    ...fresh,
  ]);
};
