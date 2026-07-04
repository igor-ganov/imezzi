import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { scheduleVehicles } from '../../lib/schedule/schedule-vehicles.ts';
import { appState } from '../../lib/store/app-state.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';
import type { MapData } from './map-data.ts';

/**
 * Vehicles to draw this tick: timetable-positioned fleet filtered by
 * the line selection (live-map US-1, US-2). Live inferred buses are
 * merged in by the live poller via appState (design §2).
 */
export const vehiclesNow = (data: MapData): readonly VehicleView[] => {
  const selected = appState.selectedLines.get();
  return scheduleVehicles(data.schedule, romeClock(new Date())).filter(
    (vehicle) => selected.size === 0 || selected.has(vehicle.lineKey),
  );
};
