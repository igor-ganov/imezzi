import type { VehicleView } from './types.ts';

/**
 * One marker per vehicle id; later entries win, so callers order
 * inputs oldest-snapshot-first and fresh sightings replace stale
 * positions of the same NumeroSociale.
 */
export const dedupeVehicles = (
  views: readonly VehicleView[],
): readonly VehicleView[] =>
  Array.from(new Map(views.map((view) => [view.id, view])).values());
