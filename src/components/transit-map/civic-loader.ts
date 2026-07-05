import type { Map as MapLibreMap } from 'maplibre-gl';
import { fetchJson } from '../../lib/api/fetch-json.ts';
import { branch } from '../../lib/branch.ts';
import { tilesInBbox } from '../../lib/civic/tile-key.ts';
import type {
  WfsCivicFeature,
  WfsCivicResponse,
} from '../../lib/civic/wfs-types.ts';
import { wfsUrl } from '../../lib/civic/wfs-url.ts';
import { poolMap } from '../../lib/pool-map.ts';
import { setSourceData } from './set-source-data.ts';

const MIN_ZOOM = 16.5;
const TILES_PER_MOVE = 12;
const PARALLEL = 4;

/**
 * Stream civic numbers into the map per viewport grid cell, with a
 * session cache so revisited areas cost nothing (AC-1.3).
 */
export const startCivicLoader = (map: MapLibreMap): void => {
  const seen = new Set<string>();
  const features: WfsCivicFeature[] = [];
  const sync = async (): Promise<void> => {
    await branch(map.getZoom() >= MIN_ZOOM)(
      async () => {
        const bounds = map.getBounds();
        const tiles = tilesInBbox(
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ).filter(([key]) => !seen.has(key));
        const batches = await poolMap(
          tiles.slice(0, TILES_PER_MOVE),
          PARALLEL,
          async ([key, bbox]) => {
            seen.add(key);
            return fetchJson<WfsCivicResponse>(
              wfsUrl({ bbox, count: 2000 }),
            ).catch((): WfsCivicResponse => ({ features: [] }));
          },
        );
        features.push(...batches.flatMap((batch) => batch.features));
        setSourceData(map, 'civics', {
          type: 'FeatureCollection',
          features,
        });
      },
      () => Promise.resolve(),
    );
  };
  map.on('moveend', () => void sync());
  map.on('load', () => void sync());
  // A theme switch replaces the style: sources are recreated EMPTY
  // while the tile cache says "already loaded" — push the collected
  // features back once the new style has its layers (as in the
  // reference map's restoreCivics-on-styledata).
  map.on('styledata', () =>
    setSourceData(map, 'civics', { type: 'FeatureCollection', features }),
  );
};
