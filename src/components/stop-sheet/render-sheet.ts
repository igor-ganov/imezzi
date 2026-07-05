import { html, type TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { renderRouteButton } from '../shared/render-route-button.ts';
import type { StopSheetHost } from './host.ts';
import { renderBoardRow } from './render-board-row.ts';
import { STOP_SHEET_LOCATORS } from './stop-sheet.locators.ts';

/** Sheet body: header, route-here, staleness note, departures. */
export const renderSheet = (
  host: StopSheetHost,
  onClose: () => void,
  onRoute: () => void,
): TemplateResult => html`
  <section
    class="sheet"
    data-testid=${STOP_SHEET_LOCATORS.sheet}
    aria-label="Stop departures"
  >
    <header class="sheet-header">
      <h2 class="sheet-title" data-testid=${STOP_SHEET_LOCATORS.title}>
        ${host.stopName.toLowerCase()}
      </h2>
      ${renderRouteButton(
        STOP_SHEET_LOCATORS.route,
        'Route to this stop',
        onRoute,
      )}
      <button
        class="chrome-btn sheet-close"
        data-testid=${STOP_SHEET_LOCATORS.close}
        aria-label="Close"
        @click=${onClose}
      >
        ✕
      </button>
    </header>
    ${branch(host.stale)(
      () =>
        html`<p class="sheet-note" data-testid=${STOP_SHEET_LOCATORS.note}>
          Live feed unreachable — timetable only.
        </p>`,
      () => html``,
    )}
    ${branch(host.rows.length === 0)(
      () =>
        html`<p class="sheet-note" data-testid=${STOP_SHEET_LOCATORS.note}>
          No departures in the next hour.
        </p>`,
      () => html`<ul class="board">${host.rows.map(renderBoardRow)}</ul>`,
    )}
  </section>
`;
