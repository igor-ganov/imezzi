import type { Map as MapLibreMap } from 'maplibre-gl';
import type { CivicHit } from '../../lib/civic/civic-hit.ts';
import { appState } from '../../lib/store/app-state.ts';

const title = (text: string): string =>
  text.toLowerCase().replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());

/** Civic layer clicks open the civic card (AC-1.2). */
export const bindCivicEvents = (map: MapLibreMap): void => {
  map.on('click', 'civics-circle', (event) => {
    const props = event.features?.[0]?.properties ?? {};
    const hit: CivicHit = {
      street: title(`${props['DESVIA'] ?? ''}`),
      display: `${title(`${props['DESVIA'] ?? ''}`)} ${props['TESTO'] ?? ''}`,
      red: props['COLORE'] === 'R',
      municipio: `${props['NOME_MUNICIPIO'] ?? ''}`,
      lon: event.lngLat.lng,
      lat: event.lngLat.lat,
      source: 'comune',
    };
    appState.activeCivic.set(hit);
  });
  map.on('mouseenter', 'civics-circle', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'civics-circle', () => {
    map.getCanvas().style.cursor = '';
  });
};
