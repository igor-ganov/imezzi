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
import { matchItineraryLegs } from '../../lib/route/match-itinerary-legs.ts';
import { parkedLegViews } from '../../lib/route/parked-leg-views.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { scheduleVehicles } from '../../lib/schedule/schedule-vehicles.ts';
import { appState } from '../../lib/store/app-state.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';
import { frameFilters } from './frame-filters.ts';
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
 * targets for the live fleet + parked pictograms for unmatched
 * itinerary legs, filtered by selection, dimmed by route mode.
 */
export const fleetFrame = (data: MapData): FleetFrame => {
  const filters = {
    selectedKeys: appState.selectedLines.get(),
    selectedLabels: appState.selectedLabels.get(),
    routeLabels: itineraryLines(appState.itinerary.get()),
  };
  const clock = romeClock(new Date());
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
  appState.fleetTargets.set(
    new Map(targets.map((target) => [target.id, target])),
  );
  const itinerary = appState.itinerary.get();
  const legMatches = matchItineraryLegs(targets, itinerary, Date.now());
  appState.legVehicles.set(legMatches);
  return {
    schedule: frameFilters.schedule(
      [
        ...scheduleVehicles(data.schedule, clock),
        ...parkedLegViews(itinerary, legMatches),
      ],
      filters,
    ),
    targets: frameFilters.targets(targets, filters),
    freshCount: fleet.targets.length,
    coords: data.stopCoords,
  };
};
