import type { Map as MapLibreMap } from 'maplibre-gl';
import { loadLines } from '../../lib/data/load-lines.ts';
import { routePathOf } from '../../lib/data/route-path-of.ts';
import type { RoutePath } from '../../lib/map/to-route-lines-geojson.ts';
import { toRouteLinesGeojson } from '../../lib/map/to-route-lines-geojson.ts';
import { servedStopIds } from '../../lib/lines/served-stop-ids.ts';
import { appState } from '../../lib/store/app-state.ts';
import type { MapData } from './map-data.ts';
import { setSourceData } from './set-source-data.ts';

/**
 * React to line selection (live-map US-2): draw selected routes,
 * dim unrelated stops, leave the full network when nothing selected.
 */
export const applySelection = async (
  map: MapLibreMap,
  data: MapData,
): Promise<void> => {
  const selected = appState.selectedLines.get();
  const lines = (await loadLines()).filter((line) => selected.has(line.key));
  const paths = await Promise.all(
    lines.flatMap((line) => [1, 2].map((dir) => routePathOf(line, dir))),
  );
  setSourceData(
    map,
    'route-lines',
    toRouteLinesGeojson(
      paths.filter((path): path is RoutePath => path !== undefined),
    ),
  );
  const served = servedStopIds(selected, data.stops, data.schedule);
  data.stops.forEach((stop, index) =>
    map.setFeatureState(
      { source: 'stops', id: index },
      { dimmed: selected.size > 0 && !served.has(stop.id) },
    ),
  );
};
