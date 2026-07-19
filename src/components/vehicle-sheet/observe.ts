import type { Stop } from '../../lib/amt/types.ts';
import { loadStops } from '../../lib/data/load-stops.ts';
import type { FleetTarget } from '../../lib/fleet/fleet-target.ts';
import { appState } from '../../lib/store/app-state.ts';

const REFRESH_MS = 10000;

/** The slice of the sheet element this wiring drives. */
export interface VehicleSheetHost {
  stops: ReadonlyMap<string, Stop>;
  target: FleetTarget | undefined;
  me: { readonly lon: number; readonly lat: number } | undefined;
  collapsed: boolean;
  requestUpdate(): void;
}

const pick = (id: string | undefined): FleetTarget | undefined =>
  [id]
    .filter((value): value is string => value !== undefined)
    .map((value) => appState.fleetTargets.get().get(value))[0];

/**
 * Bind the host to the active vehicle's live target: load stops, follow
 * selection, track the user's position, expand on every fresh tap, and
 * re-render on a timer so positions and ETAs keep advancing.
 */
export const observeVehicleSheet = (host: VehicleSheetHost): void => {
  void loadStops().then((stops) => {
    host.stops = new Map(stops.map((stop) => [stop.id, stop]));
  });
  appState.mePosition.subscribe((position) => {
    host.me = position;
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
