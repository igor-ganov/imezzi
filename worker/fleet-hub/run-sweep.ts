import type { FleetSighting } from '../../src/lib/fleet/types.ts';
import type { HubSocket } from '../do-types.ts';
import { pollPortion } from './poll-portion.ts';

export interface SweepResult {
  readonly sightings: readonly FleetSighting[];
  readonly vehicles: number;
  readonly ms: number;
}

/** Poll one slice, broadcast it, measure the tick. */
export const runSweep = async (
  slice: readonly string[],
  sockets: readonly HubSocket[],
): Promise<SweepResult> => {
  const started = Date.now();
  const sightings = await pollPortion(slice);
  const payload = JSON.stringify({ type: 'portion', sightings });
  sockets.forEach((socket) => socket.send(payload));
  return {
    sightings,
    vehicles: new Set(
      sightings
        .map(({ row }) => row.vehicle)
        .filter((vehicle) => vehicle !== ''),
    ).size,
    ms: Date.now() - started,
  };
};
