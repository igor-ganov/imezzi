import {
  carryTargets,
  type TargetCarry,
} from '../../lib/fleet/carry-targets.ts';
import type { FleetMemory } from '../../lib/fleet/fleet-memory.ts';
import type { FleetTarget } from '../../lib/fleet/fleet-target.ts';
import { hotStops } from '../../lib/fleet/hot-stops.ts';
import { inferFleet } from '../../lib/fleet/infer-fleet.ts';
import { fleetPaths } from '../../lib/data/fleet-paths.ts';
import { itineraryLines } from '../../lib/route/itinerary-lines.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { scheduleVehicles } from '../../lib/schedule/schedule-vehicles.ts';
import { appState } from '../../lib/store/app-state.ts';
import { normalizeLineLabel } from '../../lib/vehicles/normalize-line-label.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';
import type { MapData } from './map-data.ts';

export interface FleetFrame {
  readonly schedule: readonly VehicleView[];
  readonly targets: readonly FleetTarget[];
  /** Targets backed by current data (invariant side); rest = ghosts. */
  readonly freshCount: number;
  readonly coords: ReadonlyMap<string, readonly [number, number]>;
}

/** Cross-tick continuity for sticky directions / monotonic progress. */
const memory = { current: new Map() as FleetMemory };
/** Target continuity across brief data dropouts (grace period). */
const carried = { current: new Map() as TargetCarry };

/**
 * One data tick: timetable-positioned non-bus views + timeline
 * targets for the live fleet, filtered by selection, dimmed by
 * route mode (US-1, US-2, route US-3).
 */
export const fleetFrame = (data: MapData): FleetFrame => {
  const selectedKeys = appState.selectedLines.get();
  const selectedLabels = appState.selectedLabels.get();
  const routeLabels = itineraryLines(appState.itinerary.get());
  const clock = romeClock(new Date());
  const inRoute = (label: string): boolean =>
    routeLabels.size === 0 || routeLabels.has(normalizeLineLabel(label));
  const fleet = inferFleet(
    appState.fleetSightings.get(),
    data.busOffsets,
    data.stopCoords,
    clock.seconds,
    fleetPaths.get,
    memory.current,
  );
  memory.current = fleet.memory;
  const { targets, carry } = carryTargets(
    carried.current,
    fleet.targets,
    clock.seconds,
  );
  carried.current = carry;
  appState.hotStops.set(hotStops(targets, 30));
  return {
    schedule: scheduleVehicles(data.schedule, clock)
      .filter(
        (vehicle) =>
          selectedKeys.size === 0 || selectedKeys.has(vehicle.lineKey),
      )
      .map((vehicle) => ({ ...vehicle, dimmed: !inRoute(vehicle.label) })),
    targets: targets
      .filter(
        (target) =>
          selectedLabels.size === 0 || selectedLabels.has(target.label),
      )
      .map((target) => ({ ...target, dimmed: !inRoute(target.label) })),
    freshCount: fleet.targets.length,
    coords: data.stopCoords,
  };
};
