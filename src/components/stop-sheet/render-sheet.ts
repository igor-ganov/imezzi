import { html, type TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import type { StopSheetHost } from './host.ts';
import { renderBoardRow } from './render-board-row.ts';

/** Sheet body: header, staleness note, departures board. */
export const renderSheet = (
  host: StopSheetHost,
  onClose: () => void,
): TemplateResult => html`
  <section class="sheet" aria-label="Stop departures">
    <header class="sheet-header">
      <h2 class="sheet-title">${host.stopName.toLowerCase()}</h2>
      <button class="chrome-btn sheet-close" aria-label="Close" @click=${onClose}>
        ✕
      </button>
    </header>
    ${branch(host.stale)(
      () =>
        html`<p class="sheet-note">Live feed unreachable — timetable only.</p>`,
      () => html``,
    )}
    ${branch(host.rows.length === 0)(
      () => html`<p class="sheet-note">No departures in the next hour.</p>`,
      () => html`<ul class="board">${host.rows.map(renderBoardRow)}</ul>`,
    )}
  </section>
`;
