import type { Map as MapLibreMap } from 'maplibre-gl';
import { appState } from '../../lib/store/app-state.ts';

/** Stop interactivity on the padded hit layer (site AC-1.2). */
export const bindStopEvents = (map: MapLibreMap): void => {
  map.on('click', 'stops-hit', (event) => {
    const id = event.features?.[0]?.properties?.['id'];
    const picking = appState.pickMode.get() !== undefined;
    appState.activeStopId.set(
      { true: appState.activeStopId.get(), false: `${id ?? ''}` || undefined }[
        `${picking}`
      ],
    );
  });
  map.on('mouseenter', 'stops-hit', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'stops-hit', () => {
    map.getCanvas().style.cursor = '';
  });
};
