import type { TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import type { FleetTarget } from '../../lib/fleet/fleet-target.ts';
import { vehicleBoard } from '../../lib/fleet/vehicle-board.ts';
import { vehicleStrip } from '../../lib/fleet/vehicle-strip.ts';
import { renderVehicleSheet } from './render-vehicle-sheet.ts';
import { renderVehicleStrip } from './render-vehicle-strip.ts';

/**
 * The active vehicle's sheet in one of two forms: the full stop board
 * or, once collapsed, the metro-style line strip. Both share the same
 * close, and each toggles into the other.
 */
export const renderActiveVehicle = (
  target: FleetTarget,
  names: ReadonlyMap<string, string>,
  collapsed: boolean,
  setCollapsed: (value: boolean) => void,
  onClose: () => void,
): TemplateResult => {
  const headsign = target.template?.lastStopName ?? '';
  return branch(collapsed)(
    () =>
      renderVehicleStrip(
        target.label,
        headsign,
        vehicleStrip(target, names, Date.now()),
        () => setCollapsed(false),
        onClose,
      ),
    () =>
      renderVehicleSheet(
        target.label,
        headsign,
        vehicleBoard(target, names, Date.now()),
        () => setCollapsed(true),
        onClose,
      ),
  );
};
