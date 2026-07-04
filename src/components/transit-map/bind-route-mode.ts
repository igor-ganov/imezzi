import type { LngLatBounds, Map as MapLibreMap } from 'maplibre-gl';
import { LngLatBounds as Bounds } from 'maplibre-gl';
import { appState } from '../../lib/store/app-state.ts';
import type { Itinerary } from '../../lib/route/types.ts';
import { setSourceData } from './set-source-data.ts';

const routeFeatures = (itinerary: Itinerary | undefined) =>
  (itinerary?.legs ?? []).map((leg) => ({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: leg.geometry },
    properties: { mode: leg.mode },
  }));

const boundsOf = (
  coords: readonly (readonly [number, number])[],
): LngLatBounds =>
  coords.reduce(
    (bounds, coord) => bounds.extend([coord[0], coord[1]]),
    new Bounds(),
  );

/** Route mode (US-3): draw the itinerary, zoom on it, focus legs. */
export const bindRouteMode = (map: MapLibreMap): void => {
  appState.itinerary.subscribe((itinerary) => {
    setSourceData(map, 'route', {
      type: 'FeatureCollection',
      features: routeFeatures(itinerary),
    });
    const coords = (itinerary?.legs ?? []).flatMap((leg) => leg.geometry);
    [coords]
      .filter((list) => list.length > 1)
      .forEach((list) =>
        map.fitBounds(boundsOf(list), { padding: 72, duration: 900 }),
      );
  });
  appState.focusLeg.subscribe((leg) =>
    [leg?.geometry ?? []]
      .filter((coords) => coords.length > 1)
      .forEach((coords) =>
        map.fitBounds(boundsOf(coords), { padding: 88, duration: 700 }),
      ),
  );
};
