import type { BoardRow } from '../../lib/arrivals/board-row.ts';
import { appState } from '../../lib/store/app-state.ts';

/**
 * A LIVE board row is a handle to its physical vehicle: tapping it
 * closes the stop board and opens that vehicle's stop sheet with the
 * selection ring — a deterministic UI path to a moving marker
 * (vehicle-sheet US-1).
 */
export const onRowClick = (row: BoardRow): void =>
  [row]
    .filter(({ vehicle, approximated }) => vehicle !== '' && !approximated)
    .forEach(({ vehicle }) => {
      appState.activeStopId.set(undefined);
      appState.activeVehicleId.set(`bus:${vehicle}`);
      appState.selectedVehicleId.set(`bus:${vehicle}`);
    });
