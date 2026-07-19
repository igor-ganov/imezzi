import { loadStops } from '../../lib/data/load-stops.ts';
import type { FleetTarget } from '../../lib/fleet/fleet-target.ts';
import { appState } from '../../lib/store/app-state.ts';

const REFRESH_MS = 10000;

/** The slice of the sheet element this wiring drives. */
export interface VehicleSheetHost {
  names: ReadonlyMap<string, string>;
  target: FleetTarget | undefined;
  collapsed: boolean;
  requestUpdate(): void;
}

const pick = (id: string | undefined): FleetTarget | undefined =>
  [id]
    .filter((value): value is string => value !== undefined)
    .map((value) => appState.fleetTargets.get().get(value))[0];

/**
 * Bind the host to the active vehicle's live target: load stop names,
 * follow selection, expand on every fresh tap, and re-render on a
 * timer so wall-clock ETAs keep ticking down.
 */
export const observeVehicleSheet = (host: VehicleSheetHost): void => {
  void loadStops().then((stops) => {
    host.names = new Map(stops.map((stop) => [stop.id, stop.name]));
  });
  appState.activeVehicleId.subscribe((id) => {
    host.collapsed = false;
    host.target = pick(id);
  });
  appState.fleetTargets.subscribe(() => {
    host.target = pick(appState.activeVehicleId.get()) ?? host.target;
  });
  setInterval(() => host.requestUpdate(), REFRESH_MS);
};
