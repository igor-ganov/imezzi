import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Observation handle: the live map joins __imezzi (next to appState)
 * so debugging sessions and E2E position probes can project
 * rendered features to screen pixels. The cast sits on the
 * globalThis boundary.
 */
export const exposeMap = (map: MapLibreMap): void => {
  const bag =
    (globalThis as { readonly __imezzi?: Record<string, unknown> }).__imezzi ??
    {};
  Object.assign(bag, { map });
};
