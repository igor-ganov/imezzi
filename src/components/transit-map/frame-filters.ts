import type { FleetTarget } from '../../lib/fleet/fleet-target.ts';
import { normalizeLineLabel } from '../../lib/vehicles/normalize-line-label.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';

export interface FrameFilters {
  readonly selectedKeys: ReadonlySet<string>;
  readonly selectedLabels: ReadonlySet<string>;
  readonly routeLabels: ReadonlySet<string>;
}

const dimOf = (filters: FrameFilters, label: string): boolean =>
  filters.routeLabels.size > 0 &&
  !filters.routeLabels.has(normalizeLineLabel(label));

/** Selection filters + route-mode dimming for a frame's two halves. */
export const frameFilters = {
  schedule: (
    views: readonly VehicleView[],
    filters: FrameFilters,
  ): readonly VehicleView[] =>
    views
      .filter(
        (vehicle) =>
          filters.selectedKeys.size === 0 ||
          filters.selectedKeys.has(vehicle.lineKey),
      )
      .map((vehicle) => ({
        ...vehicle,
        dimmed: dimOf(filters, vehicle.label),
      })),
  targets: (
    targets: readonly FleetTarget[],
    filters: FrameFilters,
  ): readonly FleetTarget[] =>
    targets
      .filter(
        (target) =>
          filters.selectedLabels.size === 0 ||
          filters.selectedLabels.has(target.label),
      )
      .map((target) => ({ ...target, dimmed: dimOf(filters, target.label) })),
};
