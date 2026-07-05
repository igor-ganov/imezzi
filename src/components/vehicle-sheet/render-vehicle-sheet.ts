import { html, type TemplateResult } from 'lit';
import type { VehicleBoardRow } from '../../lib/fleet/vehicle-board.ts';

const minutes = (etaSeconds: number): string =>
  `${Math.max(Math.round(etaSeconds / 60), 0)} min`;

/** Vehicle sheet body: line header + remaining stops board. */
export const renderVehicleSheet = (
  label: string,
  headsign: string,
  rows: readonly VehicleBoardRow[],
  onClose: () => void,
): TemplateResult => html`
  <section
    class="sheet"
    data-testid="vehicle-sheet"
    aria-label="Vehicle stops"
  >
    <header class="sheet-header">
      <h2 class="sheet-title" data-testid="vehicle-sheet-title">
        <span class="line-badge" style="--mode-hue: 210">${label}</span>
        → ${headsign.toLowerCase()}
      </h2>
      <button
        class="chrome-btn sheet-close"
        data-testid="vehicle-sheet-close"
        aria-label="Close"
        @click=${onClose}
      >
        ✕
      </button>
    </header>
    <ul class="board">
      ${rows.map(
        (row) => html`
          <li class="board-row" data-testid="vehicle-stop-row">
            <span class="board-line">${row.name.toLowerCase()}</span>
            <span class="board-eta">
              <strong>${minutes(row.etaSeconds)}</strong>
              <small>${row.arrival}</small>
            </span>
          </li>
        `,
      )}
    </ul>
  </section>
`;
