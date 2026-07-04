import { itineraryLines } from '../../lib/route/itinerary-lines.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { scheduleVehicles } from '../../lib/schedule/schedule-vehicles.ts';
import { appState } from '../../lib/store/app-state.ts';
import { dedupeVehicles } from '../../lib/vehicles/dedupe-vehicles.ts';
import { inferBusVehicles } from '../../lib/vehicles/infer-bus-vehicles.ts';
import { normalizeLineLabel } from '../../lib/vehicles/normalize-line-label.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';
import type { MapData } from './map-data.ts';

/**
 * Vehicles to draw this tick: timetable-positioned fleet filtered by
 * the line selection (live-map US-1, US-2). Live inferred buses are
 * merged in by the live poller via appState (design §2).
 */
export const vehiclesNow = (data: MapData): readonly VehicleView[] => {
  const selected = appState.selectedLines.get();
  const routeLines = itineraryLines(appState.itinerary.get());
  const clock = romeClock(new Date());
  const dim = (vehicle: VehicleView): VehicleView => ({
    ...vehicle,
    dimmed:
      routeLines.size > 0 &&
      !routeLines.has(normalizeLineLabel(vehicle.label)),
  });
  return [
    ...scheduleVehicles(data.schedule, clock).filter(
      (vehicle) => selected.size === 0 || selected.has(vehicle.lineKey),
    ),
    // Snapshots are appended oldest-first, so deduping by vehicle id
    // keeps the freshest sighting of each NumeroSociale.
    ...dedupeVehicles(
      appState.liveSnapshots
        .get()
        .flatMap((snapshot) =>
          inferBusVehicles(
            snapshot.context,
            snapshot.arrivals,
            clock.seconds,
            snapshot.fetchedAtSeconds,
          ),
        ),
    ),
  ].map(dim);
};
