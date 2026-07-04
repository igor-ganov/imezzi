import { branch } from '../branch.ts';
import type { RoutePath } from '../map/to-route-lines-geojson.ts';
import type { ScheduleStop } from '../schedule/types.ts';
import type { UiLine } from '../lines/ui-line.ts';
import { loadGeometry } from './load-geometry.ts';
import { loadSchedule } from './load-schedule.ts';

const scheduleFallback = async (
  line: UiLine,
  direction: number,
): Promise<RoutePath | undefined> => {
  const schedule = await loadSchedule();
  const found = schedule.lines.find((entry) => entry.id === line.key);
  const path = (found?.directions[direction - 1]?.stops ?? [])
    .map((stopId) => schedule.stops[stopId])
    .filter((stop): stop is ScheduleStop => stop !== undefined)
    .map((stop): readonly [number, number] => [stop.lon, stop.lat]);
  return branch(path.length > 1)(
    () => ({ key: line.key, mode: line.mode, path }),
    () => undefined,
  );
};

/**
 * Route geometry for a line direction: AMT polyline when published
 * (buses by 3-digit code, MM/FGC/… by short name), else a straight
 * chain through its timetable stops (live-map design §4).
 */
export const routePathOf = async (
  line: UiLine,
  direction: number,
): Promise<RoutePath | undefined> => {
  const codes: Readonly<Record<string, string>> = {
    bus: line.key.split('-')[0] ?? '',
  };
  const geometry = await loadGeometry(codes[line.mode] ?? line.label, direction);
  return branch(geometry !== undefined)<Promise<RoutePath | undefined>>(
    () =>
      Promise.resolve({
        key: line.key,
        mode: line.mode,
        path: geometry?.path ?? [],
      }),
    () => scheduleFallback(line, direction),
  );
};
