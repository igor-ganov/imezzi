import type { Map as MapLibreMap } from 'maplibre-gl';
import { branch } from '../../lib/branch.ts';
import type { Place } from '../../lib/route/types.ts';
import { appState } from '../../lib/store/app-state.ts';

/** Map clicks set the pending route endpoint (route-planner US-1). */
export const bindPickMode = (map: MapLibreMap): void => {
  map.on('click', (event) => {
    const mode = appState.pickMode.get();
    const place: Place = {
      name: `Point ${event.lngLat.lat.toFixed(4)}, ${event.lngLat.lng.toFixed(4)}`,
      lat: event.lngLat.lat,
      lon: event.lngLat.lng,
    };
    const setters: Readonly<Record<string, () => void>> = {
      origin: () => appState.origin.set(place),
      destination: () => appState.destination.set(place),
    };
    branch(mode !== undefined)(
      () => {
        setters[mode ?? '']?.();
        appState.pickMode.set(undefined);
      },
      () => undefined,
    );
  });
};
