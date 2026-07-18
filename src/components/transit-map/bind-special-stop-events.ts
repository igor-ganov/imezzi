import type { Map as MapLibreMap } from 'maplibre-gl';
import { branch } from '../../lib/branch.ts';
import { appState } from '../../lib/store/app-state.ts';

/**
 * Non-bus stations open the same board sheet as bus stops — but with
 * only their GTFS timetable (no SIMON feed for funiculars / lifts /
 * metro), which scheduleBoardRows already supplies for any stop id.
 */
export const bindSpecialStopEvents = (map: MapLibreMap): void => {
  map.on('click', 'special-stops-hit', (event) => {
    const id = event.features?.[0]?.properties?.['id'];
    const picking = appState.pickMode.get() !== undefined;
    branch(picking)(
      () => undefined,
      () => appState.activeStopId.set(`${id ?? ''}` || undefined),
    );
  });
  map.on('mouseenter', 'special-stops-hit', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'special-stops-hit', () => {
    map.getCanvas().style.cursor = '';
  });
};
