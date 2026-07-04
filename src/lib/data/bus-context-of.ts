import type { BusLineContext } from '../vehicles/bus-line-context.ts';
import type { UiLine } from '../lines/ui-line.ts';
import { loadGeometry } from './load-geometry.ts';
import { loadLineStops } from './load-line-stops.ts';
import { loadStops } from './load-stops.ts';

const cache = new Map<string, Promise<BusLineContext>>();

const build = async (line: UiLine): Promise<BusLineContext> => {
  const [refs, stops] = await Promise.all([loadLineStops(), loadStops()]);
  const code = line.key.split('-')[0] ?? '';
  const geometries = await Promise.all([loadGeometry(code, 1), loadGeometry(code, 2)]);
  const stopById = new Map(stops.map((stop) => [stop.id, stop]));
  const directions = [1, 2]
    .map((dir) => {
      const stopIds = refs
        .filter((ref) => ref.lineId === line.key && ref.direction === dir)
        .sort((a, b) => a.position - b.position)
        .map((ref) => ref.stopId);
      return {
        dir,
        stopIds,
        lastStopName:
          stopById.get(stopIds[stopIds.length - 1] ?? '')?.name ?? '',
        path: geometries[dir - 1]?.path ?? [],
      };
    })
    .filter((direction) => direction.stopIds.length > 0);
  const allIds = [...new Set(directions.flatMap((d) => d.stopIds))];
  return {
    key: line.key,
    label: line.label,
    directions,
    stopCoords: Object.fromEntries(
      allIds.map((id) => {
        const stop = stopById.get(id);
        return [id, stop && [stop.lon, stop.lat]];
      }),
    ),
    monitoredStopIds: allIds.filter((id) => stopById.get(id)?.monitored ?? false),
  };
};

/** Cached per-line context for live vehicle inference. */
export const busContextOf = (line: UiLine): Promise<BusLineContext> => {
  const cached = cache.get(line.key) ?? build(line);
  cache.set(line.key, cached);
  return cached;
};
