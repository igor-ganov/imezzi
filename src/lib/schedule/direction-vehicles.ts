import type { VehicleView } from '../vehicles/types.ts';
import { segmentPosition } from './segment-position.ts';
import type { Schedule, ScheduleDirection, ScheduleLine } from './types.ts';

/** Vehicles of one line direction currently en route (⚠ timetable). */
export const directionVehicles = (
  schedule: Schedule,
  line: ScheduleLine,
  direction: ScheduleDirection,
  dirIndex: number,
  services: ReadonlySet<string>,
  seconds: number,
): readonly VehicleView[] => {
  const stops = direction.stops.map((stopId) => schedule.stops[stopId]);
  return Object.entries(direction.departures)
    .filter(([serviceId]) => services.has(serviceId))
    .flatMap(([serviceId, starts]) =>
      starts
        .map((start) => ({
          start,
          position: segmentPosition(stops, direction.offsets, seconds - start),
        }))
        .flatMap(({ start, position }) =>
          [position]
            .filter(
              (pos): pos is { readonly lat: number; readonly lon: number } =>
                pos !== undefined,
            )
            .map((pos) => ({
              id: `${line.id}:${dirIndex}:${serviceId}:${start}`,
              label: line.shortName,
              mode: line.mode,
              lineKey: line.id,
              lat: pos.lat,
              lon: pos.lon,
              approximated: true,
            })),
        ),
    );
};
