import type { TemplateResult } from 'lit';
import type { Stop } from '../../lib/amt/types.ts';
import { branch } from '../../lib/branch.ts';
import type { FleetTarget } from '../../lib/fleet/fleet-target.ts';
import { lineDiagram } from '../../lib/fleet/line-diagram.ts';
import { vehicleBoard } from '../../lib/fleet/vehicle-board.ts';
import { renderVehicleSheet } from './render-vehicle-sheet.ts';
import { renderVehicleStrip } from './render-vehicle-strip.ts';

export interface ActiveVehicleProps {
  readonly target: FleetTarget;
  readonly stops: ReadonlyMap<string, Stop>;
  readonly me: { readonly lon: number; readonly lat: number } | undefined;
  readonly collapsed: boolean;
  readonly setCollapsed: (value: boolean) => void;
  readonly onClose: () => void;
}

const names = (stops: ReadonlyMap<string, Stop>): ReadonlyMap<string, string> =>
  new Map([...stops].map(([id, stop]) => [id, stop.name]));

/**
 * The active vehicle's sheet in one of two forms: the full stop board,
 * or — once collapsed — the metro-style line diagram. Both share a
 * close and each toggles into the other.
 */
export const renderActiveVehicle = (props: ActiveVehicleProps): TemplateResult => {
  const { target, stops, me, collapsed, setCollapsed, onClose } = props;
  const headsign = target.template?.lastStopName ?? '';
  return branch(collapsed)(
    () =>
      renderVehicleStrip(
        target.label,
        headsign,
        lineDiagram(target, stops, me, Date.now()),
        () => setCollapsed(false),
        onClose,
      ),
    () =>
      renderVehicleSheet(
        target.label,
        headsign,
        vehicleBoard(target, names(stops), Date.now()),
        () => setCollapsed(true),
        onClose,
      ),
  );
};
