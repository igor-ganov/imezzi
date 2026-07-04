import { inferFleet } from '../../lib/fleet/infer-fleet.ts';
import { itineraryLines } from '../../lib/route/itinerary-lines.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { scheduleVehicles } from '../../lib/schedule/schedule-vehicles.ts';
import { appState } from '../../lib/store/app-state.ts';
import { normalizeLineLabel } from '../../lib/vehicles/normalize-line-label.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';
import type { MapData } from './map-data.ts';

/**
 * Vehicles to draw this tick: the full live fleet (inferred from the
 * city sweep) + timetable-positioned non-bus modes, filtered by the
 * line selection, dimmed by route mode (US-1, US-2, route US-3).
 */
export const vehiclesNow = (data: MapData): readonly VehicleView[] => {
  const selectedKeys = appState.selectedLines.get();
  const selectedLabels = appState.selectedLabels.get();
  const routeLabels = itineraryLines(appState.itinerary.get());
  const clock = romeClock(new Date());
  const dim = (vehicle: VehicleView): VehicleView => ({
    ...vehicle,
    dimmed:
      routeLabels.size > 0 &&
      !routeLabels.has(normalizeLineLabel(vehicle.label)),
  });
  return [
    ...scheduleVehicles(data.schedule, clock).filter(
      (vehicle) =>
        selectedKeys.size === 0 || selectedKeys.has(vehicle.lineKey),
    ),
    ...inferFleet(
      appState.fleetSightings.get(),
      data.busOffsets,
      data.stopCoords,
      clock.seconds,
    ).filter(
      (vehicle) =>
        selectedLabels.size === 0 || selectedLabels.has(vehicle.label),
    ),
  ].map(dim);
};
