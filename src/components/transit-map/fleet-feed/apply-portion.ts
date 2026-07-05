import { fleetPaths } from '../../../lib/data/fleet-paths.ts';
import { mergeSightings } from '../../../lib/fleet/merge-sightings.ts';
import type { FleetSighting } from '../../../lib/fleet/types.ts';
import { romeClock } from '../../../lib/schedule/rome-clock.ts';
import { appState } from '../../../lib/store/app-state.ts';
import { normalizeLineLabel } from '../../../lib/vehicles/normalize-line-label.ts';
import { templateLineOf } from '../../../lib/fleet/template-line-of.ts';

const TTL_SECONDS = 240;

/** Merge one hub portion into the store (same TTL as the poller). */
export const applyPortion = (fresh: readonly FleetSighting[]): void => {
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
